#!/bin/bash
set -e

# Start Gunicorn server
exec ./venv/bin/gunicorn \
    --bind 0.0.0.0:8000 \
    --workers ${WORKERS:-1} \
    --timeout ${TIMEOUT:-30} \
    --worker-class ${WORKER_CLASS:-sync} \
    --access-logfile - \
    --error-logfile - \
    app:app

