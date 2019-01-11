FROM debian:stretch

RUN apt-get update
RUN apt-get install -y wget

# install and run bridge
RUN mkdir /trezor-bridge
WORKDIR /trezor-bridge
RUN wget https://wallet.trezor.io/data/bridge/2.0.25/trezor-bridge_2.0.25_amd64.deb
RUN apt-get install -y /trezor-bridge/trezor-bridge_2.0.25_amd64.deb

# build amd run emulator
RUN mkdir /trezor-core
WORKDIR /trezor-core

RUN git clone https://github.com/trezor/trezor-core
RUN git submodule update --init --recursive

RUN apt-get install libusb-1.0-0
RUN pip3 install scons trezor
RUN make build_unix_noui

ENTRYPOINT ["./docker/emulator/run.sh"]
EXPOSE 21324/udp 21325