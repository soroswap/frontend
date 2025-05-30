#!/bin/bash

# Set the current directory
currentDir=$(pwd)

# Set the name, image and version for the Docker container
containerName=soroswap-frontend

imageName=node
versionTag=20.18.0

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
           --network soroswap-network \
           --interactive \
           --publish 3000:3000 \
           --workdir="/workspace" \
           --tty \
           --detach \
           --publish-all \
           --memory=12g \
           --env-file .env \
           ${imageName}:${versionTag}

# Set the git config
# docker exec $containerName git config --global --add safe.directory /workspace

# # Instalar Chrome, Firefox y Edge (si son necesarios)
# docker exec ${containerName} sh -c '
# apt-get update && \
# apt-get install -y wget gnupg && \
# # Instalar Chrome
# wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
# echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
# apt-get update && \
# apt-get install -y google-chrome-stable && \
# # Instalar Firefox
# apt-get install -y firefox-esr && \
# echo "Browsers installed successfully"
# '

# Connect to bash on Docker container
docker exec --tty --interactive $containerName bash
