# Tavily SDK Integration Plan

## Overview

This document outlines the implementation plan to scaffold the Tavily Python SDK into the existing FastAPI boilerplate. The integration will expose Tavily's search, extract, crawl, and map functionalities through RESTful API endpoints.

---

## Phase 1: Dependencies & Configuration

### 1.1 Add Tavily SDK Dependency

**File:** `backend/pyproject.toml`

Add to dependencies:
```toml
"tavily-python>=0.5.0",
```

### 1.2 Environment Configuration

**File:** `backend/app/core/config.py`

Add new settings:
```python
TAVILY_API_KEY: str  # Required - Tavily API key
TAVILY_TIMEOUT: float = 60.0  # Optional - Request timeout
TAVILY_HTTP_PROXY: str | None = None  # Optional - HTTP proxy
TAVILY_HTTPS_PROXY: str | None = None  # Optional - HTTPS proxy
```

**File:** `.env`

Add environment variable:
```
TAVILY_API_KEY=tvly-YOUR_API_KEY
```

---

## Phase 2: Service Layer

### 2.1 Tavily Client Service

**File:** `backend/app/services/__init__.py` (new directory)

**File:** `backend/app/services/tavily.py`

Create a service class to manage Tavily client instances:

```python
class TavilyService:
    """Service for managing Tavily API interactions."""

    def __init__(self):
        self._sync_client: TavilyClient | None = None
        self._async_client: AsyncTavilyClient | None = None

    def get_sync_client(self) -> TavilyClient
    async def get_async_client(self) -> AsyncTavilyClient

    # Search methods
    async def search(self, query: str, **kwargs) -> SearchResponse

    # Extract methods
    async def extract(self, urls: list[str], **kwargs) -> ExtractResponse

    # Crawl methods
    async def crawl(self, url: str, **kwargs) -> CrawlResponse

    # Map methods
    async def map_url(self, url: str, **kwargs) -> MapResponse
```

### 2.2 Dependency Injection

**File:** `backend/app/api/deps.py`

Add new dependencies:
```python
def get_tavily_service() -> TavilyService:
    """Get Tavily service instance."""
    return TavilyService()

TavilyDep = Annotated[TavilyService, Depends(get_tavily_service)]
```

---

## Phase 3: Pydantic Schemas

**File:** `backend/app/schemas/__init__.py` (new directory)

**File:** `backend/app/schemas/tavily.py`

### 3.1 Search Schemas

```python
# Request schemas
class SearchRequest(BaseModel):
    query: str  # Required
    search_depth: Literal["basic", "advanced"] = "basic"
    topic: Literal["general", "news", "finance"] = "general"
    time_range: Literal["day", "week", "month", "year", "d", "w", "m", "y"] | None = None
    start_date: str | None = None  # Format: YYYY-MM-DD
    end_date: str | None = None  # Format: YYYY-MM-DD
    max_results: int = Field(default=5, ge=0, le=20)
    chunks_per_source: int = Field(default=3, ge=1)
    include_images: bool = False
    include_image_descriptions: bool = False
    include_answer: bool | Literal["basic", "advanced"] = False
    include_raw_content: bool | Literal["markdown", "text"] = False
    include_domains: list[str] = Field(default_factory=list, max_length=300)
    exclude_domains: list[str] = Field(default_factory=list, max_length=150)
    country: str | None = None
    auto_parameters: bool = False

# Response schemas
class SearchResult(BaseModel):
    title: str
    url: str
    content: str
    score: float
    raw_content: str | None = None
    published_date: str | None = None
    favicon: str | None = None

class ImageResult(BaseModel):
    url: str
    description: str | None = None

class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]
    response_time: float
    answer: str | None = None
    images: list[str] | list[ImageResult] | None = None
    request_id: str
```

### 3.2 Extract Schemas

```python
class ExtractRequest(BaseModel):
    urls: str | list[str]  # Single URL or list (max 20)
    include_images: bool = False
    extract_depth: Literal["basic", "advanced"] = "basic"
    format: Literal["markdown", "text"] = "markdown"
    timeout: float | None = None
    query: str | None = None  # For reranking chunks
    chunks_per_source: int = Field(default=3, ge=1, le=5)

class ExtractResult(BaseModel):
    url: str
    raw_content: str
    images: list[str] | None = None
    favicon: str | None = None

class ExtractFailedResult(BaseModel):
    url: str
    error: str

class ExtractResponse(BaseModel):
    results: list[ExtractResult]
    failed_results: list[ExtractFailedResult]
    response_time: float
    request_id: str
```

