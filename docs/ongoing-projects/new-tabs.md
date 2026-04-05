# Adding New API Integrations (Perplexity, Google Deep Research)

## Executive Summary

This document analyzes the current Tavily integration architecture to provide a clear roadmap for adding new API integrations (Perplexity, Google Deep Research). The codebase follows a well-structured pattern that makes adding new APIs straightforward.

---

## Current Architecture Overview

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND                                                                     │
│                                                                              │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────────────────┐    │
│  │ SearchForm   │───▶│ useTavilySearch │───▶│ TavilyService.search()  │    │
│  │ (React Hook  │    │ (React Query    │    │ (Generated SDK Client)   │    │
│  │  Form + Zod) │    │  Mutation)      │    │                          │    │
│  └──────────────┘    └─────────────────┘    └────────────┬─────────────┘    │
│                                                          │                   │
└──────────────────────────────────────────────────────────┼───────────────────┘
                                                           │ POST /api/v1/tavily/search
                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND                                                                      │
│                                                                              │
│  ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────────┐    │
│  │ tavily.py routes │───▶│ TavilyService   │───▶│ AsyncTavilyClient    │    │
│  │ (FastAPI Router) │    │ (Service Layer) │    │ (tavily-python SDK)  │    │
│  └──────────────────┘    └─────────────────┘    └──────────────────────┘    │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────┐                                                        │
│  │ Pydantic Schemas │ ◀── Request/Response validation                        │
│  └──────────────────┘                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture Deep Dive

### File Structure (Backend)

```
backend/app/
├── api/
│   ├── deps.py              # Dependency injection (TavilyDep, CurrentUser)
│   ├── main.py              # Router registration
│   └── routes/
│       └── tavily.py        # Route handlers
├── core/
│   ├── config.py            # TavilySettings configuration
│   └── exceptions.py        # TavilyAPIError, TavilyErrorCode
├── schemas/
│   └── tavily.py            # Pydantic request/response models
└── services/
    └── tavily.py            # TavilyService (API client wrapper)
```

### Key Backend Files & Locations

| File | Purpose | Key Lines |
|------|---------|-----------|
| `backend/app/services/tavily.py` | Service layer wrapping Tavily SDK | Lines 38-66 (init), 68-124 (search) |
| `backend/app/api/routes/tavily.py` | FastAPI route handlers | Lines 75-114 (search endpoint) |
| `backend/app/schemas/tavily.py` | Pydantic request/response models | Lines 127-188 (SearchRequest), 340-386 (SearchResponse) |
| `backend/app/core/config.py` | Settings with env prefix `TAVILY_` | Lines 19-44 (TavilySettings) |
| `backend/app/core/exceptions.py` | Custom exception classes | TavilyErrorCode enum, TavilyAPIError class |
| `backend/app/api/deps.py` | Dependency injection factory | Lines 31-40 (get_tavily_service, TavilyDep) |
| `backend/app/api/main.py` | Router includes | Line 11 (tavily.router) |

### Service Layer Pattern

```python
# backend/app/services/tavily.py (simplified)

class TavilyService:
    def __init__(self) -> None:
        tavily_settings = settings.tavily
        self._timeout: int = tavily_settings.timeout
        self._client: AsyncTavilyClient = AsyncTavilyClient(
            api_key=tavily_settings.api_key,
            proxies=self._build_proxies(tavily_settings.proxy),
        )

    async def search(self, query: str, ...) -> dict[str, Any]:
        result = await self._client.search(query=query, ...)
        return result
```

### Dependency Injection Pattern

```python
# backend/app/api/deps.py

def get_tavily_service() -> TavilyService:
    """Factory function for TavilyService dependency injection."""
    return TavilyService()

TavilyDep = Annotated[TavilyService, Depends(get_tavily_service)]

# Usage in routes:
@router.post("/search")
async def search(
    _current_user: CurrentUser,  # Auth required
    tavily: TavilyDep,           # Service injected
    request: SearchRequest,       # Validated request
) -> SearchResponse:
    ...
```

