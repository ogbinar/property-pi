# Production Deployment Checklist

## Pre-Deployment Verification

### Build & Type Check
- [ ] `npm run build` succeeds with zero errors
- [ ] `npx tsc --noEmit` passes
- [ ] `.next/standalone/server.js` exists

### Docker Verification
- [ ] `docker compose config` validates successfully
- [ ] `docker compose up --build` starts all 3 services
- [ ] `curl http://localhost:8000/health` returns `{"status": "ok"}`
- [ ] Frontend accessible at `http://localhost:3000`

### Security Verification
- [ ] Security headers present (`curl -I http://localhost:3000`)
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] X-XSS-Protection: 0
  - [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Rate limiting configured on FastAPI
- [ ] CORS configured with explicit production origins
- [ ] No hardcoded secrets in codebase
- [ ] `.env` files excluded from git

### Environment Configuration
- [ ] `.env.local` created from `.env.local.example`
- [ ] `.env.production` created from `.env.production.example`
- [ ] All required environment variables set
- [ ] `BACKEND_SECRET_KEY` is a secure random value
- [ ] `BACKEND_POCKETBASE_ADMIN_TOKEN` is set in production

## Deployment Steps

### 1. Deploy PocketBase (fly.io or Railway)
- [ ] Create PocketBase instance
- [ ] Set up persistent volume for `pb_data`
- [ ] Configure admin user
- [ ] Generate admin token
- [ ] Verify admin UI accessible
- [ ] Create all collections (users, units, tenants, leases, payments, expenses, maintenance_requests)

### 2. Deploy FastAPI (fly.io or Railway)
- [ ] Build and deploy Docker image
- [ ] Set `BACKEND_POCKETBASE_URL` to PocketBase URL
- [ ] Set `BACKEND_POCKETBASE_ADMIN_TOKEN` to admin token
- [ ] Set `BACKEND_SECRET_KEY` to secure value
- [ ] Verify `/health` endpoint responds
- [ ] Test dashboard aggregation endpoint

### 3. Deploy Frontend (Vercel)
- [ ] Connect GitHub repository to Vercel
- [ ] Set `NEXT_PUBLIC_POCKETBASE_URL` to production PocketBase URL
- [ ] Deploy to production
- [ ] Verify login page loads
- [ ] Test login flow with PocketBase auth
- [ ] Verify dashboard loads
- [ ] Test CRUD operations (units, tenants, leases, etc.)

## Post-Deployment Verification

### Functional Tests
- [ ] Login with landlord credentials works
- [ ] Dashboard loads under 5 seconds
- [ ] Unit CRUD operations work
- [ ] Tenant CRUD operations work
- [ ] Lease CRUD operations work
- [ ] Rent tracking works
- [ ] Expense tracking works
- [ ] Maintenance requests work
- [ ] Tenant portal links work
- [ ] Logout works correctly

### Performance Tests
- [ ] Dashboard loads under 5 seconds (Lighthouse or similar)
- [ ] No console errors in browser
- [ ] No Network errors in DevTools
- [ ] Font loading optimized (no FOIT)

### Security Tests
- [ ] Unauthenticated requests redirect to /login
- [ ] Tenant portal links require valid token
- [ ] Rate limiting works (test with rapid requests)
- [ ] CORS blocks unauthorized origins

## Monitoring Setup

### Vercel
- [ ] Vercel Analytics enabled
- [ ] Deployment logs accessible
- [ ] Error tracking configured (optional: Sentry)

### PocketBase/fly.io
- [ ] Logging enabled
- [ ] Resource monitoring configured
- [ ] Backup strategy in place

## Documentation

- [ ] README.md updated with deployment instructions
- [ ] DEPLOYMENT.md created with full guide
- [ ] Environment variables documented
- [ ] Troubleshooting guide included

## Sign-off

- [ ] All checklist items complete
- [ ] Stakeholder approval obtained
- [ ] Production URL shared with team
- [ ] Monitoring alerts configured

---

*Deployment checklist created: 2026-04-21*
