FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
ENV DEBIOENV=development HOST=0.0.0.0 PORT=3000

RUN npm run build

EXPOSE ${PORT}
CMD [ "npm", "run", "start:prod"]