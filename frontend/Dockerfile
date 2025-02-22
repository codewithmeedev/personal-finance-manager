# Stage 1: Build the app using Node 20 on Debian
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Copy package files first so that Docker can cache the npm install step.
COPY package*.json ./

# Install dependencies using a clean install.
RUN npm ci

# Copy the rest of the source code.
COPY . .

# Build the production version of your app.
RUN npm run build

# Stage 2: Serve the built app using Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
