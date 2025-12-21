# Session Specification

**Session ID**: `phase00-session04-search-and-extract-routes`
**Phase**: 00 - Core Setup
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session creates the API route handlers for Tavily search and extract operations, connecting the service layer (Session 02) and Pydantic schemas (Session 03) to expose functionality via RESTful endpoints. These routes follow the existing FastAPI patterns established in the boilerplate codebase.

The session establishes the foundational router structure at `backend/app/api/routes/tavily.py` and implements two core endpoints: POST `/search` for web search and POST `/extract` for URL content extraction. Both endpoints require JWT authentication via the existing `CurrentUser` dependency and use `TavilyDep` for service injection.

This is a focused session that deliberately excludes crawl/map routes, error handling, and router registration (all handled in Session 05). By keeping scope tight, we establish clean patterns that Session 05 will replicate for the remaining endpoints.

---

## 2. Objectives

1. Create `backend/app/api/routes/tavily.py` with an APIRouter configured with appropriate prefix and tags
2. Implement POST `/search` endpoint that accepts `SearchRequest` and returns `SearchResponse`
3. Implement POST `/extract` endpoint that accepts `ExtractRequest` and returns `ExtractResponse`
4. Ensure both endpoints require authenticated users via `CurrentUser` dependency

---

## 3. Prerequisites

### Required Sessions
- [x] `phase00-session01-dependency-and-configuration` - Tavily SDK installed and configured
- [x] `phase00-session02-service-layer-implementation` - TavilyService class with search() and extract() methods
- [x] `phase00-session03-pydantic-schemas` - Request/response schemas defined

### Required Tools/Knowledge
- FastAPI APIRouter patterns (reference: `backend/app/api/routes/items.py`)
- Dependency injection with Annotated types (reference: `backend/app/api/deps.py`)
- Async/await patterns for route handlers

### Environment Requirements
- Python 3.11+ with virtual environment activated
- Backend dependencies installed (`uv sync` or `pip install -e .`)
- Valid TAVILY_API_KEY in environment (for manual testing)

---

## 4. Scope

### In Scope (MVP)
- Create tavily.py router file with APIRouter
- POST /search endpoint with full parameter mapping
- POST /extract endpoint with single and batch URL support
- CurrentUser dependency on both endpoints (authentication required)
- TavilyDep injection for service access
- Async route handlers calling service methods
- OpenAPI documentation via docstrings and response_model

### Out of Scope (Deferred)
- POST /crawl and POST /map endpoints - *Session 05*
- TavilyAPIError custom exception class - *Session 05*
- Exception handlers for rate limiting, auth errors, timeouts - *Session 05*
- Router registration in api/main.py - *Session 05*
- Unit and integration tests - *Session 06*

---

## 5. Technical Approach

### Architecture

```
Request -> FastAPI Router -> Route Handler -> TavilyService -> Tavily SDK -> Response
              |                   |
              |                   +-- TavilyDep (dependency injection)
              +-- CurrentUser (authentication)
```

The router acts as a thin translation layer:
1. Receive validated Pydantic request
2. Extract parameters from request model
3. Call TavilyService method with parameters
4. Wrap SDK response in Pydantic response model
5. Return response (FastAPI handles serialization)

### Design Patterns
- **Dependency Injection**: Use `TavilyDep` for service access, `CurrentUser` for auth
- **Thin Controllers**: Route handlers only orchestrate; business logic in service
- **Request/Response DTOs**: Pydantic models for validation and serialization

### Technology Stack
- FastAPI 0.115.x - API framework
- Pydantic 2.x - Request/response validation
- Python 3.11+ - Async/await support

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `backend/app/api/routes/tavily.py` | Router with search and extract endpoints | ~70 |

### Files to Modify
*None - Router registration deferred to Session 05*

---

## 7. Success Criteria

### Functional Requirements
- [ ] POST /tavily/search accepts valid SearchRequest body
- [ ] POST /tavily/search returns SearchResponse with results
- [ ] POST /tavily/extract accepts valid ExtractRequest body
- [ ] POST /tavily/extract returns ExtractResponse with results
- [ ] Both endpoints return 401/403 for unauthenticated requests
- [ ] Request validation errors return 422 with field details

### Testing Requirements
- [ ] Manual testing with curl/httpie confirms endpoints work
- [ ] OpenAPI schema at /docs includes both endpoints
- [ ] Schema shows request/response models correctly

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] Code passes `ruff check` with zero errors
- [ ] Code passes `ruff format --check` with zero changes
- [ ] Type hints on all function signatures
- [ ] Docstrings on module and route handlers

---

## 8. Implementation Notes

### Key Considerations

1. **Parameter Mapping**: SearchRequest fields map directly to TavilyService.search() kwargs. Use `model_dump(exclude_unset=True)` or explicit unpacking.

2. **Response Construction**: TavilyService returns `dict[str, Any]`. Use Pydantic model's `model_validate()` to convert SDK response to typed response schema.

3. **Router Prefix**: Use `prefix="/tavily"` on APIRouter. When registered in main.py (Session 05), full path will be `/api/v1/tavily/search`.

4. **Tags**: Use `tags=["tavily"]` for OpenAPI grouping.

### Potential Challenges

- **SDK Response Shape**: Tavily SDK may return fields not in our schema. Response models use `extra="allow"` to handle this gracefully.
- **Async Context**: Ensure route handlers are `async def` since TavilyService methods are async.
- **Authentication Not Used**: CurrentUser is required but user object isn't used in these endpoints. This is intentional - auth is enforced even if user context isn't needed for the operation.

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No smart quotes, em-dashes, or Unicode symbols.

---

## 9. Testing Strategy

### Unit Tests (Session 06)
- Mock TavilyDep to return fixture data
- Test request validation (missing fields, invalid types)
- Test response serialization

### Integration Tests (Session 06)
- Real API calls with valid TAVILY_API_KEY
- Test actual search and extract operations

### Manual Testing (This Session)
1. Start backend server: `cd backend && uv run fastapi dev`
2. Note: Router not registered yet (Session 05), so endpoints won't appear in /docs
3. Can verify file syntax and imports: `python -c "from app.api.routes.tavily import router"`

### Edge Cases
- Empty search query (should fail validation)
- Invalid URL format in extract (should fail validation)
- Empty URL list in extract (should fail validation)
- Very long query string (should respect max_length)

---

## 10. Dependencies

### External Libraries
- `fastapi` >= 0.115.0
- `pydantic` >= 2.0.0
- `tavily-python` >= 0.5.0

### Internal Dependencies
- `app.api.deps.CurrentUser` - Authentication dependency
- `app.api.deps.TavilyDep` - Service injection dependency
- `app.schemas.tavily.*` - Request/response schemas
- `app.services.tavily.TavilyService` - Service layer (via TavilyDep)

### Other Sessions
- **Depends on**: Session 02 (service), Session 03 (schemas)
- **Depended by**: Session 05 (adds crawl/map + error handling + registration)

---

## Reference: Existing Patterns

### Route Pattern (from items.py)
```python
from fastapi import APIRouter
from app.api.deps import CurrentUser, TavilyDep
from app.schemas.tavily import SearchRequest, SearchResponse

router = APIRouter(prefix="/tavily", tags=["tavily"])

@router.post("/search", response_model=SearchResponse)
async def search(
    current_user: CurrentUser,
    tavily: TavilyDep,
    request: SearchRequest,
) -> SearchResponse:
    """Perform a web search using Tavily API."""
    result = await tavily.search(
        query=request.query,
        search_depth=request.search_depth,
        # ... other params
    )
    return SearchResponse.model_validate(result)
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
