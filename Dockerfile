FROM node:18.15.0-alpine3.17
WORKDIR /usr/src/app
COPY package.json ./
RUN yarn install
COPY . .
RUN yarn build
CMD ["yarn", "start"]