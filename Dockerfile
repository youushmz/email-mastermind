# Stage 1 – Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2 – Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build client with Vite then server with esbuild directly
RUN node_modules/.bin/vite build
RUN node_modules/.bin/esbuild server/index.ts \
    --platform=node \
    --bundle \
    --format=cjs \
    --outfile=dist/index.cjs \
    --external:pg \
    --external:geoip-lite \
    --external:useragent \
    --external:nodemailer \
    --external:node-html-parser \
    --external:drizzle-orm \
    --external:ws \
    --minify

# Stage 3 – Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules/geoip-lite/data ./node_modules/geoip-lite/data
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 5000
CMD ["node", "dist/index.cjs"]
