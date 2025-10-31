FROM node:24-alpine

WORKDIR /app

COPY package* ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]