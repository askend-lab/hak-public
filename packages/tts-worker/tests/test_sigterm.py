"""
TDD tests for audit finding #5: merlin-worker SIGTERM graceful shutdown.

Current behavior: worker catches only KeyboardInterrupt.
Expected behavior after fix: worker registers signal.SIGTERM handler that
sets a shutdown flag. The polling loop checks the flag and exits after
finishing the current message.

Fix implemented: _shutdown_requested flag + signal.SIGTERM handler.
"""

import os
import signal
import subprocess
import sys
import time
from unittest.mock import MagicMock, patch

import pytest

from worker import WorkerConfig, run_worker

CHECK_TOOLS_PATCH = "worker.check_tools"


class TestSigtermGracefulShutdown:
    """Tests that SIGTERM is handled gracefully by the worker."""

    @pytest.fixture
    def config(self):
        return WorkerConfig("https://sqs.example.com/q", "bucket", "eu-west-1", "/opt/merlin", "/tmp")

    def test_worker_has_sigterm_handler(self):
        """After fix, worker module should register a SIGTERM handler."""
        import worker
        # After the fix, run_worker should install a SIGTERM handler.
        # We check if the module has a shutdown flag or SIGTERM handler reference.
        assert hasattr(worker, "_shutdown_requested") or hasattr(worker, "shutdown_flag"), \
            "Worker should expose a shutdown flag for SIGTERM handling"

    def test_sigterm_stops_worker_subprocess(self):
        """
        Run worker in a subprocess, send SIGTERM, verify clean exit.
        Uses a temp file as a ready-signal to avoid pipe deadlocks.
        """
        import tempfile
        ready_file = os.path.join(tempfile.gettempdir(), f"sigterm_ready_{os.getpid()}")

        script = f'''
import sys, time, os
sys.path.insert(0, ".")
from unittest.mock import MagicMock, patch

from worker import WorkerConfig, run_worker

config = WorkerConfig("https://sqs.example.com/q", "bucket", "eu-west-1", "/tmp/m", "/tmp/t")
sqs = MagicMock()
call_count = 0

def fake_receive(**kwargs):
    global call_count
    call_count += 1
    if call_count == 1:
        open("{ready_file}", "w").close()  # signal ready
    time.sleep(0.1)
    return {{"Messages": []}}

sqs.receive_message.side_effect = fake_receive

with patch("worker.check_tools"):
    run_worker(config, sqs, MagicMock())

print("CLEAN_EXIT")
'''
        try:
            # Clean up stale ready file
            if os.path.exists(ready_file):
                os.unlink(ready_file)

            proc = subprocess.Popen(
                [sys.executable, "-c", script],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            )

            # Wait for ready file (worker is in poll loop, handler installed)
            deadline = time.monotonic() + 10
            while time.monotonic() < deadline:
                if os.path.exists(ready_file):
                    break
                if proc.poll() is not None:
                    out, err = proc.communicate()
                    pytest.fail(f"Worker exited early (rc={proc.returncode}). stderr: {err.decode()}")
                time.sleep(0.05)
            else:
                proc.kill()
                pytest.fail("Worker did not become ready within 10s")

            # Send SIGTERM (simulating Fargate Spot interruption)
            proc.send_signal(signal.SIGTERM)

            # Wait for clean exit
            try:
                stdout, stderr = proc.communicate(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.communicate()
                pytest.fail("Worker did not exit within 5s after SIGTERM")

            assert proc.returncode == 0, \
                f"Worker should exit 0 on SIGTERM, got {proc.returncode}. stderr: {stderr.decode()}"
            assert b"CLEAN_EXIT" in stdout, \
                f"Worker should print CLEAN_EXIT. stdout: {stdout.decode()}"
        finally:
            if os.path.exists(ready_file):
                os.unlink(ready_file)

    def test_keyboard_interrupt_still_works(self, config):
        """Existing KeyboardInterrupt handling should not be broken by SIGTERM fix."""
        sqs_client = MagicMock()
        sqs_client.receive_message.side_effect = KeyboardInterrupt

        with patch(CHECK_TOOLS_PATCH):
            run_worker(config, sqs_client, MagicMock())

        # Should exit cleanly without exception
