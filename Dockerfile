# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_PUBLIC_API_URL=/api
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx next telemetry disable
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
ENV NEXT_ENV_MODE=standalone
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
