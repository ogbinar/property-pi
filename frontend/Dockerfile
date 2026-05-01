FROM node:20-alpine AS builder
WORKDIR /app
ENV VITE_API_BASE_URL=/api
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 5173
ENTRYPOINT ["/docker-entrypoint.sh"]
