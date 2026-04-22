# Dokploy Deployment Guide for Property-Pi

## Overview

This guide covers deploying Property-Pi to Dokploy, a self-hosted PaaS for Docker deployments.

**Architecture:**
```
┌─────────────────────────────────────┐
│         Dokploy Server              │
│                                     │
│  ┌──────────────┐                   │
│  │   Nginx      │ ← Reverse Proxy   │
│  │  (Proxy)     │   Port 80/443     │
│  └──────┬───────┘                   │
│         │                           │
│  ┌──────┴───────┐  ┌────────────┐  │
│  │ Next.js App  │  │ PocketBase │  │
│  │  Port 3000   │  │  Port 8090 │  │
│  └──────────────┘  └────────────┘  │
│         │                           │
│  ┌──────┴───────┐                   │
│  │  FastAPI     │                   │
│  │  Port 8000   │                   │
│  └──────────────┘                   │
└─────────────────────────────────────┘
```

## Prerequisites

1. **Dokploy Server** installed and running
   - Follow: https://dokploy.com/docs/introduction/getting-started
   - Minimum: 2GB RAM, 2 vCPU

2. **Domain** (optional but recommended)
   - Point DNS to your server IP
   - OR use server IP directly

3. **Git repository** with Property-Pi code
   - GitHub/GitLab repository URL

## Step 1: Prepare Your Server

```bash
# Install Docker (if not already installed)
curl -fsSL https://get.docker.com | sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker is running
docker --version
docker compose version
```

## Step 2: Install Dokploy

```bash
# Install Dokploy CLI
curl -fsSL https://dokploy.com/install.sh | sh

# Start Dokploy
dokploy up -d

# Access Dokploy dashboard
# Open: http://your-server-ip:3000
```

## Step 3: Create Application in Dokploy

### Option A: From GitHub Repository

1. **Login to Dokploy Dashboard**
   - Navigate to `http://your-server-ip:3000`
   - Create admin account

2. **Create New Application**
   - Click "New Application"
   - Select "GitHub" as source
   - Connect your GitHub account
   - Select `property-pi` repository

3. **Configure Application**
   ```
   Name: property-pi
   Repository: your-username/property-pi
   Branch: main
   Build Command: npm run build
   Start Command: npx next start -p 3000
   Root Directory: /
   ```

4. **Add Environment Variables**
   ```
   NEXT_PUBLIC_POCKETBASE_URL=http://your-domain.com:8090
   NEXT_PUBLIC_API_URL=http://your-domain.com:8000
   ```

5. **Deploy** - Click "Deploy"

### Option B: Using docker-compose.yml

1. **Create Stack**
   - Click "New Stack"
   - Name: `property-pi`

2. **Upload docker-compose.dokploy.yml**
   - Copy contents from `docker-compose.dokploy.yml`
   - Or upload from repository

3. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_POCKETBASE_URL=http://your-domain.com:8090
   NEXT_PUBLIC_API_URL=http://your-domain.com:8000
   BACKEND_POCKETBASE_ADMIN_TOKEN=your-token
   BACKEND_SECRET_KEY=your-secret-key
   CORS_ORIGINS=http://your-domain.com,http://localhost:3000
   ```

4. **Deploy Stack**

## Step 4: Configure PocketBase

1. **Access PocketBase Admin UI**
   ```
   http://your-domain.com:8090/_/
   ```

2. **Create Admin Account**
   - Email: your-email@example.com
   - Password: strong-password

3. **Create Collections**
   
   Go to "Settings" → "Create Collection" for each:

   **users** (default already exists)
   - email (email, required)
   - password (password, required)
   - name (text)

   **units**
   - unitNumber (text, required, unique)
   - type (select: Studio, 1BR, 2BR, 3BR, Other)
   - status (select: vacant, occupied, maintenance, renovation)
   - rentAmount (number, required)
   - securityDeposit (number)

   **tenants**
   - firstName (text, required)
   - lastName (text, required)
   - email (email, required, unique)
   - phone (text)
   - emergencyContact (text)

   **leases**
   - tenant (relation → tenants, required)
   - unit (relation → units, required)
   - startDate (date, required)
   - endDate (date, required)
   - rentAmount (number, required)
   - status (select: active, expired, terminated, renewal_pending)

   **payments**
   - lease (relation → leases, required)
   - amount (number, required)
   - paymentDate (date, required)
   - dueDate (date, required)
   - status (select: pending, paid, overdue, partial)
   - paymentMethod (select: cash, transfer, check)

   **expenses**
   - title (text, required)
   - amount (number, required)
   - date (date, required)
   - category (select: maintenance, utilities, insurance, taxes, other)
   - description (text)

   **maintenance_requests**
   - unit (relation → units, required)
   - tenant (relation → tenants)
   - description (text, required)
   - priority (select: low, medium, high, urgent)
   - status (select: pending, in_progress, completed)
   - dateRequested (date, required)

4. **Configure API Settings**
   - Settings → API
   - **Allowed Origins (CORS)**: `http://your-domain.com,http://localhost:3000`
   - **Generate Admin Token**: Copy for backend env var