### Configuration Pattern

```python
# backend/app/core/config.py

class TavilySettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="TAVILY_",  # Reads TAVILY_API_KEY, TAVILY_TIMEOUT, etc.
    )

    api_key: str           # Required
    timeout: int = 60      # Optional with default
    proxy: str | None = None

class Settings(BaseSettings):
    tavily: TavilySettings = Field(default_factory=lambda: TavilySettings())
```

### Error Handling Pattern

```python
# backend/app/core/exceptions.py

class TavilyErrorCode(str, Enum):
    RATE_LIMIT_EXCEEDED = "TAVILY_RATE_LIMIT_EXCEEDED"
    INVALID_API_KEY = "TAVILY_INVALID_API_KEY"
    REQUEST_TIMEOUT = "TAVILY_REQUEST_TIMEOUT"
    ...

class TavilyAPIError(Exception):
    @classmethod
    def rate_limit_exceeded(cls, details: dict | None = None) -> "TavilyAPIError":
        return cls(
            status_code=429,
            error_code=TavilyErrorCode.RATE_LIMIT_EXCEEDED,
            message="Rate limit exceeded",
            details=details,
        )
```

---

## Frontend Architecture Deep Dive

### File Structure (Frontend)

```
frontend/src/
├── client/
│   ├── sdk.gen.ts           # Generated SDK (TavilyService class)
│   └── types.gen.ts         # Generated types from OpenAPI
├── components/Tavily/
│   ├── SearchForm.tsx       # Form with validation
│   ├── SearchResultsList.tsx
│   ├── SearchResultDetail.tsx
│   └── ...
├── hooks/
│   ├── useTavilySearch.ts   # React Query mutation hook
│   ├── useExtract.ts
│   ├── useCrawl.ts
│   └── useMap.ts
├── lib/schemas/
│   └── tavily.ts            # Zod validation schemas
└── routes/_layout/
    ├── search.tsx           # Search page
    ├── extract.tsx
    ├── crawl.tsx
    └── map.tsx
```

### Key Frontend Files & Locations

| File | Purpose | Key Lines |
|------|---------|-----------|
| `frontend/src/hooks/useTavilySearch.ts` | React Query mutation | Lines 12-24 (useMutation setup) |
| `frontend/src/client/sdk.gen.ts` | Generated SDK client | Lines 238-375 (TavilyService class) |
| `frontend/src/components/Tavily/SearchForm.tsx` | Search form with validation | Lines 43-74 (form setup) |
| `frontend/src/lib/schemas/tavily.ts` | Zod form validation | tavilySearchSchema |
| `frontend/src/routes/_layout/search.tsx` | Search page component | Lines 24-36 (state + hooks) |

### React Query Hook Pattern

```typescript
// frontend/src/hooks/useTavilySearch.ts

export function useTavilySearch(options?: UseTavilySearchOptions) {
  const { showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (data: SearchRequest) =>
      TavilyService.search({ requestBody: data }),
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      showErrorToast(error)
    },
  })

  return mutation
}
```

### Generated SDK Pattern

```typescript
// frontend/src/client/sdk.gen.ts (auto-generated)

export class TavilyService {
  public static search(data: TavilySearchData): CancelablePromise<TavilySearchResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/tavily/search",
      body: data.requestBody,
    })
  }
}
```

---

## Step-by-Step Guide: Adding a New API (e.g., Perplexity)

### Step 1: Backend Configuration

Create settings class in `backend/app/core/config.py`:

```python
class PerplexitySettings(BaseSettings):
    """Configuration for Perplexity API integration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        env_prefix="PERPLEXITY_",
    )

    api_key: str
    timeout: int = 60
    model: str = "llama-3.1-sonar-large-128k-online"

# Add to main Settings class:
class Settings(BaseSettings):
    # ... existing settings ...
    perplexity: PerplexitySettings = Field(
        default_factory=lambda: PerplexitySettings()
    )
```

Update `.env.example`:

