#!/usr/bin/env bash

echo >&2 "pulling updated containers..."
docker pull redis
docker pull brendankellogg/dancegateway
docker pull brendankellogg/dance-mysql

if [ "$(docker ps -aq --filter name=redis)" ]; then
    echo >&2 "stopping redis..."
	docker rm -f redis
fi

echo >&2 "starting redis..."
docker run -d \
--name redis \
--network dancenet \
redis

if [ "$(docker ps -aq --filter name=mysql)" ]; then
    echo >&2 "stopping mysql..."
	docker rm -f mysql
fi

echo >&2 "starting mysql..."
docker run -d \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=$MYSQLPASS \
-e MYSQL_DATABASE=DanceDB \
-v /dbdump:/var/lib/mysql \
--network dancenet \
--name mysql \
brendankellogg/dance-mysql --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

if [ "$(docker ps -aq --filter name=gateway)" ]; then
    echo >&2 "stopping gateway..."
	docker rm -f gateway
fi

echo >&2 "starting dance gateway server..."
docker run -d \
--name gateway \
--network dancenet \
--restart unless-stopped \
-p 443:443 \
-p 80:80 \
-v /certs/dance:/certs/dance/:ro \
-v /static/:/static/ \
-e ADDR=:443 \
-e TLSKEY=/certs/dance/dasc.capstone.ischool.uw.edu-key.pem \
-e TLSCERT=/certs/dance/dasc.capstone.ischool.uw.edu-cert.pem \
-e TEMPLATESPATH=/static/assets/tpl/ \
-e HTTPREDIRADDR=:80 \
-e REDISADDR=redis:6379 \
-e MYSQLADDR=mysql:3306 \
-e MYSQLPASS=$MYSQLPASS \
-e MYSQLDBNAME=DanceDB \
-e SESSIONKEY=$(uuidgen) \
-e MAILUSER=$MAILUSER \
-e MAILPASS=$MAILPASS \
-e RESETPASSWORDCLIENTPATH=/static/clients/passwordreset/ \
-e ADMINCONSOLEPATH=/static/clients/console/ \
-e FRONTENDPATH=/static/clients/frontend/build/ \
-e TERMSPATH=/static/clients/terms/ \
-e ASSETSPATH=/static/assets/ \
-e STAGE_ADMIN_FIRSTNAME=Brendan \
-e STAGE_ADMIN_LASTNAME=Kellogg \
-e STAGE_ADMIN_EMAIL=brendan@dobsis.org \
-e STAGE_ADMIN_PASSWORD=$STAGE_ADMIN_PASSWORD \
brendankellogg/dancegateway
