# ai-search

AI-powered research application integrating Tavily, Perplexity Sonar, and Google Gemini APIs with a FastAPI backend and React frontend.  Project was started on FastAPI's Boilerplate.

## Quick Start

```bash
# Start the full stack with Docker Compose
docker compose up -d
```

Access the app at http://localhost:5179

## Local 'Production' Emulation

```bash
# Use bash script for full assembly
./scripts/deploy-local.sh
```

## Repository Structure

```
.
├── backend/           # FastAPI backend with API integrations
│   ├── app/
│   │   ├── api/routes/     # Tavily, Perplexity, Gemini endpoints
│   │   ├── schemas/        # Pydantic request/response models
│   │   └── services/       # Service classes for each API
│   └── tests/              # pytest tests
├── frontend/          # React 19 + TypeScript frontend
│   ├── src/
│   │   ├── client/         # Generated OpenAPI client
│   │   ├── components/     # Tavily, Perplexity, Gemini components
│   │   └── routes/         # Page routes
│   └── tests/              # Playwright e2e tests
├── docs/              # Reference documentation
└── scripts/           # Development scripts
```

## API Endpoints

All endpoints require JWT authentication.

### Tavily (Web Search)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/tavily/search` | POST | Web search with topic filtering |
| `/api/v1/tavily/extract` | POST | Extract content from URLs |
| `/api/v1/tavily/crawl` | POST | Crawl website with instructions |
| `/api/v1/tavily/map` | POST | Generate sitemap from URL |

### Perplexity (Deep Research - Synchronous)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/perplexity/deep-research` | POST | AI-powered research with citations |

### Gemini (Deep Research - Asynchronous)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/gemini/deep-research` | POST | Start async research job |
| `/api/v1/gemini/deep-research/{id}` | GET | Poll research status |
| `/api/v1/gemini/deep-research/{id}` | DELETE | Cancel research |
| `/api/v1/gemini/deep-research/sync` | POST | Blocking wait for completion |

## Documentation

- [Development Guide](docs/development.md) - Local setup and Docker workflow
- [Deployment Guide](docs/deployment.md) - Production deployment with Traefik
- [Architecture](docs/ARCHITECTURE.md) - System design and data flow
- [Onboarding](docs/onboarding.md) - New developer checklist
- [Backend README](backend/README_backend.md) - Backend-specific docs
- [Frontend README](frontend/README_frontend.md) - Frontend-specific docs
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **tavily-python** - Official Tavily SDK
- **httpx** - Async HTTP client for Perplexity/Gemini
- **SQLModel** - ORM for PostgreSQL
- **Pydantic** - Data validation

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **TanStack Router/Query** - Routing, data fetching, polling
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `TAVILY_API_KEY` | Yes | Tavily API key from https://tavily.com |
| `PERPLEXITY_API_KEY` | For deep research | Perplexity API key from https://perplexity.ai |
| `GEMINI_API_KEY` | For deep research | Gemini API key from https://ai.google.dev |
| `SECRET_KEY` | Yes | JWT signing key |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `FIRST_SUPERUSER_PASSWORD` | Yes | Initial admin password |

## License

MIT License - see [LICENSE](LICENSE)
