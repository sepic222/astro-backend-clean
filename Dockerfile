FROM node:18-bullseye

# Native build deps for swisseph.
# ca-certificates is already in the node:18-bullseye image. Asking apt for it made every build since
# 2026-11-12 fail: apt tried to upgrade it from bullseye-security, where that file now returns 404.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential pkg-config \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first for better cache
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Generate Prisma client at build time
RUN npx prisma generate || true

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Run migrations, seed database, then launch server
# Seed is idempotent (uses upsert), safe to run on every deploy
CMD sh -c "npx prisma migrate deploy && npm run seed && node server.js"
