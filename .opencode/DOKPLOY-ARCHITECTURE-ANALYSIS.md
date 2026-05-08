# Dokploy Architecture Analysis

## Status

Archived review notes.

This analysis targeted an earlier deployment shape and contains assumptions that no longer describe the active runtime. Property-Pi currently deploys as a single FastAPI production service serving both the SPA and API.

## Current Reality

- One production service from the root `Dockerfile`
- SPA served by FastAPI
- Auth routes under `/auth/*`
- Health under `/api/health`

## Why This File Remains

Historical review context only. Do not use it as the current deployment guide.
