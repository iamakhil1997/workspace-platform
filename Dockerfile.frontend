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

# Build
RUN npm run build

# Stage 2: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD npx next start -H 0.0.0.0 -p $PORT
