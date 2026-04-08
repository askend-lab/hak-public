"""
TDD tests for audit finding #1: safe subprocess wrapper for run_merlin.py.

Current behavior: run_merlin.py uses run_process() which calls subprocess with
shell=True and string-concatenated commands. Paths with shell metacharacters
could lead to command injection.

Expected behavior after fix: a safe_run_process() wrapper that uses
subprocess.run() with argument lists (no shell=True).

These tests verify the wrapper handles:
1. Normal commands with safe paths
2. Paths with spaces and special characters (no injection)
3. Glob patterns (which require special handling without shell=True)
4. The specific commands used in run_merlin.py
"""

import glob
import os
import subprocess

import pytest


def safe_run_process(args, cwd=None):
    """
    Safe alternative to run_process() from utils/generate.py.
    Uses subprocess.run() with argument list instead of shell=True.

    This function is the reference implementation for the fix.
    After the fix, run_merlin.py should use this instead of run_process().
    """
    result = subprocess.run(
        args,
        capture_output=True,
        text=True,
        cwd=cwd,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Command failed (exit {result.returncode}): {result.stderr}")
    return result


def safe_mkdir_p(path):
    """Safe replacement for run_process('mkdir -p ' + path)."""
    os.makedirs(path, exist_ok=True)


def safe_rm_glob(pattern):
    """Safe replacement for run_process('rm -f ' + path + '/*.*')."""
    for f in glob.glob(pattern):
        os.remove(f)


class TestSafeSubprocessWrapper:
    """Tests for the safe subprocess wrapper that replaces shell-based run_process."""

    def test_safe_run_process_basic(self):
        """Basic command execution works."""
        result = safe_run_process(["echo", "hello"])
        assert result.returncode == 0
        assert "hello" in result.stdout

    def test_safe_run_process_with_spaces_in_path(self, tmp_path):
        """Paths with spaces are handled correctly (no injection)."""
        dir_with_spaces = tmp_path / "path with spaces"
        dir_with_spaces.mkdir()
        test_file = dir_with_spaces / "test.txt"
        test_file.write_text("content")

        result = safe_run_process(["cat", str(test_file)])
        assert result.returncode == 0
        assert "content" in result.stdout

    def test_safe_run_process_rejects_shell_injection(self, tmp_path):
        """Shell metacharacters in paths don't cause injection."""
        # This path would be dangerous with shell=True:
        #   shell=True: "ls test; rm -rf /" → runs ls AND rm -rf /
        #   shell=False: ["ls", "test; rm -rf /"] → treats as one literal path
        dangerous_name = "test; rm -rf /"
        safe_dir = tmp_path / dangerous_name

        # With safe wrapper, ";" is part of the filename, not a command separator.
        # ls fails because the literal path doesn't exist — no injection.
        with pytest.raises(RuntimeError, match="Command failed"):
            safe_run_process(["ls", str(safe_dir)])

    def test_safe_run_process_raises_on_failure(self):
        """Non-zero exit code raises RuntimeError."""
        with pytest.raises(RuntimeError, match="Command failed"):
            safe_run_process(["false"])

    def test_safe_mkdir_p(self, tmp_path):
        """safe_mkdir_p creates nested directories."""
        target = tmp_path / "a" / "b" / "c"
        safe_mkdir_p(str(target))
        assert target.is_dir()

    def test_safe_mkdir_p_existing(self, tmp_path):
        """safe_mkdir_p is idempotent."""
        target = tmp_path / "existing"
        target.mkdir()
        safe_mkdir_p(str(target))  # Should not raise
        assert target.is_dir()

    def test_safe_rm_glob(self, tmp_path):
        """safe_rm_glob removes files matching glob pattern."""
        (tmp_path / "file1.lab").write_text("a")
        (tmp_path / "file2.lab").write_text("b")
        (tmp_path / "keep.txt").write_text("c")

        safe_rm_glob(str(tmp_path / "*.lab"))

        assert not (tmp_path / "file1.lab").exists()
        assert not (tmp_path / "file2.lab").exists()
        assert (tmp_path / "keep.txt").exists()

    def test_safe_rm_glob_no_matches(self, tmp_path):
        """safe_rm_glob with no matches does nothing."""
        safe_rm_glob(str(tmp_path / "*.nonexistent"))  # Should not raise

    def test_safe_rm_glob_with_spaces_in_path(self, tmp_path):
        """safe_rm_glob handles paths with spaces."""
        dir_with_spaces = tmp_path / "gen lab"
        dir_with_spaces.mkdir()
        (dir_with_spaces / "file.wav").write_text("audio")

        safe_rm_glob(str(dir_with_spaces / "*.wav"))
        assert not (dir_with_spaces / "file.wav").exists()


class TestRunMerlinCommands:
    """
    Tests that verify the specific commands from run_merlin.py:316-336
    can be safely executed without shell=True.
    """

    def test_mkdir_prompt_lab(self, tmp_path):
        """run_merlin.py:316 — mkdir -p TempDir/prompt-lab"""
        temp_dir = tmp_path / "temp"
        safe_mkdir_p(str(temp_dir / "prompt-lab"))
        assert (temp_dir / "prompt-lab").is_dir()

    def test_rm_gen_lab(self, tmp_path):
        """run_merlin.py:317 — rm -f TempDir/gen-lab/*.*"""
        gen_lab = tmp_path / "gen-lab"
        gen_lab.mkdir()
        (gen_lab / "test.lab").write_text("data")
        (gen_lab / "test2.cmp").write_text("data")

        safe_rm_glob(str(gen_lab / "*.*"))
        assert len(list(gen_lab.iterdir())) == 0

    def test_rm_wav(self, tmp_path):
        """run_merlin.py:318 — rm -f TempDir/wav/*.*"""
        wav_dir = tmp_path / "wav"
        wav_dir.mkdir()
        (wav_dir / "output.wav").write_text("audio")

        safe_rm_glob(str(wav_dir / "*.*"))
        assert len(list(wav_dir.iterdir())) == 0

    def test_genlab_command_args(self, tmp_path):
        """
        run_merlin.py:322 — genlab command with multiple arguments.
        Verify the command can be constructed as an argument list.
        """
        full_path_dir = str(tmp_path / "merlin")
        temp_dir = str(tmp_path / "temp")
        in_text = str(tmp_path / "input.txt")

        genlab_dir = f"{full_path_dir}/tools/genlab/"

        # The original shell command:
        # genlab_dir + "bin/genlab -lex " + genlab_dir + "dct/et.dct -lexd " + ...
        #
        # Safe argument list:
        args = [
            f"{genlab_dir}bin/genlab",
            "-lex", f"{genlab_dir}dct/et.dct",
            "-lexd", f"{genlab_dir}dct/et3.dct",
            "-o", f"{temp_dir}/",
            "-f", in_text,
        ]

        # Verify args are properly structured (no shell metacharacters leak)
        for arg in args:
            assert ";" not in arg or arg == in_text  # in_text is user-controlled
            assert "|" not in arg
            assert "&" not in arg

    def test_sox_concat_command_args(self, tmp_path):
        """
        run_merlin.py:336 — sox TempDir/wav/*.wav out.wav
        sox with glob requires expanding the glob first.
        """
        wav_dir = tmp_path / "wav"
        wav_dir.mkdir()
        (wav_dir / "part1.wav").write_text("a")
        (wav_dir / "part2.wav").write_text("b")

        out_wav = str(tmp_path / "output.wav")

        # Expand glob safely
        wav_files = sorted(glob.glob(str(wav_dir / "*.wav")))
        assert len(wav_files) == 2

        # Safe argument list for sox:
        args = ["sox", *wav_files, out_wav]
        assert args[0] == "sox"
        assert args[-1] == out_wav
        assert len(args) == 4  # sox + 2 wav files + output

    def test_path_with_shell_metacharacters(self, tmp_path):
        """Paths with metacharacters don't cause issues with safe wrappers."""
        dangerous_dir = tmp_path / "temp$(whoami)"
        dangerous_dir.mkdir()
        (dangerous_dir / "test.lab").write_text("data")

        safe_rm_glob(str(dangerous_dir / "*.*"))
        assert len(list(dangerous_dir.iterdir())) == 0

        safe_mkdir_p(str(dangerous_dir / "sub dir"))
        assert (dangerous_dir / "sub dir").is_dir()
