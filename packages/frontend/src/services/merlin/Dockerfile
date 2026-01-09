# Use Ubuntu 20.04 LTS (GLIBC 2.31 - compatible with compiled tools)
FROM ubuntu:20.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    csh \
    automake \
    sox \
    wget \
    ca-certificates \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged user FIRST
RUN groupadd --gid 1001 merlin_user && \
    useradd --uid 1001 --gid merlin_user --shell /bin/bash --create-home merlin_user

# Install Miniconda for the user
USER merlin_user:merlin_user
WORKDIR /home/merlin_user

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

# Copy conda environment file
COPY --chown=merlin_user:merlin_user services/merlin/mrln_et.yml ./

# Create conda environment
RUN conda env create -f mrln_et.yml && \
    conda clean -afy

# NOTE: src/ and voices/ are NOT in git. They are copied from research/ during build.
# This is intentional to keep the git repo small.
# 
# When building locally, make sure research/merlin/ exists.
# In CI/CD, you would download/clone the merlin repo first.

# Copy tools source and compile them
COPY --chown=merlin_user:merlin_user research/merlin/tools ./tools/

# Fix Windows line endings (CRLF → LF) and compile tools
USER root
RUN find /home/merlin_user/tools -name "*.sh" -exec dos2unix {} \;
USER merlin_user:merlin_user

# Compile tools (SPTK, WORLD, genlab)
RUN cd tools && bash compile_tools.sh

# Copy Merlin source code from research (build context is project root)
COPY --chown=merlin_user:merlin_user research/merlin/src ./src/

# Copy voice models (only the essential files, exclude test data and logs)
COPY --chown=merlin_user:merlin_user research/merlin/voices/efm_l/acoustic_model/nnets_model ./voices/efm_l/acoustic_model/nnets_model/
COPY --chown=merlin_user:merlin_user research/merlin/voices/efm_l/acoustic_model/inter_module ./voices/efm_l/acoustic_model/inter_module/
COPY --chown=merlin_user:merlin_user research/merlin/voices/efm_l/duration_model/nnets_model ./voices/efm_l/duration_model/nnets_model/
COPY --chown=merlin_user:merlin_user research/merlin/voices/efm_l/duration_model/inter_module ./voices/efm_l/duration_model/inter_module/

COPY --chown=merlin_user:merlin_user research/merlin/voices/efm_s/acoustic_model/nnets_model ./voices/efm_s/acoustic_model/nnets_model/
COPY --chown=merlin_user:merlin_user research/merlin/voices/efm_s/acoustic_model/inter_module ./voices/efm_s/acoustic_model/inter_module/
COPY --chown=merlin_user:merlin_user research/merlin/voices/efm_s/duration_model/nnets_model ./voices/efm_s/duration_model/nnets_model/
COPY --chown=merlin_user:merlin_user research/merlin/voices/efm_s/duration_model/inter_module ./voices/efm_s/duration_model/inter_module/

# Copy Flask API wrapper
COPY --chown=merlin_user:merlin_user services/merlin/app.py ./
COPY --chown=merlin_user:merlin_user services/merlin/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create temp directory
RUN mkdir -p temp

# Environment variables
ENV MERLIN_DIR=/home/merlin_user
ENV PATH="/home/merlin_user/tools/bin/SPTK-3.9:/home/merlin_user/tools/bin/WORLD:/home/merlin_user/tools/genlab/bin:${PATH}"

# Expose port
EXPOSE 8000

# Start server
ENTRYPOINT ["./docker-entrypoint.sh"]
