# Incident Response

## Severity Levels

| Level | Description | Response |
|-------|-------------|----------|
| P0 | Complete outage | Immediate |
| P1 | Major feature broken | < 1 hour |
| P2 | Minor feature broken | < 4 hours |
| P3 | Cosmetic/minor | Next business day |

## Common Incidents

### Tavily API Rate Limited (429)

**Symptoms**: Users see "Rate limit exceeded" error on search/extract/crawl/map

**Resolution**:
1. Check Tavily dashboard for current usage
2. Verify API key credit balance
3. If legitimate traffic spike, consider Tavily plan upgrade
4. If abuse, identify and block offending user

### Database Connection Refused

**Symptoms**: 500 errors on all authenticated endpoints

**Resolution**:
1. Check PostgreSQL container status: `docker compose ps db`
2. View logs: `docker compose logs db`
3. Restart if needed: `docker compose restart db`
4. Verify connection string in `.env`

### Frontend Build Failure

**Symptoms**: Blank page or old version showing

**Resolution**:
1. Clear browser cache
2. Check frontend container: `docker compose logs frontend`
3. Verify OpenAPI client is in sync: `./scripts/generate-client.sh`
4. Rebuild: `docker compose up -d --build frontend`

### JWT Authentication Failures

**Symptoms**: Users cannot log in, 401 errors

**Resolution**:
1. Verify SECRET_KEY is set in environment
2. Check token expiration settings
3. Clear user's local storage and retry
4. Check backend logs for specific error

### Alembic Migration Failed

**Symptoms**: Backend won't start, database schema errors

**Resolution**:
1. Check migration status: `docker compose exec backend alembic current`
2. View history: `docker compose exec backend alembic history`
3. If stuck, downgrade: `docker compose exec backend alembic downgrade -1`
4. Fix migration file and retry: `docker compose exec backend alembic upgrade head`

## Rollback Procedures

### Backend Rollback

```bash
# Stop current deployment
docker compose stop backend

# Pull previous image tag
docker compose pull backend:previous-tag

# Restart
docker compose up -d backend
```

### Database Rollback

```bash
# Downgrade one migration
docker compose exec backend alembic downgrade -1

# Or downgrade to specific revision
docker compose exec backend alembic downgrade <revision_id>
```

## Monitoring Checklist

- [ ] Backend responding: `curl http://localhost:8000/api/v1/health`
- [ ] Frontend loading: `curl http://localhost:5179`
- [ ] Database connected: Check backend logs for connection success
- [ ] Tavily API accessible: Test search endpoint with valid query
