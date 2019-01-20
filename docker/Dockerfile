FROM node:8
RUN mkdir /home/node/.npm-packages /home/node/app/bin -p
RUN chown node /home/node/ -R
ADD ./start.sh /home/node/app/start.sh
ADD ./npmrc /home/node/.npmrc
ADD ./bashrc /home/node/.bashrc
USER node
RUN npm install -g typescript
