# Environments

## Environment Overview

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | http://localhost:5179 | Local development |
| Staging | [configured] | Pre-production testing |
| Production | [configured] | Live system |

## Port Mappings

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5179 | http://localhost:5179 |
| Backend API | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5439 | localhost:5439 |
| Mailcatcher | 1080 | http://localhost:1080 |

## Environment Variables

### Required in All Environments

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT signing key (generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`) |
| `POSTGRES_PASSWORD` | Database password |
| `FIRST_SUPERUSER_PASSWORD` | Initial admin account password |
| `TAVILY_API_KEY` | Tavily API key from https://tavily.com |

### Configuration by Environment

| Variable | Dev | Staging | Prod |
|----------|-----|---------|------|
| `ENVIRONMENT` | local | staging | production |
| `DOMAIN` | localhost | staging.domain.com | domain.com |
| `FRONTEND_HOST` | http://localhost:5179 | https://staging.domain.com | https://domain.com |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SMTP_HOST` | (empty) | Email server hostname |
| `SMTP_USER` | (empty) | Email server username |
| `SMTP_PASSWORD` | (empty) | Email server password |
| `SENTRY_DSN` | (empty) | Sentry error tracking DSN |

## Docker Configuration

### Development (docker-compose.yml)

Uses `docker-compose.override.yml` for:
- Volume mounts for live code reloading
- Debug mode with `--reload` flag
- Exposed ports for local access
- Mailcatcher for email testing

### Production

Uses `docker-compose.traefik.yml` for:
- Traefik reverse proxy with HTTPS
- Let's Encrypt SSL certificates
- Container health checks
- No exposed ports (Traefik handles routing)

## Switching Environments

Set the `ENVIRONMENT` variable in `.env`:

```bash
# Local development
ENVIRONMENT=local

# Staging deployment
ENVIRONMENT=staging

# Production deployment
ENVIRONMENT=production
```

Backend behavior changes by environment (from `app/core/config.py`).
