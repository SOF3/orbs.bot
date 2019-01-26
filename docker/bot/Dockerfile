FROM node:8

USER root
RUN mkdir /orbs
WORKDIR /orbs

RUN apt-get update && apt-get install -y r-base

RUN npm install -g typescript ts-node
ADD run.sh /orbs/run.sh

CMD /orbs/run.sh
