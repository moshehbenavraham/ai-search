# Deployment

See [deployment.md](../deployment.md) in the project root for the complete deployment guide.

## Quick Reference

### Production Deployment

1. Configure Traefik proxy on your server
2. Set environment variables
3. Deploy with Docker Compose:

```bash
docker compose -f docker-compose.yml up -d
```

### GitHub Actions CD

- **Staging**: Triggered on push to `master` branch
- **Production**: Triggered on release publish

### Required Secrets

- `DOMAIN_PRODUCTION`
- `DOMAIN_STAGING`
- `SECRET_KEY`
- `POSTGRES_PASSWORD`
- `FIRST_SUPERUSER_PASSWORD`
