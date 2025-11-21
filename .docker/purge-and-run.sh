#!/usr/bin/env bash

set -ex

# Cleanup.
docker stop feater || true
docker rm --volumes feater || true
docker network rm feater_proxy || true

# Build images.
./build-dockerhub-images.sh

# Start.
docker network create feater_proxy
docker run \
    -p 9010:9010 \
    -p 80:9011 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -e FEATER_PROXY_NETWORK_NAME=feater_proxy \
    -d \
    --name feater \
    feater/feater:latest-docker-28.5.2