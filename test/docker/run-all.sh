#!/bin/bash

# go to root
cd "$(dirname "$0")"
cd ..

# run bridge
cd /trezor-bridge/ && ./extracted/usr/bin/trezord -e 21324 -u=false &

# run emulator
cd /trezor-emulator/trezor-core && ./emu.sh &

# run wallet
cd /trezor-wallet && yarn run server:stable
