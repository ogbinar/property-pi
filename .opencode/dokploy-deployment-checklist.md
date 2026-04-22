# Dokploy Deployment Checklist for Property-Pi

## Current Configuration

| Item | Status | Value |
|------|--------|-------|
| Dokploy Instance | ✅ | `https://dokploy.ogbinar.com` |
| API Key | ✅ | `RQjKSEVFjWwgWKfHfStuUIGhoNpSMLsWGWcGxeuNEnewJfPbHXaVeCPZDuzEmPDB` |
| Docker Compose | ✅ | `docker-compose.dokploy.yml` |
| Frontend Dockerfile | ✅ | `Dockerfile` |
| Backend Dockerfile | ✅ | `backend/Dockerfile` |

## Deployment Steps

### Step 1: Access Dokploy Dashboard

1. **Navigate to:** `https://dokploy.ogbinar.com`
2. **Login:** Use the API key or create account
3. **Create Project:** Name it "property-pi"

### Step 2: Deploy Application

**Option A: Via Dashboard UI (Recommended)**

1. Click "New Application" or "New Stack"
2. Select "Docker Compose" as source
3. Copy contents from `docker-compose.dokploy.yml`
4. Add environment variables (see below)
5. Click "Deploy"

**Option B: Via Git Repository**

1. Connect GitHub/GitLab repository
2. Select `property-pi` repo
3. Choose branch (main/master)
4. Set root directory: `/`
5. Add environment variables
6. Deploy

### Step 3: Set Environment Variables

Add these to your Dokploy application/stack:

```
# Frontend
NEXT_PUBLIC_POCKETBASE_URL=https://your-subdomain.dokploy.ogbinar.com:8090
NEXT_PUBLIC_API_URL=https://your-subdomain.dokploy.ogbinar.com:8000

# Backend
BACKEND_POCKETBASE_URL=http://pocketbase:8090
BACKEND_POCKETBASE_ADMIN_TOKEN=<generate-after-setup>
BACKEND_SECRET_KEY=<generate-random-32-char>
CORS_ORIGINS=https://your-subdomain.dokploy.ogbinar.com
```

### Step 4: Configure Domains

1. **Assign Subdomain:** Dokploy will provide one like `property-pi.dokploy.ogbinar.com`
2. **Or Custom Domain:** Point DNS to Dokploy server IP
3. **Configure Routes:**
   - Frontend: `/` → app:3000
   - PocketBase: `:8090` → pocketbase:8090
   - Backend API: `:8000` → backend:8000

### Step 5: Configure PocketBase

After deployment:

1. **Access Admin UI:** `https://your-subdomain.dokploy.ogbinar.com:8090/_/`
2. **Create Admin Account:** Email + password
3. **Create Collections:**
   - users
   - units
   - tenants
   - leases
   - payments
   - expenses
   - maintenance_requests
4. **Generate Admin Token:** Settings → API → Generate Token
5. **Update CORS:** Add your frontend domain
6. **Update Environment Variable:** Set `BACKEND_POCKETBASE_ADMIN_TOKEN` in Dokploy

### Step 6: Verify Deployment

Test endpoints:

```bash
# Frontend
curl https://your-subdomain.dokploy.ogbinar.com

# Backend Health
curl https://your-subdomain.dokploy.ogbinar.com:8000/api/health

# PocketBase Health
curl https://your-subdomain.dokploy.ogbinar.com:8090/api/health
```

### Step 7: Test Application

1. Visit frontend URL
2. Login with PocketBase credentials
3. Verify dashboard loads
4. Test CRUD operations
5. Test tenant portal

## Environment Variable Generation

### Generate BACKEND_SECRET_KEY

```bash
openssl rand -base64 32
```

### Generate BACKEND_POCKETBASE_ADMIN_TOKEN

1. Login to PocketBase Admin UI
2. Go to Settings → API
3. Click "Generate" under Admin Authentication Token
4. Copy the token (shown only once!)

## Troubleshooting

### Frontend won't load

- Check Dokploy logs: Dashboard → Application → Logs
- Verify `NEXT_PUBLIC_POCKETBASE_URL` is correct
- Ensure PocketBase is healthy

### PocketBase connection errors

- Check CORS settings in PocketBase
- Verify `BACKEND_POCKETBASE_URL` is `http://pocketbase:8090` (internal)
- Check network connectivity in Dokploy

### Database not persisting

- Verify volume mount in docker-compose
- Check Dokploy volume configuration
- Ensure `pb_data` volume is configured

## Post-Deployment Tasks

- [ ] Set up automated backups
- [ ] Configure SSL/HTTPS (if not automatic)
- [ ] Set up monitoring (Uptime Kuma, etc.)
- [ ] Document production URLs
- [ ] Share tenant portal access instructions

## Next Steps After Deployment

1. Create first unit
2. Create first tenant
3. Create lease
4. Test rent tracking
5. Test maintenance requests
6. Generate tenant portal link
7. Test tenant portal access

## Support Resources

- Dokploy Docs: https://docs.dokploy.com
- Property-Pi Docs: `DEPLOYMENT-DOCKPLOY.md`
- PocketBase Docs: https://pocketbase.io/docs
