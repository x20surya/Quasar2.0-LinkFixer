FROM node:24-alpine

WORKDIR /src

COPY package* ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]