# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Bundle app source
COPY . .

# Expose the port (default from .env)
ENV PORT=5000
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]

