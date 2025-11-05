FROM node:18-bullseye

# System deps for native addons (swisseph)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential pkg-config ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3001

RUN npx prisma generate || true

CMD sh -c "npx prisma migrate deploy && node server.js"
