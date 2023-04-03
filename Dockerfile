FROM --platform=linux/amd64 node:18.15.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

EXPOSE 8000

CMD [ "npm", "run", "prod" ]