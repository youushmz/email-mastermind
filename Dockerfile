# ============================================================
# Stage 1: Install ALL dependencies (including devDependencies)
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# تثبيت كل الحزم بما فيها devDependencies (vite, esbuild, tsx مطلوبة للبناء)
RUN npm ci

# ============================================================
# Stage 2: Build client + server
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# نسخ node_modules الكاملة من المرحلة السابقة
COPY --from=deps /app/node_modules ./node_modules

# نسخ كل ملفات المشروع
COPY . .

# تشغيل سكريبت البناء (يبني client بـ vite ثم server بـ esbuild)
RUN npm run build

# ============================================================
# Stage 3: Production image (خفيف - بدون devDependencies)
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# تثبيت حزم الإنتاج فقط
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# نسخ ملفات البناء من مرحلة builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.cjs"]
