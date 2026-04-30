FROM python:3.12-slim AS builder
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim AS production
WORKDIR /app
COPY --from=builder /install /usr/local
COPY backend/ ./
ENV DATABASE_URL=sqlite:////data/property_pi.db
ENV JWT_SECRET=change-me-in-production
ENV JWT_EXPIRATION_MINUTES=120
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
