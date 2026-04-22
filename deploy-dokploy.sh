#!/bin/bash
# Dokploy Deployment Script for Property-Pi
# This script prepares your deployment configuration

set -e

echo "=============================================="
echo "  Property-Pi Dokploy Deployment Script"
echo "=============================================="
echo ""

# Configuration
DOKPLOY_URL="https://dokploy.ogbinar.com"
COMPOSE_FILE="docker-compose.dokploy.yml"
ENV_FILE=".env.dokploy"

echo "Dokploy Instance: $DOKPLOY_URL"
echo ""

# Step 1: Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: $COMPOSE_FILE not found!"
    exit 1
fi
echo "✅ Docker compose file found: $COMPOSE_FILE"

# Step 2: Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Environment file not found: $ENV_FILE"
    echo ""
    echo "   Creating from template..."
    cp .env.dokploy.example "$ENV_FILE"
    echo "   Please edit $ENV_FILE with your values:"
    echo "   - NEXT_PUBLIC_POCKETBASE_URL"
    echo "   - NEXT_PUBLIC_API_URL"
    echo "   - BACKEND_POCKETBASE_ADMIN_TOKEN"
    echo "   - BACKEND_SECRET_KEY"
    echo "   - CORS_ORIGINS"
    echo ""
    read -p "Press Enter when you've configured $ENV_FILE..."
fi

# Step 3: Validate environment variables
echo "Validating environment variables..."
if ! grep -q "your-domain" "$ENV_FILE"; then
    echo "✅ Environment variables appear configured"
else
    echo "⚠️  Warning: Environment variables still have placeholder values"
    echo "   Please update $ENV_FILE before deploying"
fi

echo ""
echo "=============================================="
echo "  Next Steps"
echo "=============================================="
echo ""
echo "1. Access Dokploy Dashboard:"
echo "   $DOKPLOY_URL"
echo ""
echo "2. Login with your credentials/API key"
echo ""
echo "3. Create a new Stack/Application:"
echo "   - Name: property-pi"
echo "   - Type: Docker Compose"
echo "   - Upload: $COMPOSE_FILE"
echo ""
echo "4. Add Environment Variables from $ENV_FILE:"
echo ""
grep -v "^#" "$ENV_FILE" | grep -v "^$" | while read -r line; do
    echo "   $line"
done
echo ""
echo "5. Deploy the stack"
echo ""
echo "6. After deployment:"
echo "   - Configure PocketBase collections"
echo "   - Generate admin token"
echo "   - Update BACKEND_POCKETBASE_ADMIN_TOKEN"
echo ""
echo "=============================================="
echo "  Dashboard URL"
echo "=============================================="
echo ""
echo "   $DOKPLOY_URL"
echo ""
echo "=============================================="
