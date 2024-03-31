FROM node:10-alpine

ENV OPNSENSE_PROTO = http
ENV OPNSENSE_ADDR = 192.168.0.1
ENV OPNSENSE_PORT = 80
ENV OPNSENSE_API_KEY = NONE
ENV OPNSENSE_API_SECRET = NONE
ENV APP_PORT = 8080
ENV APP_API_KEY = THIS_IS_TEMPORARY_KEY_REPLACE_ME

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .

EXPOSE 8080
CMD [ "node", "app.js" ]