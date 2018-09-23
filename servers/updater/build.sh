#!/usr/bin/env bash

GOOS=linux go build
scp updater stage:/servers/
go clean
