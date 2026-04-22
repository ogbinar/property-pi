# Dokploy Configuration

## Dokploy Instance

**Instance URL:** `https://dokploy.ogbinar.com`

**API Key:** `RQjKSEVFjWwgWKfHfStuUIGhoNpSMLsWGWcGxeuNEnewJfPbHXaVeCPZDuzEmPDB`

**Status:** ✅ Configured

**Note:** This API key provides authenticated access to the Dokploy instance for deployment operations. API endpoint structure requires further investigation - dashboard access recommended for initial setup.

## Deployment Configuration

### Next Steps to Deploy

1. **Access Dokploy Dashboard**
   - URL: `https://dokploy.ogbinar.com`
   - Use API key for authentication

2. **Create Application/Stack**
   - Use `docker-compose.dokploy.yml`
   - Or create via API

3. **Set Environment Variables**
   ```
   NEXT_PUBLIC_POCKETBASE_URL=https://your-app.dokploy.ogbinar.com:8090
   NEXT_PUBLIC_API_URL=https://your-app.dokploy.ogbinar.com:8000
   BACKEND_POCKETBASE_ADMIN_TOKEN=<generate-from-pocketbase>
   BACKEND_SECRET_KEY=<generate-random-key>
   CORS_ORIGINS=https://your-app.dokploy.ogbinar.com
   ```

4. **Configure Domain**
   - Subdomain or custom domain pointing to Dokploy instance

5. **Deploy**
   - Via Dashboard UI or API

## Repository

**Property-Pi Repo:** `/projects/property-pi`

**Docker Files:**
- `docker-compose.dokploy.yml` - Production compose file
- `Dockerfile` - Next.js frontend
- `backend/Dockerfile` - FastAPI backend

## API Endpoints (Dokploy)

Based on Dokploy documentation, common API endpoints:

```
POST /api/auth/login
POST /api/applications
POST /api/stacks
GET /api/stacks/{stackId}
POST /api/stacks/{stackId}/deploy
```

Authentication: Use API key in `Authorization: Bearer <key>` header

## Current Status

- ✅ Dokploy instance identified
- ✅ API key configured
- ✅ Docker compose files ready
- ⏳ Environment variables need configuration
- ⏳ Domain/subdomain assignment needed
- ⏳ PocketBase collections setup required

## Notes

- API key is sensitive - treat as password
- Generate unique admin token in PocketBase after setup
- Update CORS origins when domain changes
