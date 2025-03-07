#!/bin/bash

# Set the current directory
currentDir=$(pwd)

# Set the name, image and version for the Docker container
containerName=soroswapFrontend
imageName=cypress/browsers
versionTag=node-20.18.0-chrome-130.0.6723.69-1-ff-131.0.3-edge-130.0.2849.52-1

# Display the command being executed
echo "Command: $1"

# Check if there is a previous Docker container with the same name
echo "Searching for a previous docker container"
containerID=$(docker ps --filter="name=${containerName}" --all --quiet)
if [[ ${containerID} ]]; then
    echo "Start removing container."
    # Remove the previous Docker container
    docker rm --force ${containerName}
    echo "Finished removing container."
else
    echo "No previous container was found"
fi

# Run a new Docker container
docker run --volume ${currentDir}:/workspace \
           --name ${containerName} \
           --interactive \
           --publish 3003:3000 \
           --workdir="/workspace" \
           --tty \
           --detach \
           --publish-all \
           --memory=12g \
           --env-file .env \
           ${imageName}:${versionTag}

# Set the git config
# docker exec $containerName git config --global --add safe.directory /workspace

# Connect to bash on Docker container
docker exec --tty --interactive $containerName bash
