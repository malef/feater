#!/usr/bin/env bash

set -ex

echo '@todo restore, blocked for now'
exit 1 # blocked for now

version=latest

docker_versions=(
    28.5.2
    latest
)

for i in "${!docker_versions[@]}"; do
    docker build \
        --pull \
        --build-arg DOCKER_VERSION=${docker_versions[$i]} \
        -f ./prod/Dockerfile \
        -t feater/feater:${version}-docker-${docker_versions[$i]} \
        ..

    docker push feater/feater:${version}-docker-${docker_versions[$i]}
done

