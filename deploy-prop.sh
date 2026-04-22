#!/bin/bash
# Quick Deploy to Dokploy - prop.apps.ogbinar.com

set -e

echo "=============================================="
echo "  Property-Pi → prop.apps.ogbinar.com"
echo "=============================================="
echo ""

DOKPLOY_URL="https://dokploy.ogbinar.com"
REPO="https://github.com/ogbinar/property-pi"
DOMAIN="prop.apps.ogbinar.com"

echo "Target:"
echo "  Dokploy: $DOKPLOY_URL"
echo "  Domain:  $DOMAIN"
echo "  Repo:    $REPO"
echo ""

echo "=============================================="
echo "  Step 1: Generate Required Secrets"
echo "=============================================="
echo ""

# Generate secret key
BACKEND_SECRET=$(openssl rand -base64 32 | tr -d '\n')
echo "Generated BACKEND_SECRET_KEY:"
echo "  $BACKEND_SECRET"
echo ""

echo "Copy these environment variables for Dokploy:"
echo ""
cat << EOF
NEXT_PUBLIC_POCKETBASE_URL=https://$DOMAIN:8090
NEXT_PUBLIC_API_URL=https://$DOMAIN:8000
BACKEND_POCKETBASE_URL=http://pocketbase:8090
BACKEND_POCKETBASE_ADMIN_TOKEN=<will-generate-after-setup>
BACKEND_SECRET_KEY=$BACKEND_SECRET
CORS_ORIGINS=https://$DOMAIN
NODE_ENV=production
EOF

echo ""
echo "=============================================="
echo "  Step 2: Deploy to Dokploy"
echo "=============================================="
echo ""
echo "1. Open Dokploy Dashboard:"
echo "   $DOKPLOY_URL"
echo ""
echo "2. Create New Stack/Application:"
echo "   - Name: prop"
echo "   - Source: GitHub"
echo "   - Repository: ogbinar/property-pi"
echo "   - Branch: master"
echo "   - Compose File: docker-compose.dokploy.yml"
echo ""
echo "3. Add Environment Variables (from above)"
echo ""
echo "4. Configure Domain:"
echo "   - Primary: $DOMAIN"
echo "   - Enable HTTPS"
echo ""
echo "5. Click Deploy"
echo ""

echo "=============================================="
echo "  Step 3: Post-Deployment Setup"
echo "=============================================="
echo ""
echo "After deployment completes:"
echo ""
echo "1. Access PocketBase Admin:"
echo "   https://$DOMAIN:8090/_/"
echo ""
echo "2. Create admin account"
echo ""
echo "3. Create collections:"
echo "   - users"
echo "   - units"
echo "   - tenants"
echo "   - leases"
echo "   - payments"
echo "   - expenses"
echo "   - maintenance_requests"
echo ""
echo "4. Generate admin token:"
echo "   Settings → API → Generate Token"
echo ""
echo "5. Update BACKEND_POCKETBASE_ADMIN_TOKEN in Dokploy"
echo "   and redeploy"
echo ""

echo "=============================================="
echo "  Step 4: Verify Deployment"
echo "=============================================="
echo ""
echo "Run these checks after setup:"
echo ""
echo "  curl https://$DOMAIN"
echo "  curl https://$DOMAIN:8000/api/health"
echo "  curl https://$DOMAIN:8090/api/health"
echo ""
echo "Or visit: https://$DOMAIN"
echo ""
echo "=============================================="
