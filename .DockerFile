# Stage 1: Build the app
FROM node:18 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run the app
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/src/app/build ./build

EXPOSE 3000

# Запуск з глобальним crypto (якщо не змінюєш main.ts, то можна замінити node команду)
CMD ["node", "-e", "global.crypto = require('crypto'); require('./build/main')"]
