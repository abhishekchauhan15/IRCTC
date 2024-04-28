FROM node:14

WORKDIR /

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]
