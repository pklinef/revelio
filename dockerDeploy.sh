#!/bin/bash
echo "Logging into Docker registry"

docker login -u $DOCKER_HUB_USER -p $DOCKER_HUB_PASSWORD

echo "Tagging current image to push into $DOCKER_REPO_URL"

currentHash=$(git rev-parse --short=8 HEAD)
imageName="$DOCKER_REPO_URL:$currentHash"

echo "Tagging image as: $imageName"

docker build -t $imageName .
docker push $imageName

echo "Image push complete and viewable at https://hub.docker.com/repository/docker/$DOCKER_REPO_URL"
