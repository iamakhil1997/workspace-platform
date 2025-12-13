# frontend/Dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
COPY . .
RUN npm install && npm run build

# Production stage
# Production stage - Run Next.js server directly
FROM node:20-alpine
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start Next.js on the port defined by PORT env var (Render sets this)
# Start Next.js on the port defined by PORT env var (Render sets this)
CMD npx next start -p $PORT
