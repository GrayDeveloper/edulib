FROM node:22-alpine

WORKDIR /usr/src/backend

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "start" ]