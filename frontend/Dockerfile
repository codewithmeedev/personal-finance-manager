# Use the official Node.js image
FROM node:20-bullseye-slim

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies (includes dev dependencies)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the entire source code into the container
COPY . .

# Build the application (assumes output is in the "dist" folder)
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Install serve globally so we can serve the production build
RUN npm install -g serve

# Default command: serve the built app in single-page mode
CMD ["serve", "-s", "dist", "-l", "3000"]
