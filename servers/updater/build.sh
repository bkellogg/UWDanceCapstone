#!/usr/bin/env bash

GOOS=linux go build
scp updater dance:/servers/
go clean