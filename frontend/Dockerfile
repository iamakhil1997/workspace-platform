# Stage 1: Builder
# Use Debian slim instead of Alpine for better stability/compatibility
FROM node:20-slim AS builder
WORKDIR /app

# Disable source maps to save memory during build (crucial for free tier)
ENV GENERATE_SOURCEMAP=false

COPY package.json ./
# Clean install dependencies
RUN npm install

COPY . .
# Build the application
RUN npm run build

# Stage 2: Production Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Bind to 0.0.0.0 to ensure Render (and other platforms) can detect the service
ENV HOSTNAME="0.0.0.0"

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Start command
CMD npx next start -H 0.0.0.0 -p $PORT
