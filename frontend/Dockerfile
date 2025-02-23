# Stage 1: Build the React app
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build

# Stage 2: Serve the built app using serve
FROM node:20-bullseye-slim
WORKDIR /app

# Copy the production build from the builder stage
COPY --from=builder /app/build ./build

# Install serve globally
RUN npm install -g serve

# Expose the port that serve will use
EXPOSE 3000

# Start the app in single-page mode (fallback to index.html)
CMD ["serve", "-s", "build", "-l", "3000"]
