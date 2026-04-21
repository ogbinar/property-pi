# Deployment Guide

This guide covers deploying Property-Pi to production.

## Architecture Overview

```
┌─────────────┐
│   Vercel    │ ← Next.js Frontend (https://yourapp.vercel.app)
│  (Frontend) │
└──────┬──────┘
       │
       ├──────────────────────────────┐
       │                              │
       ▼                              ▼
┌─────────────┐              ┌─────────────┐
│ PocketBase  │              │  FastAPI    │
│   (BaaS)    │              │  (Backend)  │
│  Railway/fly│              │ Railway/fly │
└─────────────┘              └─────────────┘
```

## Prerequisites

- **Vercel account** (free tier works)
- **Railway or fly.io account** for PocketBase + FastAPI
- **Domain** (optional, Vercel provides free subdomain)

## Option 1: Railway Deployment (Recommended)

Railway provides easy deployment for both PocketBase and FastAPI.

### Step 1: Deploy PocketBase to Railway

1. **Create Railway account** at [railway.app](https://railway.app)

2. **Create new project** → "Deploy from GitHub repo"

3. **PocketBase Service:**
   - Create a new service from Docker image: `pocketbase/pocketbase:latest`
   - Environment variables:
     ```
     PUBLIC_URL=https://your-pb.railway.app
     ```
   - Expose port `8090`
   - Enable persistent volume for `pb_data`

4. **Get your PocketBase URL** from Railway dashboard

### Step 2: Deploy FastAPI to Railway

1. **Create new service** from your GitHub repo

2. **Configure:**
   - Build command: `cd backend && pip install -r requirements.txt`
   - Start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Root directory: `backend`

3. **Environment variables:**
   ```
   BACKEND_POCKETBASE_URL=https://your-pb.railway.app
   BACKEND_POCKETBASE_ADMIN_TOKEN=your-admin-token
   PORT=8000
   ```

### Step 3: Deploy Frontend to Vercel

1. **Create Vercel account** at [vercel.com](https://vercel.com)

2. **Import your GitHub repo**

3. **Configure:**
   - Framework preset: Next.js
   - Root directory: `/`
   - Build command: `npm run build`
   - Output directory: `.next`

4. **Environment variables:**
   ```
   NEXT_PUBLIC_POCKETBASE_URL=https://your-pb.railway.app
   ```

5. **Deploy**

### Step 4: Update Configuration

1. **PocketBase Settings:**
   - Go to Admin UI → Settings → API
   - Add your Vercel URL to "Allowed Origins"
   - Generate admin token for FastAPI

2. **Test the deployment:**
   - Visit your Vercel URL
   - Login with PocketBase credentials
   - Verify data loads correctly

## Option 2: fly.io Deployment

### Step 1: Deploy PocketBase to fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create app
fly apps create property-pi-pb

# Create fly.toml
cat > fly.toml << EOF
app = "property-pi-pb"

[http_service]
  internal_port = 8090
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true

[mounts]
  source = "pb_data"
  destination = "/app/pb_data"

[[vm]]
  size = "shared-cpu-1x"
EOF

# Deploy
fly deploy
```

### Step 2: Deploy FastAPI to fly.io

```bash
# Create app
fly apps create property-pi-api

# Create fly.toml in backend directory
cat > backend/fly.toml << EOF
app = "property-pi-api"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true

[[vm]]
  size = "shared-cpu-1x"
EOF

# Deploy
cd backend
fly deploy

# Set environment variables
fly secrets set BACKEND_POCKETBASE_URL=https://property-pi-pb.fly.dev
fly secrets set BACKEND_POCKETBASE_ADMIN_TOKEN=your-token
```

### Step 3: Deploy Frontend to Vercel

Same as Option 1, Step 3.

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_POCKETBASE_URL` | PocketBase public URL | `https://your-pb.railway.app` |

### Backend (Railway/fly.io)

| Variable | Description | Example |
|----------|-------------|---------|
| `BACKEND_POCKETBASE_URL` | PocketBase internal URL | `https://your-pb.railway.app` |
| `BACKEND_POCKETBASE_ADMIN_TOKEN` | Admin token for API access | `your-token-here` |
| `PORT` | Server port (Railway sets this) | `8000` |

## PocketBase Configuration

### Creating Admin Token

1. Open PocketBase Admin UI
2. Go to **Settings** → **API**
3. Scroll to **Admin Authentication Token**
4. Click **Generate**
5. Copy the token (shown only once!)
6. Add to `BACKEND_POCKETBASE_ADMIN_TOKEN` environment variable

### Configuring CORS

1. Go to **Settings** → **API**
2. **Allowed Origins (CORS)**: Add your Vercel URL
   - Development: `http://localhost:3000`
   - Production: `https://yourapp.vercel.app`
   - Use `*` for testing (not recommended for production)

### Setting Up Collections

Create these collections in PocketBase:

1. **users** (default)
   - Email (email, required)
   - Password (password, required)

2. **units**
   - unitNumber (text, required, unique)
   - type (select: Studio, 1BR, 2BR, 3BR, Other)
   - status (select: vacant, occupied, maintenance, renovation)
   - rentAmount (number, required)
   - securityDeposit (number)

3. **tenants**
   - firstName (text, required)
   - lastName (text, required)
   - email (email, required, unique)
   - phone (text)
   - emergencyContact (text)

4. **leases**
   - tenant (relation → tenants, required)
   - unit (relation → units, required)
   - startDate (date, required)
   - endDate (date, required)
   - rentAmount (number, required)
   - status (select: active, expired, terminated, renewal_pending)

5. **payments**
   - lease (relation → leases, required)
   - amount (number, required)
   - paymentDate (date, required)
   - dueDate (date, required)
   - status (select: pending, paid, overdue, partial)
   - paymentMethod (select: cash, transfer, check)

6. **expenses**
   - title (text, required)
   - amount (number, required)
   - date (date, required)
   - category (select: maintenance, utilities, insurance, taxes, other)
   - description (text)

7. **maintenance_requests**
   - unit (relation → units, required)
   - tenant (relation → tenants)
   - description (text, required)
   - priority (select: low, medium, high, urgent)
   - status (select: pending, in_progress, completed)
   - dateRequested (date, required)

## Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- View deployment logs, performance metrics

### Railway/fly.io Monitoring
- Railway: Dashboard shows resource usage, logs
- fly.io: `fly logs` for logs, `fly status` for machine status

### PocketBase Monitoring
- Enable logging in PocketBase
- Monitor disk usage for `pb_data` volume

## Backup Strategy

### PocketBase Backup

```bash
# Local backup
./pocketbase dumps create backup-$(date +%Y%m%d).db

# Automated backup (cron on Railway/fly.io)
0 2 * * * /app/pocketbase dumps create /data/backups/backup-$(date +\%Y\%m\%d).db
```

### Database Backup
- PocketBase uses SQLite - backup the entire `pb_data` directory
- Railway: Automatic backups enabled by default
- fly.io: Set up volume snapshots

## Scaling

### When to Scale

- **Frontend (Vercel)**: Automatic scaling, no action needed
- **PocketBase**: Upgrade to dedicated CPU if >100 concurrent users
- **FastAPI**: Add more instances if CPU >80%

### Cost Optimization

- Use Railway free tier for small deployments (<500 hours/month)
- Use fly.io shared-cpu-1x for cost efficiency
- Enable auto-stop on Railway for development

## Troubleshooting

### Frontend can't connect to PocketBase
- Check CORS settings in PocketBase
- Verify `NEXT_PUBLIC_POCKETBASE_URL` is correct
- Ensure PocketBase is running and accessible

### Backend can't connect to PocketBase
- Check `BACKEND_POCKETBASE_URL` is correct
- Verify admin token is valid
- Check firewall rules (port 8090)

### Deployment fails
- Check build logs in Vercel/Railway
- Verify all environment variables are set
- Test locally with same environment variables

## Support

For issues:
1. Check logs in deployment platform
2. Verify environment variables
3. Test locally with production env vars
4. Open GitHub issue with details