## Step 5: Configure Reverse Proxy (Optional)

If using Dokploy's built-in Nginx proxy:

1. **Add Reverse Proxy**
   - Dashboard → Reverse Proxy → New
   - Name: property-pi-proxy
   - Domains: `property-pi.your-domain.com`

2. **Configure Services**
   ```
   Frontend: app:3000
   PocketBase: pocketbase:8090
   Backend: backend:8000
   ```

3. **SSL/TLS**
   - Enable Let's Encrypt
   - Enter your email

## Step 6: Update Environment Variables

After deployment, update the actual URLs:

1. **In Dokploy Dashboard**
   - Go to your application/stack
   - Edit Environment Variables
   - Update `NEXT_PUBLIC_POCKETBASE_URL` and `NEXT_PUBLIC_API_URL`
   - Redeploy

2. **In PocketBase**
   - Update Allowed Origins with new domain

## Step 7: Verify Deployment

### Check Services

```bash
# List running containers
docker ps

# Should show:
# - property-pi-app
# - property-pi-api
# - property-pi-pb
```

### Test Endpoints

```bash
# Frontend
curl http://your-domain.com:3000

# Backend Health
curl http://your-domain.com:8000/api/health

# PocketBase Health
curl http://your-domain.com:8090/api/health
```

### Test Login

1. Open `http://your-domain.com:3000/login`
2. Login with PocketBase admin credentials
3. Verify dashboard loads

## Troubleshooting

### Frontend can't connect to PocketBase

```bash
# Check environment variables
docker exec property-pi-app env | grep POCKETBASE

# Should show: NEXT_PUBLIC_POCKETBASE_URL=http://your-domain.com:8090
```

### Backend can't connect to PocketBase

```bash
# Check backend logs
docker logs property-pi-api

# Verify PocketBase URL
docker exec property-pi-api env | grep POCKETBASE

# Should show: BACKEND_POCKETBASE_URL=http://pocketbase:8090
```

### PocketBase data not persisting

```bash
# Check volume mount
docker volume ls | grep pb_data

# Verify data exists
docker exec property-pi-pb ls -la /pb_data
```

### Port conflicts

If ports 3000, 8000, or 8090 are already in use:

```yaml
# Update docker-compose.dokploy.yml
ports:
  - "3001:3000"  # Change frontend port
  - "8001:8000"  # Change backend port
  - "8091:8090"  # Change PocketBase port
```

## Backup Strategy

### Manual Backup

```bash
# Backup PocketBase data
docker cp property-pi-pb:/pb_data ./backup-pb-$(date +%Y%m%d)

# Backup database
docker exec property-pi-pb ./pocketbase dumps create /pb_data/backup.db
```

### Automated Backup

Create cron job:

```bash
# Edit crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * docker exec property-pi-pb ./pocketbase dumps create /pb_data/backup-$(date +\%Y\%m\%d).db
```

## Monitoring

### View Logs

```bash
# All services
docker-compose -f docker-compose.dokploy.yml logs -f

# Specific service
docker logs -f property-pi-app
docker logs -f property-pi-api
docker logs -f property-pi-pb
```

### Resource Usage

```bash
docker stats property-pi-app property-pi-api property-pi-pb
```

## Scaling

### Vertical Scaling

Increase resources in Dokploy:
- Dashboard → Application → Resources
- Increase CPU/RAM limits

### Horizontal Scaling

For production with multiple instances:
- Use Dokploy's load balancing
- Deploy multiple replicas
- Use external Redis for session sharing

## Cost Estimate

**Self-hosted on VPS:**
- DigitalOcean Droplet: $6-12/month
- Linode: $5-10/month
- Hetzner: €4-8/month

**Includes:**
- Frontend, Backend, Database
- Full control
- No per-request fees

## Next Steps

1. **Setup monitoring** (Uptime Kuma, Prometheus)
2. **Configure backups** (automated daily)
3. **Setup SSL** (Let's Encrypt via Dokploy)
4. **Enable logging** (ELK stack or similar)
5. **Configure CI/CD** (auto-deploy on git push)

## Support

- Dokploy Docs: https://dokploy.com/docs
- Property-Pi Issues: GitHub repository
- Community: Dokploy Discord/Forum
