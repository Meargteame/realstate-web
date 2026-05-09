FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

# We use the command from docker-compose.yml to push db and start,
# but providing a default one here.
CMD ["npm", "start"]
