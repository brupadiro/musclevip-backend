FROM node:15

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . /usr/src/app
ARG APP_NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

RUN npm run build

EXPOSE 3000

ENV HOST 0.0.0.0
