# Property-Pi Specification

## Product

Property-Pi is a lightweight property management application for small landlords. It covers units, tenants, leases, rent payments, expenses, maintenance, notices, uploads, and a shared-link tenant portal.

## Current Technical Baseline

- Frontend source: React + Vite SPA
- Backend: FastAPI
- Database: SQLite
- ORM: SQLAlchemy
- Auth: JWT bearer token
- Production runtime: single FastAPI service serving the SPA and API together

## Runtime Contract

### Canonical Routes

- SPA shell and client routes: `/`
- Auth: `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`
- Health: `/api/health`
- Uploads: `/uploads/{filename}`

### Development

- Vite runs separately for frontend development
- FastAPI runs separately for backend development

### Production

- Root `Dockerfile` builds the deployable image
- `docker-compose.yml` describes the production service
- Built SPA assets are served by FastAPI

## Core Functional Areas

- Unit management
- Tenant management
- Lease management
- Payment tracking
- Expense tracking
- Maintenance tracking
- Notices
- Tenant portal by shared link
- File uploads

## Auth and API Notes

- New code should use `/auth/*` for authentication flows.
- Health checks should target `/api/health`.
- Older aliases may still exist in code during transition cleanup, but they are not the active interface described by this spec.

## Persistence

- SQLite database on persistent storage
- Uploads on persistent storage

## Non-Goals For This Spec

This document does not preserve older split-runtime, PocketBase, Next.js SSR, or Nginx proxy designs as current requirements. Those belong to archived notes only.
