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
        This tests the actual signal handling without killing pytest.
        """
        # Script that starts worker with mocked SQS (infinite empty polling)
        script = '''
import signal, sys, json, time
sys.path.insert(0, ".")
from unittest.mock import MagicMock, patch

from worker import WorkerConfig, run_worker

config = WorkerConfig("https://sqs.example.com/q", "bucket", "eu-west-1", "/tmp/m", "/tmp/t")
sqs = MagicMock()
# Slow polling to give us time to send SIGTERM
sqs.receive_message.return_value = {"Messages": []}

with patch("worker.check_tools"):
    run_worker(config, sqs, MagicMock())

# If we get here, worker exited cleanly
print("CLEAN_EXIT")
'''
        proc = subprocess.Popen(
            [sys.executable, "-c", script],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        )

        # Give worker time to start and enter poll loop
        time.sleep(0.5)

        # Send SIGTERM (simulating Fargate Spot interruption)
        proc.send_signal(signal.SIGTERM)

        # Wait for clean exit
        try:
            stdout, stderr = proc.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
            pytest.fail("Worker did not exit within 5s after SIGTERM")

        # After fix: worker should exit cleanly (code 0) with "CLEAN_EXIT"
        assert proc.returncode == 0, f"Worker should exit 0 on SIGTERM, got {proc.returncode}. stderr: {stderr.decode()}"
        assert b"CLEAN_EXIT" in stdout, f"Worker should print CLEAN_EXIT. stdout: {stdout.decode()}"

    def test_keyboard_interrupt_still_works(self, config):
        """Existing KeyboardInterrupt handling should not be broken by SIGTERM fix."""
        sqs_client = MagicMock()
        sqs_client.receive_message.side_effect = KeyboardInterrupt

        with patch(CHECK_TOOLS_PATCH):
            run_worker(config, sqs_client, MagicMock())

        # Should exit cleanly without exception
