# Dokploy Deployment Configuration for Property-Pi

## Target Deployment

- **Dokploy Instance:** https://dokploy.ogbinar.com
- **Domain:** prop.apps.ogbinar.com
- **Repository:** https://github.com/ogbinar/property-pi
- **Branch:** master

## Application Configuration

### Service Details
- **Service Name:** prop-app
- **Build Context:** / (root of repository)
- **Dockerfile:** Dockerfile
- **Compose File:** docker-compose.dokploy.yml

### Environment Variables

Copy these into Dokploy's environment variables section:

```env
# Frontend Configuration
NEXT_PUBLIC_POCKETBASE_URL=https://prop.apps.ogbinar.com:8090
NEXT_PUBLIC_API_URL=https://prop.apps.ogbinar.com:8000

# Backend Configuration
BACKEND_POCKETBASE_URL=http://pocketbase:8090
BACKEND_POCKETBASE_ADMIN_TOKEN=<generate-after-pocketbase-setup>
BACKEND_SECRET_KEY=<generate-random-string>
CORS_ORIGINS=https://prop.apps.ogbinar.com

# Application Settings
NODE_ENV=production
```

### Ports Configuration
- Frontend: 3000 (internal) → mapped to domain
- Backend: 8000 (internal) → mapped to domain:8000
- PocketBase: 8090 (internal) → mapped to domain:8090

### Domain Configuration
- **Primary Domain:** prop.apps.ogbinar.com
- **Subdomains:**
  - prop.apps.ogbinar.com (Frontend)
  - prop.apps.ogbinar.com:8000 (Backend API)
  - prop.apps.ogbinar.com:8090 (PocketBase)

### SSL/HTTPS
- Enable Let's Encrypt
- Certificate email: <your-email>

## Deployment Steps

### Step 1: Login to Dokploy
1. Navigate to https://dokploy.ogbinar.com
2. Login with your credentials

### Step 2: Create New Stack
1. Click "New Stack" or "New Application"
2. Select "GitHub" as source
3. Connect GitHub account (if not already connected)
4. Select repository: `ogbinar/property-pi`

### Step 3: Configure Stack
1. **Name:** `prop`
2. **Branch:** `master`
3. **Compose File:** Select `docker-compose.dokploy.yml`
4. **Root Directory:** `/`

### Step 4: Set Environment Variables
Copy the environment variables from the "Environment Variables" section above into Dokploy's environment variables configuration.

**Important:** Generate values for:
- `BACKEND_SECRET_KEY`: Run `openssl rand -base64 32`
- `BACKEND_POCKETBASE_ADMIN_TOKEN`: Will generate after PocketBase setup

### Step 5: Configure Domain
1. Add domain: `prop.apps.ogbinar.com`
2. Enable HTTPS/SSL
3. Configure subdomains for ports 8000 and 8090 if needed

### Step 6: Deploy
1. Click "Deploy"
2. Monitor build logs
3. Wait for all services to be healthy

### Step 7: Post-Deployment Setup

#### Configure PocketBase
1. Access: https://prop.apps.ogbinar.com:8090/_/
2. Create admin account
3. Create required collections (users, units, tenants, leases, payments, expenses, maintenance_requests)
4. Generate admin token (Settings → API)
5. Update `BACKEND_POCKETBASE_ADMIN_TOKEN` in Dokploy
6. Update CORS origins to include `https://prop.apps.ogbinar.com`

#### Update Environment Variables
After PocketBase is set up:
1. Update `BACKEND_POCKETBASE_ADMIN_TOKEN` with the generated token
2. Redeploy the application

### Step 8: Verify Deployment

#### Health Checks
```bash
# Frontend
curl https://prop.apps.ogbinar.com

# Backend Health
curl https://prop.apps.ogbinar.com:8000/api/health

# PocketBase Health
curl https://prop.apps.ogbinar.com:8090/api/health
```

#### Functional Tests
1. Visit https://prop.apps.ogbinar.com
2. Create admin account (if first time)
3. Login with credentials
4. Test CRUD operations for units, tenants, leases
5. Test tenant portal functionality

## Troubleshooting

### Services Won't Start
- Check Dokploy logs: Dashboard → prop → Logs
- Verify environment variables are correct
- Ensure Dockerfile paths are correct

### Frontend Can't Connect to PocketBase
- Verify `NEXT_PUBLIC_POCKETBASE_URL` is correct
- Check CORS settings in PocketBase
- Ensure PocketBase service is healthy

### Domain Not Resolving
- Check DNS propagation (can take up to 48 hours)
- Verify domain is correctly configured in Dokploy
- Check SSL certificate status

### PocketBase Data Not Persisting
- Verify volume mount in docker-compose
- Check Dokploy volume configuration

## Monitoring

### Access Logs
- Dokploy Dashboard → prop → Logs

### Service Health
- Dokploy Dashboard → prop → Services
- Check all services show "Healthy"

### Performance
- Monitor response times
- Check resource usage in Dokploy dashboard

## Support

- **Dokploy Docs:** https://docs.dokploy.com
- **Project Repo:** https://github.com/ogbinar/property-pi
- **Issue Tracker:** https://github.com/ogbinar/property-pi/issues
