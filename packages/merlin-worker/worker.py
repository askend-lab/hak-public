#!/usr/bin/env python3
"""
Merlin TTS SQS Worker
Polls SQS queue, synthesizes audio with Merlin, uploads to S3
"""

import hashlib
import json
import logging
import os
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional

import boto3

logging.basicConfig(
    format="[%(asctime)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=logging.INFO,
)
logger = logging.getLogger("merlin-worker")

TEXT_PREVIEW_LENGTH = 50
CONDA_PREFIX = (
    "source /home/merlin_user/miniconda3/etc/profile.d/conda.sh && "
    "conda activate mrln_et && "
)
SYNTHESIS_TIMEOUT = 60
SOX_TIMEOUT = 30
POLL_WAIT_SECONDS = 20
VISIBILITY_TIMEOUT = 300
ERROR_RETRY_DELAY = 5


@dataclass
class WorkerConfig:
    """Worker configuration loaded from environment variables."""
    queue_url: str
    bucket_name: str
    aws_region: str
    merlin_dir: str
    temp_dir: str

    @property
    def src_dir(self) -> str:
        return os.path.join(self.merlin_dir, "src")

    @staticmethod
    def from_env() -> "WorkerConfig":
        return WorkerConfig(
            queue_url=os.environ.get("SQS_QUEUE_URL", ""),
            bucket_name=os.environ.get("S3_BUCKET", ""),
            aws_region=os.environ.get("AWS_REGION", "eu-west-1"),
            merlin_dir=os.environ.get("MERLIN_DIR", "/home/merlin_user/merlin_repo"),
            temp_dir=os.environ.get("TEMP_DIR", "/home/merlin_user/temp"),
        )

    def validate(self) -> list[str]:
        missing = []
        if not self.queue_url:
            missing.append("SQS_QUEUE_URL")
        if not self.bucket_name:
            missing.append("S3_BUCKET")
        return missing


@dataclass
class SynthesisRequest:
    """Parsed SQS message body."""
    text: str
    voice: str = "efm_l"
    speed: float = 1.0
    pitch: int = 0
    cache_key: str = ""

    @staticmethod
    def from_message(message: Dict[str, Any]) -> "SynthesisRequest":
        body = json.loads(message["Body"])
        text = body.get("text", "")
        return SynthesisRequest(
            text=text,
            voice=body.get("voice", "efm_l"),
            speed=body.get("speed", 1.0),
            pitch=body.get("pitch", 0),
            cache_key=body.get("cacheKey", hashlib.md5(text.encode()).hexdigest()),
        )


def check_tools(merlin_dir: str) -> None:
    """Log availability of required binary tools at startup."""
    tools_dir = os.path.join(merlin_dir, "tools")
    bin_dir = os.path.join(tools_dir, "bin")

    logger.info("MERLIN_DIR: %s", merlin_dir)
    logger.info("Tools dir exists: %s", os.path.exists(tools_dir))
    logger.info("Bin dir exists: %s", os.path.exists(bin_dir))

    for name, subpath in [("SPTK-3.9", "SPTK-3.9"), ("WORLD", "WORLD"), ("genlab", "../genlab/bin")]:
        path = os.path.join(bin_dir, subpath)
        if os.path.exists(path):
            files = os.listdir(path)
            logger.info("%s: %d files", name, len(files))
        else:
            logger.warning("%s MISSING: %s", name, path)


