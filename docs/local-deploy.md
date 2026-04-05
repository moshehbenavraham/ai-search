# AI Search Local Deployment Guide

Complete guide for taking down, cleaning, rebuilding, and restarting the AI Search app locally.

---

## TL;DR - Use the Script

```bash
# Safe rebuild (preserves your database)
./scripts/deploy-local-clean.sh

# Quick rebuild (skip cache cleaning)
./scripts/deploy-local-clean.sh --skip-cache

# Nuclear rebuild (DESTROYS ALL DATA - use with caution!)
./scripts/deploy-local-clean.sh --nuclear
```

---

## CRITICAL: Data Preservation Warning

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   STOP! READ THIS BEFORE RUNNING ANY COMMANDS                                ║
║                                                                              ║
║   The "-v" flag DESTROYS ALL DATABASE DATA permanently.                      ║
║                                                                              ║
║   docker compose down -v    <-- DESTROYS all users, records, everything      ║
║   docker compose down       <-- SAFE: preserves your database                ║
║                                                                              ║
║   There is NO UNDO. There is NO BACKUP created automatically.                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Choose Your Rebuild Type

Before proceeding, decide which type of rebuild you need:

| Scenario | Rebuild Type | Data Preserved? | Use When |
|----------|--------------|-----------------|----------|
| Code changes not working | **Safe Rebuild** | YES | Most common - fixes code/image issues |
| Weird state, want fresh start | **Safe Rebuild** | YES | Clears containers but keeps DB |
| Database schema corrupted | **Nuclear Rebuild** | NO | Last resort - destroys everything |
| Starting completely fresh | **Nuclear Rebuild** | NO | New project setup or total reset |
| Disk space issues | **Nuclear Rebuild** | NO | Reclaims maximum space |

**Rule of thumb:** If you're not sure, use **Safe Rebuild**. You can always go nuclear later.

---

## Quick Reference: Safe Rebuild (PRESERVES DATA)

Use this 99% of the time. Rebuilds all code/images but keeps your database intact.

```bash
# Stop everything (keeps volumes/data)
docker compose down --remove-orphans

# Remove old images to force fresh build
docker rmi ai-search-backend:latest ai-search-frontend:latest ai-search-playwright:latest 2>/dev/null || true

# Clean build cache (optional, for thorough rebuild)
docker builder prune -af
docker image prune -f

# Rebuild from scratch
docker compose build --no-cache --pull

# Start fresh
docker compose up -d
```

**What this preserves:**
- All database tables and data
- All user accounts
- All application records
- Volume: `ai-search_app-db-data`

**What this rebuilds:**
- All Docker images (backend, frontend, playwright)
- All containers
- Networks

---

## Quick Reference: Nuclear Rebuild (DESTROYS ALL DATA)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WARNING: This permanently deletes ALL database data!                       │
│                                                                             │
│  - All user accounts will be deleted                                        │
│  - All application data will be deleted                                     │
│  - All search history, crawl results, extractions will be deleted           │
│  - The database will be completely empty after this                         │
│                                                                             │
│  Consider backing up first:                                                 │
│  docker compose exec db pg_dump -U postgres app > backup.sql                │
└─────────────────────────────────────────────────────────────────────────────┘
```

Only use when you truly need a completely fresh start:

```bash
# DANGER: The -v flag destroys all database data!
docker compose down --remove-orphans -v

# Remove all images
docker rmi ai-search-backend:latest ai-search-frontend:latest ai-search-playwright:latest 2>/dev/null || true

# Clean everything
docker builder prune -af
docker image prune -f

# Rebuild from scratch
docker compose build --no-cache --pull

