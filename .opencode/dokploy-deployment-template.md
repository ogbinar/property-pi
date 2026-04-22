# Dokploy Deployment Guide - Generic Template

This is a reusable deployment guide for deploying any GitHub repository to Dokploy using Docker Compose.

---

## 1. Repo Assessment Template

### Application Type
- **Framework:** (e.g., Next.js, Express, FastAPI, Django, Go, etc.)
- **Language/Runtime:** (e.g., Node.js 20, Python 3.12, Go 1.21)
- **Architecture:** (e.g., Single app, app + database, app + worker)

### Containerization Status
- **Dockerfile exists:** Yes/No
- **docker-compose.yml exists:** Yes/No
- **Production-ready:** Yes/No

### Runtime Requirements
- **Ports:** (e.g., 3000, 8000, 8080)
- **Environment Variables:** (list required vars)
- **Build Command:** (e.g., `npm run build`, `pip install -r requirements.txt`)
- **Start Command:** (e.g., `node server.js`, `uvicorn main:app`)
- **Database needed:** Yes/No (type: PostgreSQL, MySQL, SQLite, etc.)
- **Cache/Worker needed:** Yes/No (type: Redis, Celery, etc.)

---

## 2. Files to Create/Update

### Required Files
| File | Purpose | Status |
|------|---------|--------|
| `Dockerfile` | Production container build | Create/Update |
| `.dockerignore` | Exclude unnecessary files | Create/Update |
| `docker-compose.yml` | Service orchestration | Create/Update |
| `.env.example` | Environment variable template | Create |
| `DEPLOYMENT.md` | Deployment instructions | Create |

---

## 3. File Contents Templates

### Dockerfile (Multi-stage for Node.js/Next.js)
```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
```

### Dockerfile (Python/FastAPI)
```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS production
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY . .
ENV PORT=8000
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### .dockerignore
```
# Dependencies
node_modules
__pycache__
*.pyc
.venv

# Build artifacts
.next
dist
build
*.log

# Development
.env
.env.local
.env.*.local
.vscode
.idea

# Git
.git
.gitignore

# Documentation
*.md
docs/

# Testing
coverage
.nyc_output
*.test.*
*.spec.*
tests/

# Misc
.DS_Store
*.swp
```

### docker-compose.yml (Single Service)
```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${PROJECT_NAME:-myapp}-app
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      # Add other env vars here
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### docker-compose.yml (App + Database)
```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${PROJECT_NAME:-myapp}-app
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/${PROJECT_NAME:-myapp}
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    container_name: ${PROJECT_NAME:-myapp}-db
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=${PROJECT_NAME:-myapp}
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db_data:
```

### .env.example
```env
# Project Configuration
PROJECT_NAME=myapp

# Application
NODE_ENV=production
PORT=3000

# Database (if needed)
DATABASE_URL=postgresql://user:password@db:5432/myapp

# Secrets (generate your own!)
JWT_SECRET=your-secret-key-here
API_KEY=your-api-key-here

# External Services
# Add any third-party API keys here
```

### DEPLOYMENT.md
```markdown
# Deployment Guide for <Project Name>

## Repository Assessment

**Application Type:** <e.g., Next.js + FastAPI + PocketBase>
**Runtime:** Node.js 20, Python 3.12
**Architecture:** Multi-service (frontend, backend, database)

## Files Created

- ✅ `Dockerfile` - Production-ready multi-stage build
- ✅ `.dockerignore` - Optimized build context
- ✅ `docker-compose.yml` - Service orchestration
- ✅ `.env.example` - Environment variable template
- ✅ `DEPLOYMENT.md` - This guide

## Required Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PROJECT_NAME` | Project identifier | myapp |
| `NODE_ENV` | Runtime environment | production |
| `PORT` | App port | 3000 |
| `DATABASE_URL` | Database connection | - |
| `JWT_SECRET` | JWT signing key | - |

## Deploy to Dokploy

### Step 1: Access Dokploy Dashboard
Navigate to: https://dokploy.ogbinar.com

### Step 2: Create New Application
1. Click "New Application" or "New Stack"
2. Select "GitHub" as source
3. Connect your GitHub account
4. Select repository: `ogbinar/<project-name>`

