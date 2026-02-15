# syntax=docker/dockerfile:1
# Merlin TTS SQS Worker
# Source code from hak repo, voice models from S3

FROM ubuntu:22.04@sha256:34577a83cd7a8f1e55f6eb173fd9bb70c16127a83d6bf06f56f6b1fff9e406b9

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential csh automake sox wget ca-certificates dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged user
RUN groupadd --gid 1001 merlin_user && \
    useradd --uid 1001 --gid merlin_user --shell /bin/bash --create-home merlin_user

USER merlin_user:merlin_user
WORKDIR /home/merlin_user

# Install Miniconda
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        MINICONDA_URL="https://repo.anaconda.com/miniconda/Miniconda3-py39_24.9.2-0-Linux-aarch64.sh"; \
    else \
        MINICONDA_URL="https://repo.anaconda.com/miniconda/Miniconda3-py39_24.9.2-0-Linux-x86_64.sh"; \
    fi && \
    wget --quiet $MINICONDA_URL -O ~/miniconda.sh && \
    /bin/bash ~/miniconda.sh -b -p /home/merlin_user/miniconda3 && \
    rm ~/miniconda.sh && \
    /home/merlin_user/miniconda3/bin/conda clean -afy

ENV PATH=/home/merlin_user/miniconda3/bin:$PATH

# Create merlin directory structure
RUN mkdir -p merlin_repo/src merlin_repo/voices merlin_repo/tools

# Copy Merlin source code from hak repo
COPY --chown=merlin_user:merlin_user merlin/ merlin_repo/src/
COPY --chown=merlin_user:merlin_user mrln_et.yml .
COPY --chown=merlin_user:merlin_user tools/ merlin_repo/tools/

# Download voice models from S3 (267MB, too large for git)
# Uses BuildKit secrets to avoid baking AWS credentials into image layers
RUN pip install awscli==1.36.40
RUN --mount=type=secret,id=aws_access_key_id,uid=1001 \
    --mount=type=secret,id=aws_secret_access_key,uid=1001 \
    --mount=type=secret,id=aws_session_token,uid=1001 \
    AWS_ACCESS_KEY_ID=$(cat /run/secrets/aws_access_key_id) \
    AWS_SECRET_ACCESS_KEY=$(cat /run/secrets/aws_secret_access_key) \
    AWS_SESSION_TOKEN=$(cat /run/secrets/aws_session_token) \
    aws s3 sync s3://hak-merlin-dev-audio/models/voices/ merlin_repo/voices/ --region eu-west-1

# Create conda environment
RUN conda env create -f mrln_et.yml && \
    conda clean -afy

# Fix Windows line endings and compile tools
USER root
RUN find /home/merlin_user/merlin_repo/tools -name "*.sh" -exec dos2unix {} \;
USER merlin_user:merlin_user

RUN cd merlin_repo/tools && bash compile_tools.sh && \
    chmod -R +x /home/merlin_user/merlin_repo/tools/bin/

# Install boto3 for AWS SDK
RUN /home/merlin_user/miniconda3/bin/pip install boto3

# Copy SQS worker from build context
COPY --chown=merlin_user:merlin_user worker.py ./

# Create temp directory
RUN mkdir -p temp

# Environment variables
ENV MERLIN_DIR=/home/merlin_user/merlin_repo
ENV PATH="/home/merlin_user/merlin_repo/tools/bin/SPTK-3.9:/home/merlin_user/merlin_repo/tools/bin/WORLD:/home/merlin_user/merlin_repo/tools/genlab/bin:${PATH}"

# Start worker
CMD ["python", "worker.py"]
