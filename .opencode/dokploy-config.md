# Dokploy Config Notes

## Current Application Model

Property-Pi should be configured in Dokploy as a single production service.

- Repository root is the build context.
- Use the root `Dockerfile`.
- If using compose, use `docker-compose.yml`.

## Required Variables

- `SECRET_KEY`
- `DATABASE_URL`
- `ALLOWED_ORIGINS`
- `ENVIRONMENT`

## Security

- No API keys or tokens should be stored in this repository.
- Keep Dokploy credentials only in Dokploy or a secure secret manager.

## Historical Note

Earlier versions of this file contained environment examples for PocketBase-era and split-runtime deployments. Those are obsolete.