### Step 3: Configure Application
- **Name:** `<project-name>`
- **Branch:** `main` (or `master`)
- **Build Command:** `npm run build` (or your build command)
- **Start Command:** `npm start` (or your start command)
- **Root Directory:** `/`

### Step 4: Set Environment Variables
Copy from `.env.example` and fill in actual values:
```
PROJECT_NAME=<project-name>
NODE_ENV=production
PORT=3000
# Add other required variables
```

### Step 5: Attach Domain
- **Domain:** `<project-name>.apps.ogbinar.com`
- Enable HTTPS (Let's Encrypt)

### Step 6: Deploy
Click "Deploy" and monitor logs

## Post-Deploy Checks

1. **Health Check:**
   ```bash
   curl https://<project-name>.apps.ogbinar.com/health
   ```

2. **Main Page:**
   ```bash
   curl https://<project-name>.apps.ogbinar.com
   ```

3. **Check Logs:**
   - Dokploy Dashboard → Application → Logs
   - Look for startup errors

4. **Test Critical Features:**
   - Login/Authentication
   - Database connectivity
   - API endpoints

## Troubleshooting

### Build Fails
- Check build logs in Dokploy dashboard
- Verify `package.json` or `requirements.txt` is correct
- Ensure all dependencies are listed

### App Won't Start
- Check start command configuration
- Verify environment variables are set
- Review application logs for errors

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database service is healthy
- Ensure database credentials are correct

### Domain Not Working
- Verify DNS propagation (if using custom domain)
- Check HTTPS certificate status
- Review Dokploy reverse proxy logs

## Support

- Dokploy Docs: https://docs.dokploy.com
- Project Issues: https://github.com/ogbinar/<project-name>/issues
```

---

## 4. Dokploy Setup Checklist

### Pre-Deployment
- [ ] Repository pushed to GitHub
- [ ] Dockerfile created and tested locally
- [ ] docker-compose.yml configured
- [ ] `.env.example` completed with actual values
- [ ] Domain DNS configured (if custom domain)

### Dokploy Configuration
- [ ] Access Dokploy dashboard: https://dokploy.ogbinar.com
- [ ] Create new application/stack
- [ ] Connect GitHub repository
- [ ] Set branch (main/master)
- [ ] Configure build/start commands
- [ ] Set environment variables
- [ ] Attach domain: `<project-name>.apps.ogbinar.com`
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Configure persistent volumes (if needed)

### Deployment
- [ ] Click "Deploy"
- [ ] Monitor build logs
- [ ] Wait for health check to pass
- [ ] Verify app responds on domain
- [ ] Test critical functionality

### Post-Deployment
- [ ] Health check passes
- [ ] Main page loads
- [ ] Authentication works
- [ ] Database operations work
- [ ] Logs show no errors
- [ ] HTTPS certificate valid

---

## 5. Validation & Smoke Tests

### Basic Health Checks
```bash
# Check if app responds
curl -I https://<project-name>.apps.ogbinar.com

# Check health endpoint (if available)
curl https://<project-name>.apps.ogbinar.com/health

# Check API endpoints
curl https://<project-name>.apps.ogbinar.com/api/health
```

### Functional Tests
- [ ] User can access homepage
- [ ] User can login (if auth required)
- [ ] User can perform main action (e.g., create, read, update)
- [ ] Database operations work
- [ ] External API calls succeed (if applicable)

### Performance Checks
```bash
# Check response time
time curl https://<project-name>.apps.ogbinar.com

# Check SSL certificate
openssl s_client -connect <project-name>.apps.ogbinar.com:443
```

### Log Verification
```bash
# View recent logs (via Dokploy dashboard or Docker)
docker logs <project-name>-app --tail 50

# Check for errors
docker logs <project-name>-app 2>&1 | grep -i error
```

---

## 6. Quick Reference Commands

### Local Testing
```bash
# Build locally
docker compose build

# Run locally
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Dokploy CLI (if available)
```bash
# Deploy via CLI
dokploy deploy --app <app-name>

# View logs
dokploy logs --app <app-name>

# Restart
dokploy restart --app <app-name>
```

---

*Template Version: 1.0*
*Last Updated: 2026-04-23*