def synthesize_audio(
    text: str,
    config: WorkerConfig,
    voice: str = "efm_l",
    speed: float = 1.0,
    pitch: int = 0,
    run_command: Any = subprocess.run,
) -> bytes:
    """Run Merlin TTS synthesis and return WAV audio bytes."""
    os.makedirs(config.temp_dir, exist_ok=True)

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".txt", delete=False, dir=config.temp_dir, encoding="utf-8"
    ) as f:
        f.write(text)
        text_file = f.name

    wav_file = text_file.replace(".txt", ".wav")

    try:
        cmd = [
            "python", os.path.join(config.src_dir, "run_merlin.py"),
            config.merlin_dir, config.temp_dir, voice, text_file, wav_file,
        ]
        result = run_command(
            ["bash", "-c", CONDA_PREFIX + " ".join(cmd)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            timeout=SYNTHESIS_TIMEOUT,
        )

        if result.stdout:
            logger.info("Merlin stdout:\n%s", result.stdout)
        if result.returncode != 0:
            if result.stderr:
                logger.error("Merlin stderr:\n%s", result.stderr)
            raise RuntimeError(f"Merlin failed (exit {result.returncode}): {result.stderr}")

        if not os.path.exists(wav_file):
            raise RuntimeError("WAV file not generated")

        wav_file = _apply_sox_effects(wav_file, speed, pitch, run_command)

        with open(wav_file, "rb") as f:
            return f.read()
    finally:
        _cleanup_files(text_file, wav_file)


def _apply_sox_effects(
    wav_file: str, speed: float, pitch: int, run_command: Any
) -> str:
    """Apply speed/pitch effects with SOX. Returns final wav path."""
    if speed == 1.0 and pitch == 0:
        return wav_file

    processed = wav_file.replace(".wav", "_proc.wav")
    effects = []
    if speed != 1.0:
        effects.append(f"tempo {speed}")
    if pitch != 0:
        effects.append(f"pitch {int(pitch)}")

    run_command(
        ["bash", "-c", f"sox {wav_file} {processed} {' '.join(effects)}"],
        timeout=SOX_TIMEOUT,
    )

    if os.path.exists(processed):
        os.remove(wav_file)
        return processed
    return wav_file


def _cleanup_files(text_file: str, wav_file: str) -> None:
    """Remove temporary files, ignoring errors."""
    for path in [text_file, wav_file, wav_file.replace(".wav", "_proc.wav")]:
        try:
            os.remove(path)
        except OSError:
            pass


def upload_to_s3(
    s3_client: Any, bucket: str, region: str, audio_data: bytes, cache_key: str
) -> str:
    """Upload WAV audio to S3 and return the URL."""
    s3_key = f"cache/{cache_key}.wav"
    s3_client.put_object(
        Bucket=bucket, Key=s3_key, Body=audio_data, ContentType="audio/wav"
    )
    return f"https://{bucket}.s3.{region}.amazonaws.com/{s3_key}"


def process_message(
    message: Dict[str, Any],
    config: WorkerConfig,
    sqs_client: Any,
    s3_client: Any,
) -> bool:
    """Process a single SQS message: synthesize and upload."""
    try:
        req = SynthesisRequest.from_message(message)

        logger.info(
            'Processing: %s, text="%s..."', req.cache_key, req.text[:TEXT_PREVIEW_LENGTH]
        )
        audio = synthesize_audio(req.text, config, req.voice, req.speed, req.pitch)
        logger.info("Synthesized: %d bytes", len(audio))

        url = upload_to_s3(s3_client, config.bucket_name, config.aws_region, audio, req.cache_key)
        logger.info("Uploaded: %s", url)

        sqs_client.delete_message(
            QueueUrl=config.queue_url, ReceiptHandle=message["ReceiptHandle"]
        )
        return True
    except Exception:
        logger.exception("Error processing message")
        return False


def run_worker(config: WorkerConfig, sqs_client: Any, s3_client: Any) -> None:
    """Main polling loop. Runs until KeyboardInterrupt."""
    logger.info("Merlin SQS Worker starting...")
    logger.info("Queue: %s, Bucket: %s", config.queue_url, config.bucket_name)

    missing = config.validate()
    if missing:
        logger.error("Missing required env vars: %s", ", ".join(missing))
        sys.exit(1)

    check_tools(config.merlin_dir)

    while True:
        try:
            resp = sqs_client.receive_message(
                QueueUrl=config.queue_url,
                MaxNumberOfMessages=1,
                WaitTimeSeconds=POLL_WAIT_SECONDS,
                VisibilityTimeout=VISIBILITY_TIMEOUT,
            )
            for msg in resp.get("Messages", []):
                process_message(msg, config, sqs_client, s3_client)
        except KeyboardInterrupt:
            logger.info("Shutting down (KeyboardInterrupt)")
            break
        except Exception:
            logger.exception("Worker error, retrying in %ds", ERROR_RETRY_DELAY)
            time.sleep(ERROR_RETRY_DELAY)


def main() -> None:
    config = WorkerConfig.from_env()
    sqs_client = boto3.client("sqs", region_name=config.aws_region)
    s3_client = boto3.client("s3", region_name=config.aws_region)
    run_worker(config, sqs_client, s3_client)


if __name__ == "__main__":
    main()