### 3.3 Crawl Schemas

```python
class CrawlRequest(BaseModel):
    url: str  # Required - root URL
    max_depth: int = Field(default=1, ge=1)
    max_breadth: int = Field(default=20, ge=1)
    limit: int = Field(default=50, ge=1)
    instructions: str | None = None
    select_paths: list[str] | None = None  # Regex patterns
    select_domains: list[str] | None = None  # Regex patterns
    exclude_paths: list[str] | None = None  # Regex patterns
    exclude_domains: list[str] | None = None  # Regex patterns
    allow_external: bool = True
    include_images: bool = False
    extract_depth: Literal["basic", "advanced"] = "basic"
    format: Literal["markdown", "text"] = "markdown"
    timeout: float = Field(default=150, ge=10, le=150)
    chunks_per_source: int = Field(default=3, ge=1, le=5)

class CrawlResult(BaseModel):
    url: str
    raw_content: str
    images: list[str] | None = None
    favicon: str | None = None

class CrawlResponse(BaseModel):
    base_url: str
    results: list[CrawlResult]
    response_time: float
    request_id: str
```

### 3.4 Map Schemas

```python
class MapRequest(BaseModel):
    url: str  # Required - root URL
    max_depth: int = Field(default=1, ge=1)
    max_breadth: int = Field(default=20, ge=1)
    limit: int = Field(default=50, ge=1)
    instructions: str | None = None
    select_paths: list[str] | None = None
    select_domains: list[str] | None = None
    exclude_paths: list[str] | None = None
    exclude_domains: list[str] | None = None
    allow_external: bool = True
    timeout: float = Field(default=150, ge=10, le=150)

class MapResponse(BaseModel):
    base_url: str
    results: list[str]  # List of discovered URLs
    response_time: float
    request_id: str
```

---

## Phase 4: API Routes

### 4.1 Router Structure

**File:** `backend/app/api/routes/tavily.py`

```python
router = APIRouter(prefix="/tavily", tags=["tavily"])
```

### 4.2 Search Endpoint

```python
@router.post("/search", response_model=SearchResponse)
async def search(
    request: SearchRequest,
    current_user: CurrentUser,
    tavily: TavilyDep,
) -> SearchResponse:
    """
    Execute a Tavily web search.

    - **query**: Search query string
    - **search_depth**: "basic" or "advanced" (2 credits for advanced)
    - **topic**: "general", "news", or "finance"
    - **max_results**: Number of results (0-20)
    """
```

### 4.3 Extract Endpoint

```python
@router.post("/extract", response_model=ExtractResponse)
async def extract(
    request: ExtractRequest,
    current_user: CurrentUser,
    tavily: TavilyDep,
) -> ExtractResponse:
    """
    Extract content from one or more URLs.

    - **urls**: Single URL or list of URLs (max 20)
    - **extract_depth**: "basic" or "advanced"
    - **format**: "markdown" or "text"
    """
```

### 4.4 Crawl Endpoint

```python
@router.post("/crawl", response_model=CrawlResponse)
async def crawl(
    request: CrawlRequest,
    current_user: CurrentUser,
    tavily: TavilyDep,
) -> CrawlResponse:
    """
    Crawl a website starting from a root URL.

    - **url**: Starting URL for the crawl
    - **max_depth**: How deep to crawl
    - **limit**: Total pages to process
    - **instructions**: Natural language guidance
    """
```

### 4.5 Map Endpoint

```python
@router.post("/map", response_model=MapResponse)
async def map_site(
    request: MapRequest,
    current_user: CurrentUser,
    tavily: TavilyDep,
) -> MapResponse:
    """
    Generate a sitemap starting from a root URL.

    - **url**: Starting URL for mapping
    - **max_depth**: How deep to map
    - **limit**: Total URLs to discover
    """
```

### 4.6 Register Router

**File:** `backend/app/api/main.py`

```python
from app.api.routes import items, login, private, users, utils, tavily

api_router.include_router(tavily.router)
```

---

## Phase 5: Database Models (Optional - For Caching/History)

**File:** `backend/app/models.py`

Add optional models for search history tracking:

```python
class SearchHistory(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    query: str = Field(max_length=1000)
    search_type: str = Field(max_length=20)  # search, extract, crawl, map
    request_id: str = Field(max_length=100)
    response_time: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: User | None = Relationship(back_populates="search_history")
```

