# Property-Pi Deployment Notes

## Status

This file now reflects the current deployment target instead of the older split-service stack.

## Current Target

- single FastAPI production service
- root `Dockerfile`
- `docker-compose.yml`
- SPA and API served together

## Canonical Verification Paths

- `/`
- `/api/health`
- `/auth/login`

## Archived Context

Older notes for PocketBase, separate frontend/backend ports, and multi-service Dokploy routing are historical only.
