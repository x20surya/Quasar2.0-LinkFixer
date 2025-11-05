FROM node:24-alpine

WORKDIR /src

COPY package* ./

RUN npm install

EXPOSE 5000

COPY . .

CMD ["npm", "run", "dev"]