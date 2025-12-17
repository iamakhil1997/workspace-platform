# Root Dockerfile for Frontend Deployment
# Use Debian slim
FROM node:20-slim AS builder
WORKDIR /app

# Disable source maps
ENV GENERATE_SOURCEMAP=false

# Copy Frontend Source Code (including package.json)
COPY frontend/ ./

# 1. Clean any local artifacts
RUN rm -rf node_modules .next package-lock.json

# 2. Install dependencies (Clean Slate)
RUN npm install

# 3. Build
RUN npm run build

# Stage 2: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Copy standalone build (much smaller, includes dependencies)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
# Standalone mode runs server.js
CMD ["node", "server.js"]
