FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

COPY package* ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]