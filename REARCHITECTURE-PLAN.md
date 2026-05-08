# Property-Pi Rearchitecture Plan

## Status

Archived. The single-service runtime described by the refactor has already been implemented.

## Achieved End State

- One production container built from the repo root
- FastAPI serving both SPA and API
- Canonical auth routes under `/auth/*`
- Canonical health endpoint at `/api/health`
- `docker-compose.yml` representing the production runtime

## Why This File Still Exists

This file is retained as a short historical marker for the completed refactor. It is not an active implementation plan and should not be used as operational guidance.

For current behavior, use:

- `README.md`
- `ARCHITECTURE.md`
- `SPEC.md`
