# Merlin TTS SQS Worker
# Clones from official repo: https://github.com/ikiissel/mrln_spn

FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies + git
RUN apt-get update && apt-get install -y \
    build-essential csh automake sox wget ca-certificates dos2unix git \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged user
RUN groupadd --gid 1001 merlin_user && \
    useradd --uid 1001 --gid merlin_user --shell /bin/bash --create-home merlin_user

USER merlin_user:merlin_user
WORKDIR /home/merlin_user

# Install Miniconda
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        MINICONDA_URL="https://repo.anaconda.com/miniconda/Miniconda3-py37_4.9.2-Linux-aarch64.sh"; \
    else \
        MINICONDA_URL="https://repo.anaconda.com/miniconda/Miniconda3-py37_4.9.2-Linux-x86_64.sh"; \
    fi && \
    wget --quiet $MINICONDA_URL -O ~/miniconda.sh && \
    /bin/bash ~/miniconda.sh -b -p /home/merlin_user/miniconda3 && \
    rm ~/miniconda.sh && \
    /home/merlin_user/miniconda3/bin/conda clean -afy

ENV PATH=/home/merlin_user/miniconda3/bin:$PATH

# Clone Merlin from official repo
RUN git clone --depth 1 https://github.com/ikiissel/mrln_spn.git merlin_repo

# Copy conda environment file and create environment
RUN cp merlin_repo/mrln_et.yml . && \
    conda env create -f mrln_et.yml && \
    conda clean -afy

# Fix Windows line endings and compile tools
USER root
RUN find /home/merlin_user/merlin_repo/tools -name "*.sh" -exec dos2unix {} \;
USER merlin_user:merlin_user

RUN cd merlin_repo/tools && bash compile_tools.sh

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
