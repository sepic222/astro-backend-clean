FROM node:18-bullseye

# 1) System deps for native addons (swisseph)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential pkg-config ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# 2) Workdir
WORKDIR /app

# 3) Install deps first for better cache
COPY package*.json ./
RUN npm ci --omit=dev

# 4) Copy source
COPY . .

# 5) Runtime env
ENV NODE_ENV=production
ENV PORT=3001

# 6) Prisma (generate at build; deploy migrations at runtime)
RUN npx prisma generate || true

# 7) Start: run migrations inside container, then boot server
CMD sh -c "npx prisma migrate deploy && node server.js"
