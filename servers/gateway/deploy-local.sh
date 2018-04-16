#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

deployAPI () {
    cd $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway

	if [[ "$1" == "hard" ]]; then
	    echo -e >&2 "${GREEN}Pulling updated containers...${NC}"
		docker pull redis
		docker pull mysql

        echo -e >&2 "${GREEN}Removing any conflicting running containers...${NC}"
		if [ "$(docker ps -aq --filter name=mysql)" ]; then
			docker rm -f mysql
		fi

		if [ "$(docker ps -aq --filter name=redis)" ]; then
			docker rm -f redis
		fi

		if [ -z "$(docker network list -q --filter name=dance-net)" ]; then
			docker network create dance-net
		fi

		echo -e >&2 "${GREEN}Starting redis...${NC}"
		docker run -d \
		-p 6379:6379 \
		--name redis \
		--network dance-net \
		redis

		cd $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway/sql

		echo -e >&2 "${GREEN}Building mysql docker container...${NC}"
		docker build -t brendankellogg/dance-mysql .

		echo -e >&2 "${GREEN}Starting mysql...${NC}"
		docker run -d \
		 -p 3306:3306 \
        -e MYSQL_ROOT_PASSWORD=$MYSQLPASS \
        -e MYSQL_DATABASE=DanceDB \
        -v $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway/dbdata:/var/lib/mysql \
        --network dance-net \
        --name mysql \
        brendankellogg/dance-mysql --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
	fi

	if [[ "$1" != "nobuild" ]]; then
        cd $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway

        echo -e >&2 "${GREEN}Building gateway executable...${NC}"
        GOOS=linux go build

        echo -e >&2 "${GREEN}Building gateway docker container...${NC}"
        docker build -t brendankellogg/dancegateway .

        go clean
    fi

    echo -e >&2 "${GREEN}Removing existing gateway container...${NC}"

	if [ "$(docker ps -aq --filter name=gateway)" ]; then
		docker rm -f gateway
	fi

	if [[ "$1" == "hard" ]]; then
	    echo -e >&2 "${GREEN}Waiting for mysql to be ready for connections...${NC}"
	    sleep 15s
	fi

	echo -e >&2 "${GREEN}Starting dance gateway server...${NC}"
	docker run -d \
	--name gateway \
	--network dance-net \
	-p 443:443 \
	-p 80:80 \
	-v $GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway:$GOPATH/src/github.com/BKellogg/UWDanceCapstone/servers/gateway:ro \
	-v $IMAGEPATH:/static/images/users/ \
	-v $STATICPATH:/static/ \
	-v $GOPATH/src/github.com/BKellogg/UWDanceCapstone/clients/:/clients/:ro \
	-v $GOPATH/src/github.com/BKellogg/UWDanceCapstone/assets/:/assets/:ro \
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
    -e RESETPASSWORDCLIENTPATH=/clients/passwordreset \
    -e ASSETSPATH=/assets/ \
    -e ADMINCONSOLEPATH=/clients/console \
    -e FRONTENDPATH=/clients/frontend/build/ \
    -e STAGE_ADMIN_FIRSTNAME=Brendan \
    -e STAGE_ADMIN_LASTNAME=Kellogg \
    -e STAGE_ADMIN_EMAIL=brendan6@uw.edu \
    -e STAGE_ADMIN_PASSWORD=$STAGE_ADMIN_PASSWORD \
	brendankellogg/dancegateway

    echo -e >&2 "${GREEN}Complete!${NC}"
}

if [[ "$1" == "" ]]; then
    deployAPI
elif [[ "$1" == "--full" ]]; then
	deployAPI hard
elif [[ "$1" == "--nobuild" ]]; then
    deployAPI nobuild
fi