```
# Perplexity API Configuration
PERPLEXITY_API_KEY=your-perplexity-api-key-here
PERPLEXITY_TIMEOUT=60
PERPLEXITY_MODEL=llama-3.1-sonar-large-128k-online
```

### Step 2: Backend Schemas

Create `backend/app/schemas/perplexity.py`:

```python
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field

class PerplexityModel(str, Enum):
    SONAR_SMALL = "llama-3.1-sonar-small-128k-online"
    SONAR_LARGE = "llama-3.1-sonar-large-128k-online"
    SONAR_HUGE = "llama-3.1-sonar-huge-128k-online"

class PerplexitySearchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    query: str = Field(..., min_length=1, max_length=2000, description="Search query")
    model: PerplexityModel = Field(
        default=PerplexityModel.SONAR_LARGE,
        description="Model to use for search"
    )
    return_citations: bool = Field(default=True, description="Include citations")
    return_images: bool = Field(default=False, description="Include images")

class PerplexityCitation(BaseModel):
    url: str
    title: str | None = None

class PerplexitySearchResponse(BaseModel):
    answer: str
    citations: list[PerplexityCitation]
    images: list[str] | None = None
    model: str
    usage: dict[str, int] | None = None
```

### Step 3: Backend Service

Create `backend/app/services/perplexity.py`:

```python
import httpx
from typing import Any

from app.core.config import settings
from app.core.exceptions import PerplexityAPIError

class PerplexityService:
    """Service for interacting with Perplexity API."""

    BASE_URL = "https://api.perplexity.ai"

    def __init__(self) -> None:
        perplexity_settings = settings.perplexity
        self._timeout = perplexity_settings.timeout
        self._api_key = perplexity_settings.api_key
        self._default_model = perplexity_settings.model

    async def search(
        self,
        query: str,
        model: str | None = None,
        return_citations: bool = True,
        return_images: bool = False,
    ) -> dict[str, Any]:
        """Perform a search using Perplexity API."""

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model or self._default_model,
            "messages": [
                {"role": "user", "content": query}
            ],
            "return_citations": return_citations,
            "return_images": return_images,
        }

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                return self._parse_response(response.json())
            except httpx.HTTPStatusError as e:
                raise self._handle_error(e)

    def _parse_response(self, data: dict) -> dict[str, Any]:
        """Parse Perplexity API response into standard format."""
        choice = data["choices"][0]
        return {
            "answer": choice["message"]["content"],
            "citations": data.get("citations", []),
            "images": data.get("images"),
            "model": data["model"],
            "usage": data.get("usage"),
        }

    def _handle_error(self, error: httpx.HTTPStatusError) -> PerplexityAPIError:
        """Convert HTTP errors to PerplexityAPIError."""
        status = error.response.status_code
        if status == 401:
            return PerplexityAPIError.invalid_api_key()
        elif status == 429:
            return PerplexityAPIError.rate_limit_exceeded()
        else:
            return PerplexityAPIError.api_error(details={"status": status})
```

### Step 4: Backend Exceptions

Add to `backend/app/core/exceptions.py`:

```python
class PerplexityErrorCode(str, Enum):
    RATE_LIMIT_EXCEEDED = "PERPLEXITY_RATE_LIMIT_EXCEEDED"
    INVALID_API_KEY = "PERPLEXITY_INVALID_API_KEY"
    REQUEST_TIMEOUT = "PERPLEXITY_REQUEST_TIMEOUT"
    INVALID_REQUEST = "PERPLEXITY_INVALID_REQUEST"
    API_ERROR = "PERPLEXITY_API_ERROR"

class PerplexityAPIError(Exception):
    def __init__(
        self,
        status_code: int,
        error_code: PerplexityErrorCode,
        message: str,
        details: dict | None = None,
    ) -> None:
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details or {}
        super().__init__(message)

    @classmethod
    def rate_limit_exceeded(cls, details: dict | None = None) -> "PerplexityAPIError":
        return cls(429, PerplexityErrorCode.RATE_LIMIT_EXCEEDED, "Rate limit exceeded", details)

    @classmethod
    def invalid_api_key(cls, details: dict | None = None) -> "PerplexityAPIError":
        return cls(401, PerplexityErrorCode.INVALID_API_KEY, "Invalid API key", details)

    @classmethod
    def api_error(cls, details: dict | None = None) -> "PerplexityAPIError":
        return cls(500, PerplexityErrorCode.API_ERROR, "Perplexity API error", details)
```

