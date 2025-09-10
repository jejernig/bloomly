# Bloomly.io - Production Dockerfile for TrueNAS Deployment
# Multi-stage build for optimized production image

# Stage 1: Dependencies and Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies needed for node-gyp and native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    librsvg-dev

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci --ignore-scripts && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client (if using Prisma)
# RUN npx prisma generate

# Build the application (use Docker-specific ESLint config)
RUN cp .eslintrc.json .eslintrc.json.bak && \
    cp .eslintrc.docker.json .eslintrc.json && \
    npm run build && \
    mv .eslintrc.json.bak .eslintrc.json

# Stage 2: Production Runtime
FROM node:20-alpine AS runtime

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    cairo \
    jpeg \
    pango \
    giflib \
    librsvg

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Create logs directory
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]