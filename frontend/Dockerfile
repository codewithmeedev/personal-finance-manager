# Use the official Node.js image
FROM node:20-bullseye-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application and build it
COPY . .
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Install serve globally
RUN npm install -g serve

# Serve the React application from the "dist" folder in single-page mode
CMD ["serve", "-s", "dist", "-l", "3000"]
