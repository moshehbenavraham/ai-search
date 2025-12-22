# tavily-app

AI-powered search application integrating the Tavily API with a FastAPI backend and React frontend.

## Quick Start

```bash
# Start the full stack with Docker Compose
docker compose up -d

# Or run backend and frontend separately:
# Backend
cd backend && uv sync && source .venv/bin/activate && fastapi dev app/main.py

# Frontend
cd frontend && npm install && npm run dev
```

Access the app at http://localhost:5179

## Repository Structure

```
.
├── backend/           # FastAPI backend with Tavily integration
│   ├── app/
│   │   ├── api/routes/tavily.py   # Tavily API endpoints
│   │   ├── schemas/tavily.py      # Request/response models
│   │   └── services/tavily.py     # TavilyService class
│   └── tests/         # pytest tests
├── frontend/          # React 19 + TypeScript frontend
│   ├── src/
│   │   ├── client/    # Generated OpenAPI client
│   │   ├── components/
│   │   └── routes/
│   └── tests/         # Playwright e2e tests
├── docs/              # Reference documentation
├── scripts/           # Development scripts
└── .spec_system/      # Project specifications and PRD
```

## Tavily API Endpoints

All endpoints require JWT authentication.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/tavily/search` | POST | Web search with topic filtering |
| `/api/v1/tavily/extract` | POST | Extract content from URLs |
| `/api/v1/tavily/crawl` | POST | Crawl website with instructions |
| `/api/v1/tavily/map` | POST | Generate sitemap from URL |

## Documentation

- [Development Guide](development.md) - Local setup and Docker workflow
- [Deployment Guide](deployment.md) - Production deployment with Traefik
- [Backend README](backend/README_backend.md) - Backend-specific docs
- [Frontend README](frontend/README_frontend.md) - Frontend-specific docs
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **tavily-python** - Official Tavily SDK
- **SQLModel** - ORM for PostgreSQL
- **Pydantic** - Data validation
- **pytest** - Testing framework

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **TanStack Router/Query** - Routing and data fetching
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Playwright** - E2E testing

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `TAVILY_API_KEY` | Yes | Tavily API key from https://tavily.com |
| `SECRET_KEY` | Yes | JWT signing key |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `FIRST_SUPERUSER_PASSWORD` | Yes | Initial admin password |

## Project Status

| Phase | Name | Sessions | Status |
|-------|------|----------|--------|
| 00 | Core Setup | 6 | Complete |
| 01 | Frontend Integration | 6 | Complete |
| 02 | Saving Results to Items | 3 | Complete |

All 15 sessions across 3 phases are complete. See [PRD](.spec_system/PRD/PRD.md) for details.

## License

MIT License - see [LICENSE](LICENSE)
