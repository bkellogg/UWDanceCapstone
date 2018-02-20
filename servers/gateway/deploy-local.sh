#!/usr/bin/env bash
set -e

deployAPI () {
    cd $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway
    if [[ "$1" != "nobuild" ]]; then
        echo >&2 "building gateway executable..."
        GOOS=linux go build

        echo >&2 "building gateway docker container..."
        docker build -t brendankellogg/dancegateway .

        go clean
    fi

	if [ "$(docker ps -aq --filter name=gateway)" ]; then
		docker rm -f gateway
	fi

	if [[ "$1" == "hard" ]]; then
		docker pull redis

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

		cd $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway/sql

		echo >&2 "building mysql docker container..."
		docker build -t brendankellogg/dance-mysql .

		echo >&2 "starting mysql..."
		docker run -d \
		 -p 3306:3306 \
        -e MYSQL_ROOT_PASSWORD=$MYSQLPASS \
        -e MYSQL_DATABASE=DanceDB \
        -v $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway/dbdata:/var/lib/mysql \
        --network dance-net \
        --name mysql \
        brendankellogg/dance-mysql --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

        sleep 8s
	fi

	echo >&2 "starting dance gateway server..."
	docker run -d \
	--name gateway \
	--network dance-net \
	-p 443:443 \
	-p 80:80 \
	-v $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway:$GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway:ro \
	-v $CLIENTPATH:$CLIENTPATH:ro \
	-v $IMAGEPATH:/static/images/users/ \
	-v $STATICPATH:/static/ \
	-v $GOPATH/src/github.com/BKellogg/UWDanceCapstone/clients/:/clients/:ro \
	-e ADDR=:443 \
	-e TEMPLATESPATH=/templates/ \
	-e HTTPREDIRADDR=:80 \
	-e CLIENTPATH=$CLIENTPATH \
	-e TLSKEY=$GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway/tls/privkey.pem \
	-e TLSCERT=$GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway/tls/fullchain.pem \
	-e REDISADDR=redis:6379 \
	-e MYSQLADDR=mysql:3306 \
    -e MYSQLPASS=$MYSQLPASS \
    -e MYSQLDBNAME=DanceDB \
	-e SESSIONKEY=$SESSIONKEY \
    -e MAILUSER=$MAILUSER \
    -e MAILPASS=$MAILPASS \
    -e RESETPASSWORDCLIENTPATH=/clients/passwordresetclient \
    -e ADMINCONSOLEPATH=/clients/console \
	brendankellogg/dancegateway

}

if [[ "$1" == "" ]]; then
    deployAPI
elif [[ "$1" == "--hard" ]]; then
	deployAPI hard
elif [[ "$1" == "--nobuild" ]]; then
    deployAPI nobuild
fi
