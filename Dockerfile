# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --prefix frontend

# Stage 2: Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
ENV VITE_API_BASE_URL=/api
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --prefix frontend
COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/frontend/dist ./dist
EXPOSE 5173
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
