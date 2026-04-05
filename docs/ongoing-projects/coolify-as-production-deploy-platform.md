# Coolify as a Production Deployment Platform

A comprehensive guide to using Coolify for self-hosted production deployments, based on real-world implementation experience.

---

# .env file has Coolify API Key and Related Details

---

## Table of Contents

1. [What is Coolify?](#1-what-is-coolify)
2. [Why Choose Coolify?](#2-why-choose-coolify)
3. [Architecture Overview](#3-architecture-overview)
4. [Core Concepts](#4-core-concepts)
5. [Deployment Workflow](#5-deployment-workflow)
6. [API-Driven Deployments](#6-api-driven-deployments)
7. [Environment Configuration](#7-environment-configuration)
8. [Health Monitoring](#8-health-monitoring)
9. [Security Best Practices](#9-security-best-practices)
10. [Resource Management](#10-resource-management)
11. [Maintenance and Operations](#11-maintenance-and-operations)
12. [Cost Considerations](#12-cost-considerations)
13. [When to Use Coolify](#13-when-to-use-coolify)
14. [Comparison with Alternatives](#14-comparison-with-alternatives)

---

## 1. What is Coolify?

Coolify is an open-source, self-hostable Platform-as-a-Service (PaaS) that provides an alternative to cloud platforms like Heroku, Netlify, Vercel, and Railway.

**Official Site**: https://coolify.io

### Key Capabilities

| Feature | Description |
|---------|-------------|
| **Self-hosted PaaS** | Deploy applications on your own servers with full control |
| **Docker-native** | Build and run containers automatically from source |
| **Git Integration** | Auto-deploy from GitHub/GitLab on push events |
| **SSL/HTTPS** | Automatic Let's Encrypt certificate provisioning |
| **Zero-downtime** | Health check-based rollouts with automatic rollback |
| **API Access** | Full programmatic control via REST API |
| **Multi-server** | Manage multiple servers from a single dashboard |
| **Team Support** | Collaborate with role-based access control |

### Deployment Types Supported

- **Dockerfiles**: Custom multi-stage builds
- **Docker Compose**: Multi-container applications
- **Git Repositories**: Public and private (via GitHub Apps)
- **Container Images**: Pull from registries
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis, etc.
- **Static Sites**: HTML, JavaScript frameworks

---

## 2. Why Choose Coolify?

### Advantages Over Traditional Cloud Platforms

| Aspect | Cloud PaaS (Heroku, Vercel) | Coolify (Self-hosted) |
|--------|---------------------------|---------------------|
| **Cost** | Pay per dyno/function | Fixed server cost |
| **Data Control** | Provider's infrastructure | Your servers, your data |
| **Customization** | Limited to provider options | Full Docker flexibility |
| **Scaling** | Auto-scale (costly) | Manual or scripted |
| **Cold Starts** | Common on free tiers | None (always running) |
| **Egress Costs** | Can be expensive | Your bandwidth |
| **Compliance** | Depends on provider | Full control |

### Ideal Use Cases

1. **Privacy-sensitive applications**: Keep data on your own infrastructure
2. **Cost-conscious deployments**: Fixed monthly server costs vs. variable usage fees
3. **Custom Docker configurations**: Complex multi-stage builds, specific base images
4. **Long-running processes**: Applications that need persistent connections
5. **Development/Staging environments**: Quick iteration without cloud vendor lock-in
6. **AI/ML applications**: GPU access, large memory requirements
7. **Hybrid architectures**: Mix self-hosted apps with external managed services

### When Coolify May Not Be Ideal

- Need global edge deployment (use Vercel/Cloudflare)
- Zero infrastructure management desired
- Serverless-first architecture
- Extremely variable traffic patterns requiring auto-scaling

---

## 3. Architecture Overview

### Typical Coolify Deployment Architecture

```
                    +-------------------+
                    |   Coolify Server  |
                    |   (Self-hosted)   |
                    +--------+----------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+         +---------v---------+
    |  GitHub/GitLab    |         |   Coolify API     |
    |   Repository      |         |   (REST/JSON)     |
    +-------------------+         +-------------------+
              |                             |
              |    Automated Deployment     |
              +-----------------------------+
                             |
              +--------------v--------------+
              |     Docker Build Stage      |
              |  - Multi-stage builds       |
              |  - Caching layers           |
              |  - Security scanning        |
              +--------------+--------------+
                             |
              +--------------v--------------+
              |    Running Container(s)     |
              |  - Health checked           |
              |  - Resource limited         |
              |  - Persistent volumes       |
              +--------------+--------------+
                             |
         +-------------------+-------------------+
         |                   |                   |
+--------v--------+ +--------v--------+ +-------v--------+
|  Managed DBs    | |  External APIs  | |  Other Services|
| (Supabase,      | | (LLM providers, | | (Redis, etc.)  |
|  Neo4j Aura)    | |  Analytics)     | |                |
+-----------------+ +-----------------+ +----------------+
```

### Component Responsibilities

| Component | Role |
|-----------|------|
| **Coolify Server** | Orchestration, API, dashboard, certificate management |
| **Docker Engine** | Container runtime, image building |
| **Traefik/Caddy** | Reverse proxy, SSL termination, load balancing |
| **Git Provider** | Source code, webhooks for auto-deploy |
| **External Services** | Databases, APIs (recommended for stateful services) |

### Recommended Architecture Pattern

**Stateless containers + Managed stateful services**:
- Deploy application code in Coolify containers
- Use external managed databases (Supabase, Neo4j Aura, PlanetScale)
- Benefits: Simplified backups, professional database management, easier scaling

---

## 4. Core Concepts

### Projects and Resources

```
Coolify Instance
  Teams (organizations)
    Projects (logical groupings)
      Environments (production, staging)
        Resources (applications, databases, services)
```

### Resource Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Application** | Your deployed code | Web apps, APIs, workers |
| **Database** | PostgreSQL, MySQL, etc. | Local database (if not using managed) |
| **Service** | Pre-configured services | Redis, MinIO, Plausible |
| **Docker Compose** | Multi-container apps | Complex stacks |

### Build Packs

1. **Dockerfile**: Custom Dockerfile in your repository
2. **Nixpacks**: Auto-detect and build (like Heroku buildpacks)
3. **Static**: HTML/CSS/JS static sites
4. **Docker Compose**: Multi-service definitions
5. **Docker Image**: Pull from registry

### Networking

- **Domains**: Custom domains with automatic DNS verification
- **SSL**: Let's Encrypt automatic provisioning and renewal
- **Ports**: Expose multiple ports per application
- **Internal networking**: Container-to-container communication
- **Proxy**: Traefik or Caddy for routing

---

## 5. Deployment Workflow

### Manual Deployment (Dashboard)

1. **Create Resource**
   - Dashboard -> New -> Resource -> Select type
   - Choose server and destination

2. **Configure Build**
   - Repository URL (or Docker image)
   - Branch to deploy
   - Dockerfile location
   - Build target (for multi-stage)
   - Build context path

3. **Set Environment Variables**
   - Bulk paste from .env file
   - Mark secrets with lock icon
   - Reference other variables with `${VAR_NAME}`

4. **Configure Resources**
   - Memory limit (MB)
   - CPU limit (cores)
   - Health check endpoint
   - Persistent volumes

5. **Deploy**
   - Click Deploy
   - Monitor build logs
   - Health check validation
   - Automatic SSL provisioning

### Automated Deployment (Git Push)

```yaml
# Workflow triggered by git push
1. Push to repository (main branch)
2. GitHub webhook notifies Coolify
3. Coolify pulls latest code
4. Docker build initiated
5. Health check validation
6. Zero-downtime deployment
7. Old container removed
```

**Configure webhook**:
- Repository Settings -> Webhooks
- Payload URL: `https://your-coolify.com/webhooks/source`
- Content type: `application/json`
- Events: Push events

---

## 6. API-Driven Deployments

Coolify provides a comprehensive REST API for programmatic control.

### Authentication

```bash
# API Token: Coolify Dashboard -> Profile -> API Tokens
export COOLIFY_API_TOKEN="your-api-token"
export COOLIFY_API_URL="https://coolify.yourdomain.com/api/v1"

# Test authentication
curl -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
     "$COOLIFY_API_URL/teams"
```

### Key API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/teams` | List available teams |
| GET | `/servers` | List servers |
| GET | `/projects` | List projects |
| GET | `/github-apps` | List GitHub App integrations |
| POST | `/applications/public` | Create app from public repo |
| POST | `/applications/private-github-app` | Create app from private repo |
| PATCH | `/applications/{uuid}` | Update application settings |
| POST | `/applications/{uuid}/envs/bulk` | Bulk set environment variables |
| GET | `/applications/{uuid}/start` | Trigger deployment |
| GET | `/applications/{uuid}` | Get application status |

### Example: API Deployment Script

```bash
#!/bin/bash
# Automated deployment via Coolify API

set -e

# Configuration
API_URL="${COOLIFY_API_URL}"
API_TOKEN="${COOLIFY_API_TOKEN}"
APP_NAME="my-application"

# Helper function
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3

    curl -s -X "$method" \
         -H "Authorization: Bearer $API_TOKEN" \
         -H "Content-Type: application/json" \
         ${data:+-d "$data"} \
         "$API_URL$endpoint"
}

# Step 1: Get server and project IDs
echo "Discovering Coolify resources..."
SERVERS=$(api_call GET "/servers")
SERVER_UUID=$(echo "$SERVERS" | jq -r '.[0].uuid')

PROJECTS=$(api_call GET "/projects")
PROJECT_UUID=$(echo "$PROJECTS" | jq -r '.[0].uuid')

# Step 2: Create application
echo "Creating application..."
APP_DATA=$(cat <<EOF
{
    "project_uuid": "$PROJECT_UUID",
    "server_uuid": "$SERVER_UUID",
    "type": "dockerfile",
    "name": "$APP_NAME",
    "git_repository": "https://github.com/org/repo",
    "git_branch": "main",
    "ports_exposes": "8080",
    "dockerfile": "Dockerfile"
}
EOF
)

RESPONSE=$(api_call POST "/applications/public" "$APP_DATA")
APP_UUID=$(echo "$RESPONSE" | jq -r '.uuid')

# Step 3: Configure settings
echo "Configuring application..."
CONFIG_DATA=$(cat <<EOF
{
    "domains": "app.yourdomain.com",
    "dockerfile_location": "/docker/Dockerfile",
    "dockerfile_target_build": "production",
    "health_check_path": "/health",
    "health_check_port": "8080",
    "limits_memory": "4096",
    "limits_cpus": "2"
}
EOF
)

api_call PATCH "/applications/$APP_UUID" "$CONFIG_DATA"

# Step 4: Set environment variables
echo "Setting environment variables..."
ENV_DATA='{"data": [
    {"key": "NODE_ENV", "value": "production"},
    {"key": "DATABASE_URL", "value": "'$DATABASE_URL'", "is_secret": true}
]}'

api_call POST "/applications/$APP_UUID/envs/bulk" "$ENV_DATA"

# Step 5: Deploy
echo "Triggering deployment..."
api_call GET "/applications/$APP_UUID/start?force=false&instant_deploy=true"

# Step 6: Monitor status
echo "Monitoring deployment..."
for i in {1..30}; do
    STATUS=$(api_call GET "/applications/$APP_UUID" | jq -r '.status')
    echo "Status: $STATUS"

    if [ "$STATUS" = "running" ]; then
        echo "Deployment successful!"
        exit 0
    fi

    sleep 10
done

echo "Deployment timeout - check Coolify dashboard"
exit 1
```

---

## 7. Environment Configuration

### Environment Variable Categories

```bash
# === APPLICATION CONFIG ===
APP_NAME=my-application
APP_ENV=production
LOG_LEVEL=INFO

# === DATABASE CONNECTIONS ===
DATABASE_URL=postgresql://user:pass@host:5441/db
REDIS_URL=redis://host:6379/0

# === API KEYS (Mark as Secret) ===
API_KEY=sk-xxxxxxxxxxxx
SECRET_KEY=your-secret-key

# === FEATURE FLAGS ===
ENABLE_FEATURE_X=true
ENABLE_FEATURE_Y=false

# === PERFORMANCE TUNING ===
POOL_SIZE=20
TIMEOUT_SECONDS=30
```

### Best Practices

1. **Use Coolify's "Secret" marking** for sensitive values
   - Prevents display in logs
   - Encrypts at rest
   - Visible only to authorized users

2. **Generate secure keys programmatically**
   ```bash
   # Cookie/session key
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"

   # Encryption key (Fernet)
   python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

3. **Environment file generator script**
   ```bash
   #!/bin/bash
   # generate-env.sh - Creates environment template with secure defaults

   cat > .env.production << EOF
   # Auto-generated $(date)

   # Security Keys (auto-generated)
   SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

   # Database (FILL IN)
   DATABASE_URL=

   # API Keys (FILL IN)
   API_KEY=
   EOF

   echo "Created .env.production - fill in blank values"
   ```

4. **Reference other variables**
   ```bash
   # Coolify supports variable interpolation
   APP_URL=https://${APP_DOMAIN}
   ```

---

## 8. Health Monitoring

### Configuring Health Checks

```yaml
# Recommended settings
Health Check Method: HTTP
Health Check Path: /health or /_health
Health Check Port: 8080
Health Check Interval: 30s
Health Check Timeout: 10s
Health Check Start Period: 60s  # Time before first check
Health Check Retries: 3
```

### Health Endpoint Implementation

```python
# FastAPI example
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health_check():
    # Basic health
    return {"status": "ok"}

@app.get("/health/detailed")
async def detailed_health():
    # Check dependencies
    checks = {
        "database": check_database(),
        "cache": check_redis(),
        "external_api": check_external_api()
    }

    status = "ok" if all(checks.values()) else "degraded"
    return {"status": status, "checks": checks}
```

```javascript
// Express.js example
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
```

### Monitoring Features in Coolify

| Feature | Description |
|---------|-------------|
| **Build Logs** | Real-time build output |
| **Container Logs** | Application stdout/stderr |
| **Health Status** | Green/Yellow/Red indicators |
| **Resource Metrics** | CPU/Memory usage |
| **Deployment History** | Rollback capability |

### External Monitoring Integration

```bash
# Prometheus metrics endpoint
METRICS_PORT=9094
METRICS_PATH=/metrics

# Add to Coolify port configuration
# Then scrape from Prometheus/Grafana
```

---

## 9. Security Best Practices

### 1. Secrets Management

| Practice | Implementation |
|----------|----------------|
| Mark secrets | Use Coolify's lock icon |
| Never commit secrets | Add `.env*` to `.gitignore` |
| Rotate regularly | Quarterly rotation recommended |
| Use strong generation | `secrets.token_urlsafe(32)` minimum |

### 2. HTTPS Configuration

```yaml
# Always enable in Coolify
- Force HTTPS: enabled
- HSTS: enabled
- Minimum TLS version: 1.2

# Application-level
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_HTTPONLY=true
```

### 3. Container Security

```dockerfile
# Dockerfile best practices

# 1. Use specific image versions
FROM python:3.11-slim

# 2. Create non-root user
RUN useradd -m -u 1001 appuser
USER appuser

# 3. Minimal base image (slim/alpine)
# 4. Multi-stage builds (separate build/runtime)
# 5. No shell access for service users
```

### 4. Network Security

- **Expose only necessary ports**
- **Use Coolify's internal networking** for service-to-service communication
- **External databases**: Use encrypted connections (`neo4j+s://`, `postgresql+ssl://`)
- **Rate limiting**: Enable in application or reverse proxy

### 5. Access Control

- **API tokens**: Create per-deployment, rotate regularly
- **Team permissions**: Least privilege principle
- **Two-factor authentication**: Enable for Coolify dashboard access

---

## 10. Resource Management

### Container Resource Limits

```yaml
# Recommended production settings
Memory Limit: 4096 MB - 8192 MB
Memory Reservation: 2048 MB - 4096 MB
CPU Limit: 2.0 - 4.0 cores
CPU Reservation: 1.0 - 2.0 cores
```

### Scaling Strategies

**Vertical Scaling** (increase resources):
```
1. Coolify Dashboard -> Application -> Settings
2. Increase Memory/CPU limits
3. Redeploy (restart required)
```

**Horizontal Scaling** (multiple instances):
```
1. Coolify Dashboard -> Application -> Advanced
2. Set replica count: 2-4
3. Note: Requires sticky sessions for stateful apps
```

### Persistent Storage

```yaml
# Volume configuration
volumes:
  - name: app-data
    mount_path: /app/data
    size: 10GB

  - name: app-logs
    mount_path: /app/logs
    size: 5GB
```

### Resource Optimization Tips

1. **Use multi-stage Docker builds** - Smaller final images
2. **Leverage build caching** - Faster deployments
3. **External managed databases** - Offload stateful workloads
4. **OpenAI embeddings over local** - Reduces memory (~4GB savings)
5. **Connection pooling** - Efficient database connections

---

## 11. Maintenance and Operations

### Updating Applications

```bash
# Method 1: Git push (webhook)
git push origin main
# Coolify auto-deploys

# Method 2: Manual redeploy
# Dashboard -> Application -> Redeploy

# Method 3: API redeploy
curl -X GET "$COOLIFY_API_URL/applications/$APP_UUID/start?force=true" \
     -H "Authorization: Bearer $COOLIFY_API_TOKEN"
```

### Database Migrations

**Recommended workflow**:
1. Apply migration to database (before deploy)
2. Ensure backwards compatibility
3. Deploy new application version
4. Verify migration success
5. Clean up old schema (if needed)

```bash
# Example: Manual migration application
psql $DATABASE_URL -f migrations/001_new_table.sql
# Then redeploy application
```

### Rollback Procedures

```bash
# Dashboard rollback
1. Coolify -> Application -> Deployments
2. Find previous successful deployment
3. Click "Redeploy" on that version

# Git-based rollback
git checkout v1.2.0  # Previous working version
git push --force origin main
```

### Backup Strategy

| Component | Backup Method |
|-----------|--------------|
| **Application code** | Git repository (always available) |
| **Environment variables** | Export from Coolify, store securely |
| **Persistent volumes** | `docker cp` or volume backup |
| **External databases** | Provider's backup (Supabase, Neo4j Aura) |

```bash
# Volume backup example
docker run --rm \
  -v myapp-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/data-$(date +%Y%m%d).tar.gz /data
```

### Log Management

```bash
# View logs in Coolify
Dashboard -> Application -> Logs

# Filter logs (in terminal)
docker logs <container> 2>&1 | grep "ERROR"
docker logs --tail 100 --since 1h <container>

# Export logs
docker logs <container> > app-logs-$(date +%Y%m%d).txt 2>&1
```

---

## 12. Cost Considerations

### Infrastructure Costs

| Tier | Server Specs | Monthly Cost | Suitable For |
|------|--------------|--------------|--------------|
| **Entry** | 2 vCPU, 4GB RAM | $10-20 | Development, staging |
| **Standard** | 4 vCPU, 8GB RAM | $40-60 | Small production apps |
| **Production** | 8 vCPU, 16GB RAM | $80-120 | Medium traffic apps |
| **Enterprise** | 16+ vCPU, 32GB+ RAM | $200+ | High traffic, multi-app |

### Provider Options

- **Hetzner**: Best value (Europe-focused)
- **DigitalOcean**: Good balance, global presence
- **Vultr**: Competitive pricing
- **AWS/GCP/Azure**: Enterprise features, higher cost
- **Self-hosted**: Hardware you control

### External Service Costs

| Service | Free Tier | Paid Starting |
|---------|-----------|---------------|
| **Supabase** | 500MB DB, 1GB storage | $25/month |
| **Neo4j Aura** | 50k nodes | $65/month |
| **OpenAI API** | None | Pay-per-use (~$0.15/1M tokens) |
| **GitHub** | Public repos unlimited | $4/user/month (private) |

### Cost Optimization Strategies

1. **Right-size resources**: Start small, scale up based on metrics
2. **Use free tiers**: Supabase, Neo4j Aura free for development
3. **Efficient LLM usage**: gpt-4o-mini vs gpt-4 (15x cheaper)
4. **Cache aggressively**: Reduce repeated API calls
5. **Disable unused features**: Don't run what you don't need

---

## 13. When to Use Coolify

### Ideal Scenarios

| Scenario | Why Coolify Works |
|----------|-------------------|
| Self-hosted requirements | Full data control, compliance |
| Fixed budget | Predictable server costs |
| Complex Docker builds | Full Dockerfile control |
| Long-running processes | No cold starts, persistent connections |
| AI/ML workloads | GPU access, high memory |
| Multi-environment | Dev/staging/prod on one server |
| Team collaboration | RBAC, shared dashboard |

### Less Ideal Scenarios

| Scenario | Better Alternative |
|----------|-------------------|
| Global edge deployment | Vercel, Cloudflare Workers |
| Serverless-first | AWS Lambda, Vercel Functions |
| Zero DevOps desired | Heroku, Railway |
| Extreme auto-scaling | Kubernetes, AWS ECS |
| Compliance-heavy enterprise | Managed Kubernetes (EKS, GKE) |

---

## 14. Comparison with Alternatives

### Feature Comparison

| Feature | Coolify | Heroku | Vercel | Railway | Render |
|---------|---------|--------|--------|---------|--------|
| **Self-hosted** | Yes | No | No | No | No |
| **Open source** | Yes | No | No | No | No |
| **Free tier** | Self-host | Limited | Yes | Yes | Yes |
| **Docker support** | Full | Limited | No | Yes | Yes |
| **Git integration** | Yes | Yes | Yes | Yes | Yes |
| **Auto SSL** | Yes | Yes | Yes | Yes | Yes |
| **Custom domains** | Yes | Yes | Yes | Yes | Yes |
| **Databases** | Self-managed | Add-ons | No | Yes | Yes |
| **Global edge** | No | No | Yes | No | No |
| **Serverless** | No | No | Yes | No | Yes |

### When to Choose Each

- **Coolify**: Self-hosting, data control, cost optimization
- **Heroku**: Quick prototypes, add-on ecosystem
- **Vercel**: Frontend, serverless, global edge
- **Railway**: Simple deployments, good developer experience
- **Render**: Balanced features, managed services

---

## Summary

Coolify provides a powerful, self-hosted alternative to traditional PaaS platforms. Its strengths lie in:

1. **Full control** over your infrastructure and data
2. **Cost predictability** with fixed server costs
3. **Docker flexibility** for complex applications
4. **API-driven automation** for CI/CD integration
5. **Zero-downtime deployments** with health checks

**Best suited for**:
- Teams wanting PaaS convenience with self-hosted control
- Applications with specific Docker or resource requirements
- Cost-conscious deployments beyond free tier limits
- Privacy-sensitive or compliance-requiring applications

**Start with**:
1. Install Coolify on a VPS (Hetzner, DigitalOcean, etc.)
2. Connect your Git repository
3. Configure environment variables
4. Deploy and iterate

For production deployments, combine Coolify's container orchestration with managed database services (Supabase, Neo4j Aura) to get the best of both worlds: self-hosted application control with professional database management.

---

## Resources

- **Coolify Documentation**: https://coolify.io/docs
- **Coolify GitHub**: https://github.com/coollabsio/coolify
- **Community Discord**: https://coolify.io/discord
- **API Reference**: https://coolify.io/docs/api
