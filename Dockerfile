# Build Stage
FROM node:20-slim AS builder
WORKDIR /app
ENV GENERATE_SOURCEMAP=false

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
# Clean and Build
RUN rm -rf node_modules .next package-lock.json
RUN npm install
RUN npm run build

# Production Stage - Nginx
FROM nginx:alpine
# Copy the static export output to Nginx html directory
COPY --from=builder /app/out /usr/share/nginx/html

# Expose port and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