### Step 5: Backend Dependencies

Add to `backend/app/api/deps.py`:

```python
from app.services.perplexity import PerplexityService

def get_perplexity_service() -> PerplexityService:
    """Factory function for PerplexityService dependency injection."""
    return PerplexityService()

PerplexityDep = Annotated[PerplexityService, Depends(get_perplexity_service)]
```

### Step 6: Backend Routes

Create `backend/app/api/routes/perplexity.py`:

```python
from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUser, PerplexityDep
from app.core.exceptions import PerplexityAPIError
from app.schemas.perplexity import PerplexitySearchRequest, PerplexitySearchResponse

router = APIRouter(prefix="/perplexity", tags=["perplexity"])

@router.post("/search", response_model=PerplexitySearchResponse)
async def search(
    _current_user: CurrentUser,
    perplexity: PerplexityDep,
    request: PerplexitySearchRequest,
) -> Any:
    """
    Perform a search using Perplexity AI.

    Args:
        request: Search parameters including query, model, and options.

    Returns:
        Search response with answer, citations, and optional images.

    Raises:
        PerplexityAPIError: If the API request fails.
    """
    try:
        result = await perplexity.search(
            query=request.query,
            model=request.model.value if request.model else None,
            return_citations=request.return_citations,
            return_images=request.return_images,
        )
        return PerplexitySearchResponse.model_validate(result)
    except PerplexityAPIError:
        raise
    except Exception as e:
        raise PerplexityAPIError.api_error(details={"error": str(e)})
```

### Step 7: Register Router & Exception Handler

Update `backend/app/api/main.py`:

```python
from app.api.routes import items, login, perplexity, private, tavily, users, utils

api_router = APIRouter()
# ... existing includes ...
api_router.include_router(perplexity.router)
```

Update `backend/app/main.py`:

```python
from app.core.exceptions import PerplexityAPIError, TavilyAPIError

@app.exception_handler(PerplexityAPIError)
async def perplexity_exception_handler(_request: Request, exc: PerplexityAPIError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
        ).model_dump(),
    )
```

### Step 8: Regenerate Frontend Client

```bash
cd frontend
npm run generate-client
```

This auto-generates:
- `PerplexityService` class in `sdk.gen.ts`
- TypeScript types for request/response in `types.gen.ts`

### Step 9: Frontend Hook

Create `frontend/src/hooks/usePerplexitySearch.ts`:

```typescript
import { useMutation } from "@tanstack/react-query"
import { PerplexityService, PerplexitySearchRequest, PerplexitySearchResponse } from "@/client"
import { useCustomToast } from "@/hooks/useCustomToast"

interface UsePerplexitySearchOptions {
  onSuccess?: (data: PerplexitySearchResponse) => void
}

export function usePerplexitySearch(options?: UsePerplexitySearchOptions) {
  const { showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (data: PerplexitySearchRequest) =>
      PerplexityService.search({ requestBody: data }),
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      showErrorToast(error)
    },
  })

  return mutation
}
```

### Step 10: Frontend Components

Create component folder `frontend/src/components/Perplexity/` with:
- `PerplexitySearchForm.tsx`
- `PerplexityResultView.tsx`
- `PerplexityCitationsList.tsx`

### Step 11: Frontend Route

Create `frontend/src/routes/_layout/perplexity.tsx`:

