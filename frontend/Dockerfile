# Use the official lightweight Node.js image
FROM node:20-bullseye-slim

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (use --legacy-peer-deps for potential Chart.js issues)
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

RUN npm install -g serve

# Serve the React application
CMD ["npx", "serve", "-s", "build", "-l", "3000"]