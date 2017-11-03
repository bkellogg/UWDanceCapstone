#!/usr/bin/env bash
set -e

deployAPI () {
    cd $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway
	echo >&2 "building gateway executable..."
	GOOS=linux go build

	echo >&2 "building gateway docker container..."
	docker build -t brendankellogg/dancegateway .

	docker pull mysql
	docker pull redis

	if [ "$(docker ps -aq --filter name=dance-gateway)" ]; then
		docker rm -f dance-gateway
	fi

	if [[ "$1" == "hard" ]]; then
		if [ "$(docker ps -aq --filter name=mysql)" ]; then
			docker rm -f mysql
		fi

		if [ "$(docker ps -aq --filter name=redis)" ]; then
			docker rm -f redis
		fi

		if [ -z "$(docker network list -q --filter name=dance-net)" ]; then
			docker network create dance-net
		fi

		echo >&2 "starting redis..."
		docker run -d \
		-p 6379:6379 \
		--name redis \
		--network dance-net \
		redis
		echo >&2 "starting mysql..."
		docker run -d \
		 -p 3306:3306 \
        -e MYSQL_ROOT_PASSWORD=$MYSQLPASS \
        -e MYSQL_DATABASE=DanceDB \
        -v $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway/mysql:/var/lib/mysql \
        --name mysql \
        --network dance-net \
        mysql

        sleep 11s
	fi

	echo >&2 "starting dance gateway server..."
	docker run -d \
	--name dance-gateway \
	--network dance-net \
	-p 4000:4000 \
	-v /Users/Brendan/Documents/go/src/github.com/BKellogg/UWDanceCapstone/servers/gateway:/Users/Brendan/Documents/go/src/github.com/BKellogg/UWDanceCapstone/servers/gateway:ro \
	-e ADDR=:4000 \
	-e TLSKEY=$GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway/tls/privkey.pem \
	-e TLSCERT=$GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway/tls/fullchain.pem \
	-e REDISADDR=redis:6379 \
	-e MYSQLADDR=$MYSQLADDR \
    -e MYSQLPASS=$MYSQLPASS \
    -e MYSQLDBNAME=DanceDB \
	-e SESSIONKEY=$(uuidgen) \
	brendankellogg/dancegateway

	go clean

}

if [[ "$1" == "gateway" ]]; then
    deployAPI
elif [[ "$1" == "gateway-hard" ]]; then
	deployAPI hard
fi