```typescript
import { useState } from "react"
import { usePerplexitySearch } from "@/hooks/usePerplexitySearch"
import { PerplexitySearchForm } from "@/components/Perplexity/PerplexitySearchForm"
import { PerplexityResultView } from "@/components/Perplexity/PerplexityResultView"

export default function PerplexityPage() {
  const [result, setResult] = useState<PerplexitySearchResponse | null>(null)

  const mutation = usePerplexitySearch({
    onSuccess: (data) => setResult(data),
  })

  return (
    <div className="container mx-auto p-4">
      <h1>Perplexity AI Search</h1>
      <PerplexitySearchForm mutation={mutation} />
      {result && <PerplexityResultView result={result} />}
    </div>
  )
}
```

### Step 12: Add Navigation

Update sidebar/navigation to include the new Perplexity tab.

---

## Google Deep Research Integration Notes

Google Deep Research API has a different pattern - it's an async job-based API:

1. **Submit research request** → Returns job ID
2. **Poll for completion** → Check job status
3. **Retrieve results** → Get completed research

This requires additional patterns:
- Job status tracking in database or cache
- Polling mechanism (frontend or backend)
- Webhook support for completion notifications

Suggested implementation:

```python
# Backend schema additions
class GoogleResearchJobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class GoogleResearchRequest(BaseModel):
    query: str
    depth: str = "comprehensive"

class GoogleResearchJobResponse(BaseModel):
    job_id: str
    status: GoogleResearchJobStatus
    estimated_time: int | None = None

class GoogleResearchResultResponse(BaseModel):
    job_id: str
    status: GoogleResearchJobStatus
    result: GoogleResearchResult | None = None
```

```python
# Additional routes needed
@router.post("/research", response_model=GoogleResearchJobResponse)
async def start_research(...) -> Any:
    """Start a deep research job."""

@router.get("/research/{job_id}", response_model=GoogleResearchResultResponse)
async def get_research_status(job_id: str, ...) -> Any:
    """Check research job status and get results."""
```

---

## Checklist for Adding New APIs

### Backend Checklist
- [ ] Add settings class in `config.py` with env prefix
- [ ] Update `.env.example` with new variables
- [ ] Create schemas in `schemas/<api_name>.py`
- [ ] Create service class in `services/<api_name>.py`
- [ ] Add exception classes to `exceptions.py`
- [ ] Add dependency injection in `deps.py`
- [ ] Create routes in `api/routes/<api_name>.py`
- [ ] Register router in `api/main.py`
- [ ] Add exception handler in `main.py`

### Frontend Checklist
- [ ] Regenerate client: `npm run generate-client`
- [ ] Create React Query hook in `hooks/`
- [ ] Create Zod schema in `lib/schemas/`
- [ ] Create components in `components/<ApiName>/`
- [ ] Create page route in `routes/_layout/`
- [ ] Add navigation link

---

## Abstraction Opportunities

### Consider Creating Base Classes

For future scalability, consider creating:

```python
# backend/app/services/base.py
class BaseSearchService(ABC):
    @abstractmethod
    async def search(self, query: str, **kwargs) -> SearchResult: ...

# backend/app/schemas/base.py
class BaseSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)

class BaseSearchResult(BaseModel):
    content: str
    sources: list[str]
```

### Unified Search Interface

A future enhancement could be a unified `/search` endpoint that routes to different providers:

```python
@router.post("/search")
async def unified_search(
    request: UnifiedSearchRequest,  # provider: "tavily" | "perplexity" | "google"
) -> UnifiedSearchResponse:
    service = get_service_for_provider(request.provider)
    return await service.search(request.query, **request.options)
```

---

## Summary

The current architecture is well-designed for extensibility:

1. **Service Layer Pattern** - Each API gets its own service class
2. **Dependency Injection** - Clean factory functions and typed dependencies
3. **Schema Validation** - Pydantic on backend, Zod on frontend
4. **Generated SDK** - OpenAPI-based client generation ensures type safety
5. **React Query Hooks** - Consistent mutation pattern for all API calls
6. **Error Handling** - Structured exceptions with error codes

Adding Perplexity or Google Deep Research follows the same pattern established by Tavily, requiring ~10-12 files total across backend and frontend.
