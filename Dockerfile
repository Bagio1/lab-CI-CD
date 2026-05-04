# =============================================================================
# Stage 1 – Builder
# Installs ALL dependencies (including devDeps) and compiles TypeScript.
# Uses Debian-slim instead of Alpine so OpenSSL is available for Prisma CLI.
# =============================================================================
FROM node:20-slim AS builder

# Set working directory inside the container
WORKDIR /app

# Install OpenSSL – required by the Prisma schema engine binary at build time
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package manifests first to maximise Docker layer-cache reuse:
# if these files haven't changed, npm ci is skipped on rebuild.
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (devDeps needed for tsc compilation + prisma generate)
RUN npm ci

# Generate Prisma Client so the typed DB client exists before tsc runs
RUN npx prisma generate

# Copy TypeScript config files needed for compilation
COPY tsconfig.build.json ./
COPY tsconfig.json ./

# Copy application source code
COPY src ./src/

# Compile TypeScript → JavaScript output in /app/dist
RUN npm run build

# =============================================================================
# Stage 2 – Production
# Lean image with only runtime dependencies; runs as a non-root user.
# =============================================================================
FROM node:20-slim AS production

# Install OpenSSL – required by Prisma at runtime (migrate + query engine)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create a dedicated non-root user/group for security (never run as root in prod)
RUN groupadd -g 1001 appgroup && useradd -u 1001 -g appgroup -s /bin/sh appuser

# Set working directory
WORKDIR /app

# Copy only the manifests and schema needed for the production npm install
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only (no devDeps → smaller image)
# Then generate the Prisma Client for the production node_modules
RUN npm ci --only=production \
 && npx prisma generate

# Pull the compiled JS from the builder stage (avoids shipping TypeScript/devDeps)
COPY --from=builder /app/dist ./dist

# Give the non-root user ownership of the app directory
RUN chown -R appuser:appgroup /app

# Switch to the non-root user for all subsequent commands
USER appuser

# Document the port the app listens on (actual binding happens in docker-compose / -p flag)
EXPOSE 3000

# Docker health check – marks container unhealthy if /health stops responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Default command: start the compiled Node.js server
CMD ["node", "dist/server.js"]
