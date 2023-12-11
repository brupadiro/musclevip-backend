FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN yarn install

# Bundle app source
COPY . /usr/src/app
ARG APP_NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

RUN yarn build

EXPOSE 3000

ENV HOST 0.0.0.0

CMD ["yarn","start"]
