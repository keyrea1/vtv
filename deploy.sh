#!/bin/bash
set -e

PACKAGE=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1).zip

if [ "$DRONE_BRANCH" = "release" ]
then
    mv index.production.html index.html
fi

zip -rq ${PACKAGE} index.html ./data ./codebase
aws s3 cp --quiet ./${PACKAGE} s3://webix-temp/${PACKAGE}
