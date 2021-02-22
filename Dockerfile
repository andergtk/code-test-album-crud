FROM node:6-alpine

WORKDIR /app

COPY package*.json .

RUN npm i --silent

COPY . .