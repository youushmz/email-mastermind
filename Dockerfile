# ============================================================
# Stage 1: Install ALL dependencies (including devDependencies)
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# إجبار development لتثبيت devDependencies بغض النظر عن ARG من Coolify
RUN NODE_ENV=development npm ci

# ============================================================
# Stage 2: Build client + server
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# إجبار development حتى تعمل أدوات البناء (tsx, vite, esbuild)
RUN NODE_ENV=development npm run build

# ============================================================
# Stage 3: Production image
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.cjs"]