---

## Phase 6: Error Handling

**File:** `backend/app/api/routes/tavily.py`

Implement custom exception handling:

```python
class TavilyAPIError(HTTPException):
    """Custom exception for Tavily API errors."""
    pass

@router.exception_handler(TavilyAPIError)
async def tavily_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "type": "tavily_error"}
    )
```

Common error scenarios:
- Invalid API key (401)
- Rate limiting (429)
- Invalid URL format (400)
- Timeout errors (504)
- Extraction failures (partial success handling)

---

## Phase 7: Testing

### 7.1 Unit Tests

**File:** `backend/tests/api/routes/test_tavily.py`

```python
class TestTavilySearch:
    def test_search_basic(self, client, superuser_token_headers)
    def test_search_with_filters(self, client, superuser_token_headers)
    def test_search_invalid_query(self, client, superuser_token_headers)

class TestTavilyExtract:
    def test_extract_single_url(self, client, superuser_token_headers)
    def test_extract_multiple_urls(self, client, superuser_token_headers)
    def test_extract_invalid_url(self, client, superuser_token_headers)

class TestTavilyCrawl:
    def test_crawl_basic(self, client, superuser_token_headers)
    def test_crawl_with_instructions(self, client, superuser_token_headers)

class TestTavilyMap:
    def test_map_basic(self, client, superuser_token_headers)
    def test_map_with_filters(self, client, superuser_token_headers)
```

### 7.2 Integration Tests

**File:** `backend/tests/integration/test_tavily_integration.py`

Test actual API calls (requires valid API key):
- Real search queries
- URL extraction
- Website crawling
- Sitemap generation

---

## Phase 8: Documentation

### 8.1 OpenAPI Documentation

All endpoints will automatically generate OpenAPI documentation via FastAPI's built-in support. Include detailed descriptions in route docstrings.

### 8.2 README Updates

**File:** `README.md`

Add section for Tavily integration:
- Configuration instructions
- Available endpoints
- Example requests/responses
- API credit usage information

---

## Implementation Order

1. **Step 1**: Add dependency to `pyproject.toml` and install
2. **Step 2**: Add configuration settings
3. **Step 3**: Create schemas directory and Tavily schemas
4. **Step 4**: Create services directory and Tavily service
5. **Step 5**: Update dependencies in `deps.py`
6. **Step 6**: Create Tavily routes
7. **Step 7**: Register router in `api/main.py`
8. **Step 8**: Add error handling
9. **Step 9**: Write tests
10. **Step 10**: (Optional) Add database models for history

---

## File Structure After Implementation

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── tavily.py          # NEW: Tavily endpoints
│   │   │   └── ...
│   │   ├── deps.py                 # MODIFIED: Add TavilyDep
│   │   └── main.py                 # MODIFIED: Register tavily router
│   ├── core/
│   │   └── config.py               # MODIFIED: Add Tavily settings
│   ├── schemas/                    # NEW DIRECTORY
│   │   ├── __init__.py
│   │   └── tavily.py               # NEW: Tavily request/response models
│   ├── services/                   # NEW DIRECTORY
│   │   ├── __init__.py
│   │   └── tavily.py               # NEW: Tavily service layer
│   └── models.py                   # OPTIONAL: Add SearchHistory
├── tests/
│   ├── api/
│   │   └── routes/
│   │       └── test_tavily.py      # NEW: Tavily route tests
│   └── integration/                # NEW DIRECTORY
│       └── test_tavily_integration.py
└── pyproject.toml                  # MODIFIED: Add tavily-python
```

---

## API Credit Considerations

| Endpoint | Credit Usage |
|----------|-------------|
| Search (basic) | 1 credit |
| Search (advanced) | 2 credits |
| Extract (basic) | 1 credit per 5 URLs |
| Extract (advanced) | 2 credits per 5 URLs |
| Crawl | Based on pages crawled |
| Map | Based on pages mapped |

Consider implementing:
- Rate limiting per user
- Credit usage tracking
- Usage quotas/limits

---

## Security Considerations

1. **API Key Protection**: Store Tavily API key securely in environment variables
2. **Authentication**: All endpoints require user authentication via JWT
3. **Input Validation**: Validate all user inputs before passing to Tavily
4. **URL Validation**: Sanitize and validate URLs for extract/crawl/map
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **Error Sanitization**: Don't expose internal errors to clients
