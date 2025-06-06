FROM node:slim

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json package-lock.json ./

RUN chown node:node package.json package-lock.json

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8000