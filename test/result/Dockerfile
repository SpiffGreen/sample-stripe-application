# Start with a clean Ubuntu 22.04 base image
FROM ubuntu:22.04

# Set environment variables to avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install necessary packages and dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    git \
    build-essential \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    && apt-get clean

# Install CUDA 12.1 - https://developer.nvidia.com/cuda-12-1-0-download-archive?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=22.04&target_type=deb_local
RUN wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin \
    mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600 \
    wget https://developer.download.nvidia.com/compute/cuda/12.1.0/local_installers/cuda-repo-ubuntu2204-12-1-local_12.1.0-530.30.02-1_amd64.deb \
    dpkg -i cuda-repo-ubuntu2204-12-1-local_12.1.0-530.30.02-1_amd64.deb \
    cp /var/cuda-repo-ubuntu2204-12-1-local/cuda-*-keyring.gpg /usr/share/keyrings/ \
    apt-get update \
    apt-get -y install cuda

# Install PyTorch 2.3.0 with CUDA support
RUN pip3 install torch==2.3.0 torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121

# Clone ComfyUI repository
RUN git clone https://github.com/comfyanonymous/ComfyUI.git /opt/ComfyUI

# Set the working directory
WORKDIR /opt/ComfyUI

# Copy and execute the installation script
COPY install_mgen_comfyui_dependencies.sh /opt/ComfyUI/
RUN chmod +x install_mgen_comfyui_dependencies.sh && ./install_mgen_comfyui_dependencies.sh

# Install Jupyter Notebook
RUN pip3 install jupyter

# Expose the Jupyter Notebook port
EXPOSE 8888

# Set the command to run Jupyter Notebook with token-based authentication
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--no-browser", "--allow-root", "--NotebookApp.token='your_token_here'"]
