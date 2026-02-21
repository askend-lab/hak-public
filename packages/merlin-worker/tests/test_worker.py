"""Tests for Merlin TTS SQS Worker."""

import hashlib
import json
import os
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

TEST_WAV = "test.wav"
TEST_PROC_WAV = "test_proc.wav"
MERLIN_DIR = "/opt/merlin"
CHECK_TOOLS_PATCH = "worker.check_tools"

from worker import (
    WorkerConfig,
    SynthesisRequest,
    check_tools,
    synthesize_audio,
    upload_to_s3,
    process_message,
    run_worker,
    _apply_sox_effects,
    _cleanup_files,
)



class TestWorkerConfig:
    def test_from_env_defaults(self):
        with patch.dict(os.environ, {}, clear=True):
            cfg = WorkerConfig.from_env()
        assert cfg.queue_url == ""
        assert cfg.bucket_name == ""
        assert cfg.aws_region == "eu-west-1"
        assert cfg.merlin_dir == "/home/merlin_user/merlin_repo"
        assert cfg.temp_dir == "/home/merlin_user/temp"

    def test_from_env_custom(self):
        env = {
            "SQS_QUEUE_URL": "https://sqs.eu-west-1.amazonaws.com/123/q",
            "S3_BUCKET": "my-bucket",
            "AWS_REGION": "us-east-1",
            "MERLIN_DIR": MERLIN_DIR,
            "TEMP_DIR": "/tmp/merlin",
        }
        with patch.dict(os.environ, env, clear=True):
            cfg = WorkerConfig.from_env()
        assert cfg.queue_url == env["SQS_QUEUE_URL"]
        assert cfg.bucket_name == env["S3_BUCKET"]
        assert cfg.aws_region == "us-east-1"
        assert cfg.merlin_dir == MERLIN_DIR
        assert cfg.temp_dir == "/tmp/merlin"

    def test_src_dir_property(self):
        cfg = WorkerConfig("q", "b", "r", MERLIN_DIR, "/tmp")
        assert cfg.src_dir == f"{MERLIN_DIR}/src"

    def test_validate_missing_both(self):
        cfg = WorkerConfig("", "", "r", "d", "t")
        assert cfg.validate() == ["SQS_QUEUE_URL", "S3_BUCKET"]

    def test_validate_missing_queue(self):
        cfg = WorkerConfig("", "bucket", "r", "d", "t")
        assert cfg.validate() == ["SQS_QUEUE_URL"]

    def test_validate_missing_bucket(self):
        cfg = WorkerConfig("queue", "", "r", "d", "t")
        assert cfg.validate() == ["S3_BUCKET"]

    def test_validate_ok(self):
        cfg = WorkerConfig("queue", "bucket", "r", "d", "t")
        assert cfg.validate() == []



class TestSynthesisRequest:
    def test_from_message_full(self):
        msg = {
            "Body": json.dumps({
                "text": "tere",
                "voice": "efm_s",
                "speed": 1.5,
                "pitch": 100,
                "cacheKey": "a" * 64,
            })
        }
        req = SynthesisRequest.from_message(msg)
        assert req.text == "tere"
        assert req.voice == "efm_s"
        assert req.speed == 1.5
        assert req.pitch == 100
        assert req.cache_key == "a" * 64

    def test_from_message_defaults(self):
        msg = {"Body": json.dumps({"text": "tere"})}
        req = SynthesisRequest.from_message(msg)
        assert req.text == "tere"
        assert req.voice == "efm_l"
        assert req.speed == 1.0
        assert req.pitch == 0
        assert req.cache_key == hashlib.sha256(b"tere").hexdigest()

    @pytest.mark.parametrize("body,match", [
        ({}, "Missing or empty text"),
        ({"text": "   "}, "Missing or empty text"),
        ({"text": "x" * 10001}, "Text too long"),
        ({"text": "t", "speed": 5.0}, "Speed.*out of range"),
        ({"text": "t", "pitch": 9999}, "Pitch.*out of range"),
        ({"text": "t", "speed": "abc"}, "Invalid speed/pitch"),
    ])
    def test_from_message_validation(self, body, match):
        msg = {"Body": json.dumps(body)}
        with pytest.raises(ValueError, match=match):
            SynthesisRequest.from_message(msg)

    def test_from_message_invalid_json(self):
        msg = {"Body": "not json"}
        with pytest.raises(json.JSONDecodeError):
            SynthesisRequest.from_message(msg)



