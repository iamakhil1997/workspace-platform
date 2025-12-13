# frontend/Dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
COPY . .
# Remove any local node_modules copied from Windows to prevent binary incompatibility
RUN rm -rf node_modules package-lock.json && npm install && npm run build

# Production stage
# Production stage - Run Next.js server directly
# Production stage - Serve with Nginx (Guaranteed Stability)
FROM nginx:alpine
COPY --from=builder /app/.next/server /usr/share/nginx/html
# Next.js standalone output? No, let's just stick to Node runner but simplified.
# Actually, the user wants it to WORK. The node runner is failing likely due to path/copy issues.
# Revert to the Node runner but ensuring 0.0.0.0 binding which previously worked but failed on .dockerignore.
# The previous "0.0.0.0" fix worked# Robust Setup:
# 1. Clean any existing artifacts
# 2. Install dependencies fresh
# 3. Build
RUN rm -rf node_modules package-lock.json .next
RUN npm install
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Explicitly bind to 0.0.0.0 to fix "Loading..." hang
CMD npx next start -H 0.0.0.0 -p $PORT -H 0.0.0.0 -p $PORT
