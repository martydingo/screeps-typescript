FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

USER root
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN apt update && apt install -y git ca-certificates openssl openssh-server python2 build-essential

RUN source /usr/local/share/nvm/nvm.sh && nvm install 12
RUN npm install -g rollup yarn
