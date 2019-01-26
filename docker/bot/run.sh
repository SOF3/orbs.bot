#!/bin/bash

set -x

cd /orbs
: >.package.json.mtime

function npm-install {
	if [[ ! `stat -c %Y package.json` -eq `cat .package.json.mtime` ]]; then
		npm install
		stat -c %Y package.json > .package.json.mtime
	fi
}

while true; do
	npm-install
	ts-node ./src 2>&1
done
