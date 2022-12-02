FROM debian:bullseye

# disable interactive ui
ENV DEBIAN_FRONTEND=noninteractive
# enable React Hot Reload in Container
ENV WATCHPACK_POLLING=true

# install dependencies from package manager
RUN apt update && apt install -y \
    sudo \
    git \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    jq \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# install nodejs 16, npm & yarn
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y nodejs
RUN npm install -g yarn

# create 'dev' user, add it to sudo group and set password
RUN mkdir /home/dev
RUN useradd -u 1000 dev && chown -R dev /home/dev
RUN adduser dev sudo
RUN echo "dev:dev"|chpasswd 

# install Rust toolchain for user 'dev'
USER dev
RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y