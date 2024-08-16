FROM ubuntu:22.04

# Install necessary system packages
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg2 \
    lsb-release \
    software-properties-common \
    build-essential \
    ca-certificates \
    git \
    python3 \
    python3-pip \
    python3-venv \
    sudo \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Cuda 12.1 installation - https://forums.developer.nvidia.com/t/how-can-i-install-cuda-12-1-on-ubuntu-22-04-im-going-insane-here/293738
RUN apt install cuda-12-1

# Install PyTorch 2.3.0 with CUDA support
RUN sudo apt-get install libgl1-mesa-glx libegl1-mesa libxrandr2 libxrandr2 libxss1 libxcursor1 libxcomposite1 libasound2 libxi6 libxtst6
RUN pip3 install torch==2.3.0+cu121 torchvision==0.15.0+cu121 torchaudio==2.3.0 --extra-index-url https://download.pytorch.org/whl/cu121

# Install Jupyter Notebook with token-based authentication
# RUN pip3 install notebook jupyterlab \
#     && jupyter notebook --generate-config \
#     && echo "c.NotebookApp.token = ''" >> /root/.jupyter/jupyter_notebook_config.py

# EXPOSE 8888

# Set the command to run Jupyter Notebook on container start
# CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--no-browser", "--allow-root", "--port=8888"]

# Define entrypoint for ComfyUI
ENTRYPOINT ["/bin/bash"]