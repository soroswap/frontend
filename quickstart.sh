#!/bin/bash

set -e

case "$1" in
standalone)
    echo "Using standalone network"
    ARGS="--standalone"
    ;;
futurenet)
    echo "Using Futurenet network"
    ARGS="--futurenet"
    ;;
*)
    echo "Usage: $0 standalone|futurenet"
    exit 1
    ;;
esac

docker run --rm -ti \
  --platform linux/amd64 \
  --name stellar \
  -p 8000:8000 \
  stellar/quickstart:soroban-dev@sha256:c4429def497ed78ca99ae40c8e2522ec932081b4428df992900b5bc8d53bd642 \
  $ARGS \
  --enable-soroban-rpc \
  --protocol-version 20