class TestCheckTools:
    def test_tools_present(self, tmp_path):
        tools = tmp_path / "tools"
        sptk = tools / "bin" / "SPTK-3.9"
        world = tools / "bin" / "WORLD"
        genlab = tools / "genlab" / "bin"
        for d in [sptk, world, genlab]:
            d.mkdir(parents=True)
        (sptk / "x2x").touch()

        check_tools(str(tmp_path))

    def test_tools_missing(self, tmp_path):
        check_tools(str(tmp_path))



class TestApplySoxEffects:
    def test_no_effects(self, tmp_path):
        wav = str(tmp_path / TEST_WAV)
        open(wav, "w").close()
        result = _apply_sox_effects(wav, speed=1.0, pitch=0, run_command=MagicMock())
        assert result == wav

    def test_speed_effect(self, tmp_path):
        wav = str(tmp_path / TEST_WAV)
        proc = str(tmp_path / TEST_PROC_WAV)
        open(wav, "w").close()

        def fake_run(cmd, **kw):
            open(proc, "w").close()

        result = _apply_sox_effects(wav, speed=1.5, pitch=0, run_command=fake_run)
        assert result == proc
        assert not os.path.exists(wav)

    def test_pitch_effect(self, tmp_path):
        wav = str(tmp_path / TEST_WAV)
        proc = str(tmp_path / TEST_PROC_WAV)
        open(wav, "w").close()

        def fake_run(cmd, **kw):
            open(proc, "w").close()

        result = _apply_sox_effects(wav, speed=1.0, pitch=100, run_command=fake_run)
        assert result == proc

    def test_both_effects(self, tmp_path):
        wav = str(tmp_path / TEST_WAV)
        proc = str(tmp_path / TEST_PROC_WAV)
        open(wav, "w").close()

        captured_cmd = {}

        def fake_run(cmd, **kw):
            captured_cmd["cmd"] = cmd
            open(proc, "w").close()

        _apply_sox_effects(wav, speed=0.8, pitch=-200, run_command=fake_run)
        cmd = captured_cmd["cmd"]
        assert "tempo" in cmd
        assert "0.8" in cmd
        assert "pitch" in cmd
        assert "-200" in cmd

    def test_sox_fails_returns_original(self, tmp_path):
        wav = str(tmp_path / TEST_WAV)
        open(wav, "w").close()

        result = _apply_sox_effects(wav, speed=1.5, pitch=0, run_command=MagicMock())
        assert result == wav



class TestCleanupFiles:
    def test_cleanup_existing(self, tmp_path):
        txt = str(tmp_path / "test.txt")
        wav = str(tmp_path / "test.wav")
        for f in [txt, wav]:
            open(f, "w").close()

        _cleanup_files(txt, wav)
        assert not os.path.exists(txt)
        assert not os.path.exists(wav)

    def test_cleanup_missing_no_error(self, tmp_path):
        _cleanup_files(str(tmp_path / "missing.txt"), str(tmp_path / "missing.wav"))



class TestSynthesizeAudio:
    @pytest.fixture
    def config(self, tmp_path):
        return WorkerConfig("q", "b", "r", str(tmp_path / "merlin"), str(tmp_path / "temp"))

    def test_success(self, config, tmp_path):
        wav_content = b"RIFF fake wav data"

        def fake_run(cmd, **kw):
            # Find the wav path from the command and create it
            # Extract temp dir to find where the wav should be
            temp_dir = config.temp_dir
            os.makedirs(temp_dir, exist_ok=True)
            # The wav file path is derived from the text file
            import glob
            for txt in glob.glob(os.path.join(temp_dir, "*.txt")):
                wav = txt.replace(".txt", ".wav")
                with open(wav, "wb") as f:
                    f.write(wav_content)
            return SimpleNamespace(returncode=0, stdout="", stderr="")

        result = synthesize_audio("tere", config, run_command=fake_run)
        assert result == wav_content

    def test_merlin_failure(self, config):
        def fake_run(cmd, **kw):
            return SimpleNamespace(returncode=1, stdout="", stderr="synthesis error")

        with pytest.raises(RuntimeError, match="Merlin failed"):
            synthesize_audio("tere", config, run_command=fake_run)

    def test_wav_not_generated(self, config):
        def fake_run(cmd, **kw):
            return SimpleNamespace(returncode=0, stdout="", stderr="")

        with pytest.raises(RuntimeError, match="WAV file not generated"):
            synthesize_audio("tere", config, run_command=fake_run)



