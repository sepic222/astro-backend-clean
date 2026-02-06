FROM node:18-bullseye

# Native build deps for swisseph
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential pkg-config ca-certificates \
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
