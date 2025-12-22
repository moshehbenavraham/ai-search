# Architecture

## System Overview

tavily-app is a full-stack application that wraps the Tavily AI search API with a FastAPI backend and React frontend. The backend provides authenticated REST endpoints, while the frontend offers a user interface for search, extraction, and crawl operations.

## Dependency Graph

```
                        +-------------------+
                        |   React Frontend  |
                        |   (TanStack Query)|
                        +---------+---------+
                                  |
                                  | HTTP/REST
                                  v
+------------------+    +---------+---------+    +------------------+
|   PostgreSQL     |<---|   FastAPI Backend |<---|   Tavily API     |
|   (User data)    |    |   (JWT Auth)      |    |   (AI Search)    |
+------------------+    +-------------------+    +------------------+
```

## Components

### Backend (`/backend`)

#### TavilyService (`app/services/tavily.py`)
- **Purpose**: Encapsulates all Tavily SDK interactions
- **Tech**: AsyncTavilyClient from tavily-python
- **Methods**: `search()`, `extract()`, `crawl()`, `map_urls()`

#### Tavily Routes (`app/api/routes/tavily.py`)
- **Purpose**: REST endpoints for Tavily operations
- **Tech**: FastAPI router with Pydantic schemas
- **Auth**: JWT via CurrentUser dependency

#### Tavily Schemas (`app/schemas/tavily.py`)
- **Purpose**: Request/response validation
- **Tech**: Pydantic BaseModel

#### TavilyAPIError (`app/core/exceptions.py`)
- **Purpose**: Structured error responses
- **Handles**: Rate limits (429), auth errors (401), timeouts (504), validation (400)

### Frontend (`/frontend`)

#### Generated Client (`src/client/`)
- **Purpose**: Type-safe API calls
- **Tech**: OpenAPI TypeScript generator

#### Tavily Routes (`src/routes/_layout/`)
| Route | File | Purpose |
|-------|------|---------|
| `/search` | `search.tsx` | Web search with topic filtering |
| `/extract` | `extract.tsx` | URL content extraction |
| `/crawl` | `crawl.tsx` | Website crawling with instructions |
| `/map` | `map.tsx` | Sitemap generation |

#### Tavily Components (`src/components/Tavily/`)
- **SearchForm** - Search parameters with topic/depth/filters
- **SearchResultCard** - Individual search result display
- **ExtractForm** - URL input with batch support
- **ExtractResultCard** - Extracted content display
- **CrawlForm** - Crawl parameters with depth/instructions
- **CrawlResultCard** - Crawled page display
- **MapForm** - Sitemap generation parameters
- **MapResultsList** - URL list from sitemap

#### UI Components (`src/components/ui/`)
- **Purpose**: Reusable UI primitives
- **Tech**: shadcn/ui (Radix primitives) + Tailwind CSS

## Tech Stack Rationale

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| FastAPI | Backend framework | Async support, automatic OpenAPI, type hints |
| tavily-python | Tavily SDK | Official SDK with async client |
| Pydantic | Validation | Native FastAPI integration, excellent DX |
| SQLModel | ORM | SQLAlchemy + Pydantic unified models |
| React 19 | Frontend | Modern hooks, concurrent features |
| TanStack Query | Data fetching | Caching, background updates, optimistic UI |
| TanStack Router | Routing | Type-safe, file-based, loader support |
| shadcn/ui | Components | Accessible, customizable, copy-paste |
| Tailwind CSS | Styling | Utility-first, fast iteration |

## Data Flow

### Search Request Flow

```
1. User submits search form
2. TanStack Query mutation calls /api/v1/tavily/search
3. FastAPI validates request via SearchRequest schema
4. CurrentUser dependency verifies JWT token
5. TavilyDep injects TavilyService instance
6. TavilyService.search() calls AsyncTavilyClient
7. Response validated via SearchResponse schema
8. TanStack Query caches result, updates UI
```

### Error Handling Flow

```
1. Tavily SDK raises exception
2. _handle_tavily_exception() maps to TavilyAPIError
3. Exception handler returns structured JSON:
   {
     "error_code": "RATE_LIMIT_EXCEEDED",
     "message": "...",
     "details": {...}
   }
4. Frontend displays toast via Sonner
```

## Key Decisions

### Why Async Throughout
- Tavily API calls are I/O-bound (network)
- AsyncTavilyClient prevents thread blocking
- FastAPI async endpoints handle concurrent requests efficiently

### Why Dependency Injection
- TavilyDep creates TavilyService per-request
- Enables testing with mocked services
- Clean separation of concerns

### Why Pydantic Schemas
- Type safety at API boundaries
- Automatic OpenAPI documentation
- Client code generation from schemas

### Why shadcn/ui Over Component Libraries
- Full control over component code
- No version lock-in
- Consistent with existing boilerplate
