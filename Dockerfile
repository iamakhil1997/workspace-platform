# Root Dockerfile for Frontend Deployment
# Use Debian slim
FROM node:20-slim AS builder
WORKDIR /app

# Disable source maps
ENV GENERATE_SOURCEMAP=false

# Copy Frontend Package Files (Adjusted path for Root Context)
COPY frontend/package.json ./
RUN npm install

# Copy Frontend Source Code
COPY frontend/ ./
# Explicitly nuke potential Windows artifacts to guarantee Linux-only build
RUN rm -rf node_modules .next

# Build
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