# Start fresh (database will be empty, migrations will create fresh tables)
docker compose up -d
```

---

## Command Reference: What Destroys Data vs What's Safe

### SAFE Commands (preserve data)

```bash
docker compose down                    # Stop containers, keep volumes
docker compose down --remove-orphans   # Stop + remove orphan containers
docker compose stop                    # Stop without removing
docker compose restart                 # Restart services
docker compose build                   # Rebuild images
docker compose build --no-cache        # Rebuild without cache
docker rmi <image>                     # Remove images (not volumes)
docker builder prune                   # Clean build cache
docker image prune                     # Remove dangling images
```

### DANGEROUS Commands (destroy data)

```bash
docker compose down -v                 # DESTROYS database volume
docker compose down --volumes          # DESTROYS database volume (same as -v)
docker volume rm ai-search_app-db-data  # DESTROYS database volume directly
docker system prune --volumes          # DESTROYS ALL unused volumes system-wide
docker volume prune                    # DESTROYS ALL unused volumes
```

---

## Architecture Overview

The AI Search app consists of the following services:

| Service      | Image                    | Port(s)              | Purpose                    |
|--------------|--------------------------|----------------------|----------------------------|
| db           | postgres:17              | 5439:5432            | PostgreSQL database        |
| backend      | ai-search-backend:latest    | 8009:8000            | FastAPI backend            |
| frontend     | ai-search-frontend:latest   | 5179:80              | Nginx serving React app    |
| proxy        | traefik:3.3              | 80, 8090:8080        | Reverse proxy (disabled)   |
| adminer      | adminer                  | 8088:8080            | Database admin UI          |
| mailcatcher  | schickling/mailcatcher   | 1080, 1025           | Email testing              |
| playwright   | ai-search-playwright    | 9323                 | E2E testing (runs once)    |
| prestart     | ai-search-backend:latest    | -                    | DB migrations (runs once)  |

**Data Storage:**
- Database data lives in Docker volume: `ai-search_app-db-data`
- This volume persists across container restarts
- This volume is ONLY deleted when using `-v` flag

## Docker Compose Files

- `docker-compose.yml` - Base production configuration
- `docker-compose.override.yml` - Local development overrides (auto-loaded)
- `docker-compose.traefik.yml` - Traefik-specific configuration

---

## Detailed Process: Safe Rebuild (Preserves Data)

### Step 1: Survey Current State

```bash
# Check running containers
docker compose ps -a

# Check volumes (this is where your data lives!)
docker volume ls --filter "name=ai-search"
# Expected: ai-search_app-db-data

# Check images
docker images --filter "reference=ai-search*"
```

### Step 2: Stop All Services (Data Safe)

```bash
docker compose down --remove-orphans
```

**This removes:**
- All containers
- Networks

**This KEEPS:**
- Volume `ai-search_app-db-data` (your database!)

### Step 3: Remove Old Images

```bash
docker rmi ai-search-backend:latest ai-search-frontend:latest ai-search-playwright:latest 2>/dev/null || true
```

### Step 4: Clean Build Cache (Optional)

```bash
docker builder prune -af
docker image prune -f
```

### Step 5: Verify Volume Still Exists

```bash
docker volume ls --filter "name=ai-search"
# Should show: ai-search_app-db-data
```

If you see the volume, your data is safe!

### Step 6: Rebuild All Images

```bash
docker compose build --no-cache --pull
```

### Step 7: Start Services

```bash
docker compose up -d
```

### Step 8: Verify Data Preserved

```bash
# Check services are up
docker compose ps -a

# Your existing data should still be there
# Log in with your existing user accounts
```

---

## Detailed Process: Nuclear Rebuild (Destroys Data)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  FINAL WARNING: Everything below this line DESTROYS ALL DATA                 ║
║  Make sure you actually need this. Consider Safe Rebuild first.              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Step 0: Backup (If You Have Data Worth Saving)

```bash
# Create SQL backup before destroying
docker compose exec db pg_dump -U postgres app > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup was created
ls -la backup_*.sql
```

### Step 1: Survey Current State

```bash
docker compose ps -a
docker volume ls --filter "name=ai-search"
docker images --filter "reference=ai-search*"
```

**Expected resources:**
- Containers: 8
- Networks: 2 (ai-search_default, ai-search_traefik-public)
- Volumes: 1 (ai-search_app-db-data) - **WILL BE DESTROYED**
- Images: 3 (ai-search-backend, ai-search-frontend, ai-search-playwright)

### Step 2: Take Down Everything Including Volumes

```bash
# THE -v FLAG DESTROYS YOUR DATABASE
docker compose down --remove-orphans -v
```

**This removes:**
- All 8 containers
- Networks
- **Volume ai-search_app-db-data (ALL YOUR DATA)**

### Step 3: Remove Docker Images

```bash
docker rmi ai-search-backend:latest ai-search-frontend:latest ai-search-playwright:latest
```

### Step 4: Clean Build Cache

```bash
docker builder prune -af
docker image prune -f
```

### Step 5: Verify Complete Cleanup

```bash
# All should return empty
docker ps -a --filter "name=ai-search"
docker network ls --filter "name=ai-search"
docker volume ls --filter "name=ai-search"    # <-- Should be EMPTY now
docker images --filter "reference=ai-search*"

