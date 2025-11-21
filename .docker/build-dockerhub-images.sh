#!/usr/bin/env bash

set -ex

version=latest

docker_versions=(
    28.5.2
    # latest
)

for i in "${!docker_versions[@]}"; do
    docker build \
        --pull \
        --build-arg DOCKER_VERSION=${docker_versions[$i]} \
        -f ./prod/Dockerfile \
        -t feater/feater:${version}-docker-${docker_versions[$i]} \
        ..
done