class TestUploadToS3:
    def test_upload(self):
        s3_client = MagicMock()
        url = upload_to_s3(s3_client, "bucket", "eu-west-1", b"audio", "key123")

        s3_client.put_object.assert_called_once_with(
            Bucket="bucket",
            Key="cache/key123.wav",
            Body=b"audio",
            ContentType="audio/wav",
        )
        assert url == "https://bucket.s3.eu-west-1.amazonaws.com/cache/key123.wav"



class TestProcessMessage:
    @pytest.fixture
    def config(self, tmp_path):
        return WorkerConfig(
            "https://sqs.example.com/q", "bucket", "eu-west-1",
            str(tmp_path / "merlin"), str(tmp_path / "temp"),
        )

    def test_success(self, config, tmp_path):
        sqs_client = MagicMock()
        s3_client = MagicMock()
        message = {
            "Body": json.dumps({"text": "tere", "cacheKey": "a" * 64}),
            "ReceiptHandle": "receipt-1",
        }

        wav_data = b"RIFF wav"

        with patch("worker.synthesize_audio", return_value=wav_data):
            result = process_message(message, config, sqs_client, s3_client)

        assert result is True
        s3_client.put_object.assert_called_once()
        sqs_client.delete_message.assert_called_once_with(
            QueueUrl=config.queue_url, ReceiptHandle="receipt-1"
        )

    def test_synthesis_error(self, config):
        sqs_client = MagicMock()
        s3_client = MagicMock()
        message = {
            "Body": json.dumps({"text": "tere"}),
            "ReceiptHandle": "receipt-1",
        }

        with patch("worker.synthesize_audio", side_effect=RuntimeError("fail")):
            result = process_message(message, config, sqs_client, s3_client)

        assert result is False
        sqs_client.delete_message.assert_not_called()



class TestRunWorker:
    def test_missing_config_exits(self):
        cfg = WorkerConfig("", "", "r", "d", "t")
        with pytest.raises(SystemExit):
            run_worker(cfg, MagicMock(), MagicMock())

    def test_keyboard_interrupt_stops(self):
        cfg = WorkerConfig("queue", "bucket", "r", "d", "t")
        sqs_client = MagicMock()
        sqs_client.receive_message.side_effect = KeyboardInterrupt

        with patch(CHECK_TOOLS_PATCH):
            run_worker(cfg, sqs_client, MagicMock())

    def test_processes_messages(self):
        cfg = WorkerConfig("queue", "bucket", "r", "d", "t")
        sqs_client = MagicMock()
        s3_client = MagicMock()

        call_count = 0

        def fake_receive(**kw):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return {"Messages": [{"Body": '{"text":"hi"}', "ReceiptHandle": "r1"}]}
            raise KeyboardInterrupt

        sqs_client.receive_message.side_effect = fake_receive

        with patch(CHECK_TOOLS_PATCH), patch("worker.process_message") as mock_proc:
            run_worker(cfg, sqs_client, s3_client)

        mock_proc.assert_called_once()

    def test_error_recovery(self):
        cfg = WorkerConfig("queue", "bucket", "r", "d", "t")
        sqs_client = MagicMock()

        call_count = 0

        def fake_receive(**kw):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise ConnectionError("network down")
            raise KeyboardInterrupt

        sqs_client.receive_message.side_effect = fake_receive

        with patch(CHECK_TOOLS_PATCH), patch("time.sleep"):
            run_worker(cfg, sqs_client, MagicMock())

        assert call_count == 2

    def test_sigterm_graceful_shutdown(self):
        import worker
        cfg = WorkerConfig("queue", "bucket", "r", "d", "t")
        sqs = MagicMock()
        calls = 0
        def recv(**kw):
            nonlocal calls
            calls += 1
            if calls == 1:
                worker._sigterm_handler(None, None)
                return {"Messages": []}
            raise AssertionError("Should not poll after SIGTERM")
        sqs.receive_message.side_effect = recv
        with patch(CHECK_TOOLS_PATCH):
            run_worker(cfg, sqs, MagicMock())
        assert worker._shutdown_requested is True and calls == 1
