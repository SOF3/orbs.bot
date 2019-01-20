#!/bin/bash

NODE_ENV=development npm install
/home/node/.npm-packages/bin/tsc
echo Starting >> output.log
while true; do
	(npm start 2>&1 >> output.log) || return
	echo Restarting >> output.log
	/home/node/.npm-packages/bin/tsc >> output.log
done
