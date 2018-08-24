#!/usr/bin/env bash
set -e

cd $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway
echo >&2 "building gateway executable..."
GOOS=linux go build

echo >&2 "building gateway docker container..."
docker build -t brendankellogg/dancegateway .

echo >&2 "building mysql docker container..."
docker build -t brendankellogg/dance-mysql ./sql

echo >&2 "pushing build containers..."
docker push brendankellogg/dancegateway
docker push brendankellogg/dance-mysql

go clean

if [[ "$1" == "hard" ]]; then
    ssh -oStrictHostKeyChecking=no stage '~/run.sh --hard'
else
    ssh -oStrictHostKeyChecking=no stage '~/run.sh'
fi