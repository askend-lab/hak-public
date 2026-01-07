#!/bin/bash
set -e

# Activate conda environment
source /home/merlin_user/miniconda3/etc/profile.d/conda.sh
conda activate mrln_et

# Install Flask and gunicorn if not installed
pip install flask gunicorn 2>/dev/null || true

# Start Gunicorn server
exec gunicorn \
    --bind 0.0.0.0:8000 \
    --workers ${WORKERS:-1} \
    --timeout ${TIMEOUT:-60} \
    --worker-class ${WORKER_CLASS:-sync} \
    --access-logfile - \
    --error-logfile - \
    app:app