# Verify ports are free
lsof -i :5179 -i :8009 -i :8088 -i :5439 -i :1080 -i :1025 -i :8090
```

### Step 6: Force Rebuild All Images

```bash
docker compose build --no-cache --pull
```

**Flags:**
- `--no-cache`: Don't use any cached layers
- `--pull`: Pull latest base images

Build time: ~4-5 minutes

### Step 7: Start All Services

```bash
docker compose up -d
```

**Startup order (automatic):**
1. `db` - PostgreSQL starts fresh, empty database
2. `prestart` - Runs migrations, creates empty tables
3. `backend` - Starts after migrations complete
4. Other services start independently

### Step 8: Verify Services

```bash
docker compose ps -a

# Expected:
# - db: Up (healthy)
# - backend: Up (healthy)
# - frontend: Up
# - prestart: Exited (0) - normal
# - playwright: Exited (0) - normal
```

**Test endpoints:**

```bash
curl http://localhost:8009/api/v1/utils/health-check/   # Should return: true
curl -I http://localhost:5179                            # Should return: 200 OK
curl -I http://localhost:8088                            # Should return: 200 OK
```

### Step 9: Restore Backup (If Applicable)

```bash
# If you made a backup earlier
cat backup_YYYYMMDD_HHMMSS.sql | docker compose exec -T db psql -U postgres app
```

---

## Standard Operations

```bash
# Start services
docker compose up -d

# Stop services (SAFE - preserves data)
docker compose down

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Specific service

# Rebuild single service (SAFE)
docker compose build --no-cache backend
docker compose up -d backend

# Check service status
docker compose ps -a

# Access database directly
docker compose exec db psql -U postgres -d app
```

---

## Troubleshooting

### Backend won't start

```bash
docker compose logs backend
docker compose logs prestart
```

### Database connection issues

```bash
docker compose ps db
docker compose exec db psql -U postgres -d app
docker compose logs db
```

### Port already in use

```bash
lsof -i :8009
docker rm -f ai-search-backend-1
```

### Image build fails

```bash
df -h  # Check disk space
docker system prune -af  # Clean up (careful: --volumes would destroy data!)
```

### CI Variable Warning

The warning `The "CI" variable is not set` is normal for local development.

---

## Service Access URLs

| Service          | URL                           | Credentials              |
|------------------|-------------------------------|--------------------------|
| Frontend         | http://localhost:5179         | Login with app users     |
| Backend API      | http://localhost:8009/docs    | Swagger UI               |
| Adminer          | http://localhost:8088         | Use .env DB credentials  |
| Mailcatcher      | http://localhost:1080         | No auth required         |
| Traefik Dashboard| http://localhost:8090         | No auth required         |
| PostgreSQL       | localhost:5439                | Check .env file          |

---

## Notes

### Volume Persistence (Important!)

```
Database data location: Docker volume "ai-search_app-db-data"

This volume:
- Persists across: docker compose down, docker compose restart, container rebuilds
- Is DESTROYED by: docker compose down -v, docker volume rm, docker volume prune

To check if your data is safe:
docker volume ls --filter "name=ai-search"

If you see "ai-search_app-db-data" listed, your data exists.
```

### Prestart Service
Runs database migrations via `scripts/prestart.sh`. Expected to exit with code 0.

### Playwright Service
For E2E tests. Run manually:
```bash
docker compose run --rm playwright npx playwright test
```

### Traefik Proxy
Docker provider disabled for local dev. Access services directly via exposed ports.

---

## Process Log: 2025-12-22

**Type:** Nuclear Rebuild (destroyed all data)

**Duration:** ~5 minutes

**What was destroyed:**
- Volume: ai-search_app-db-data (all database data)
- All user accounts
- All application data

**What was rebuilt:**
- All 3 Docker images from scratch
- Fresh empty database with schema from migrations
- All containers and networks

**Space reclaimed:**
- Images: ~4.5GB
- Build cache: ~1.7GB
- Dangling images: ~8.7GB
- **Total: ~15GB**

**Final state:**
- All services running and healthy
- Fresh empty database
- Ready for new data
