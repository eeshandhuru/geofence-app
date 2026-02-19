# Use a lightweight Node.js image
FROM node:18-alpine

# Set the directory inside the container
WORKDIR /app

# Copy package files first (better for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose the port your backend uses
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]