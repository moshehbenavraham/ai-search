# Session Specification

**Session ID**: `phase00-session05-crawl-map-and-error-handling`
**Phase**: 00 - Core Setup
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session completes the Tavily backend API layer by adding the final two endpoints (crawl and map), implementing comprehensive error handling, and registering the router to make all endpoints accessible. After this session, the backend will be fully functional with all four Tavily operations (search, extract, crawl, map) available at `/api/v1/tavily/*`.

The error handling implementation ensures consistent, informative error responses across all Tavily endpoints. This includes proper HTTP status code mapping for common failure scenarios (authentication errors, rate limiting, timeouts, validation errors) and a structured error response schema for client consumption.

Router registration is the final piece that connects the Tavily routes to the main FastAPI application. Without this step, the routes exist but are unreachable. This session transforms the isolated route handlers into production-ready API endpoints.

---

## 2. Objectives

1. Add POST `/tavily/crawl` and POST `/tavily/map` endpoints to complete the Tavily API surface
2. Implement TavilyAPIError exception class with proper error categorization
3. Create exception handler that maps errors to appropriate HTTP status codes
4. Register the tavily router in the main API to enable endpoint access

---

## 3. Prerequisites

### Required Sessions
- [x] `phase00-session01-dependency-and-configuration` - Tavily SDK and settings configured
- [x] `phase00-session02-service-layer-implementation` - TavilyService with crawl/map_urls methods
- [x] `phase00-session03-pydantic-schemas` - CrawlRequest/Response, MapRequest/Response defined
- [x] `phase00-session04-search-and-extract-routes` - Router structure and pattern established

### Required Tools/Knowledge
- FastAPI exception handlers (`@app.exception_handler`)
- tavily-python SDK exception types
- HTTP status code semantics (400, 401, 429, 504)

### Environment Requirements
- Backend virtual environment with tavily-python installed
- ruff available for linting/formatting

---

## 4. Scope

### In Scope (MVP)
- POST `/tavily/crawl` endpoint with full CrawlRequest parameter support
- POST `/tavily/map` endpoint with full MapRequest parameter support
- TavilyAPIError custom exception class
- Exception handler for TavilyAPIError with HTTP status mapping
- ErrorResponse schema for consistent error format
- Router registration in `backend/app/api/main.py`
- OpenAPI documentation for new endpoints

### Out of Scope (Deferred)
- Unit/integration tests - *Reason: Session 06 dedicated to testing*
- Frontend integration - *Reason: Phase 01*
- Retry logic for rate-limited requests - *Reason: Complexity, client responsibility*
- Request logging/metrics - *Reason: Infrastructure concern, not MVP*

---

## 5. Technical Approach

### Architecture

```
Request Flow:
  Client --> FastAPI --> tavily.router --> TavilyService --> Tavily API
                |                               |
                v                               v
         Exception Handler <---- TavilyAPIError (on failure)
                |
                v
         ErrorResponse (JSON)
```

### Design Patterns
- **Dependency Injection**: TavilyDep for service access, CurrentUser for auth
- **Exception Mapping**: Convert SDK exceptions to HTTP-appropriate responses
- **Response Model Validation**: Pydantic model_validate for type safety

### Technology Stack
- FastAPI 0.115.x - Web framework
- Pydantic 2.x - Schema validation
- tavily-python 0.5.x - Tavily SDK

### Exception Mapping Strategy

| SDK Exception | HTTP Code | Error Code | Description |
|---------------|-----------|------------|-------------|
| `UsageLimitExceeded` | 429 | `rate_limit_exceeded` | API rate limit hit |
| `InvalidAPIKey` / `AuthenticationError` | 401 | `invalid_api_key` | Bad or missing key |
| `asyncio.TimeoutError` | 504 | `request_timeout` | Operation timed out |
| `ValidationError` | 400 | `invalid_request` | Bad request params |
| Generic Exception | 500 | `tavily_api_error` | Unexpected error |

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `backend/app/core/exceptions.py` | TavilyAPIError class, error codes enum | ~60 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `backend/app/api/routes/tavily.py` | Add crawl, map endpoints; wrap in try/except | +60 |
| `backend/app/schemas/tavily.py` | Add ErrorResponse schema | +20 |
| `backend/app/api/main.py` | Register tavily router | +2 |
| `backend/app/main.py` | Add exception handler | +15 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] POST `/api/v1/tavily/crawl` accepts CrawlRequest and returns CrawlResponse
- [ ] POST `/api/v1/tavily/map` accepts MapRequest and returns MapResponse
- [ ] All four Tavily endpoints appear in OpenAPI docs at `/api/v1/openapi.json`
- [ ] Rate limit errors return 429 with `error_code: rate_limit_exceeded`
- [ ] Authentication errors return 401 with `error_code: invalid_api_key`
- [ ] Timeout errors return 504 with `error_code: request_timeout`
- [ ] Validation errors return 422 (FastAPI default) with field details
- [ ] Unauthenticated requests return 401 (existing auth middleware)

### Quality Gates
- [ ] All files ASCII-encoded (no characters > 127)
- [ ] Unix LF line endings
- [ ] `ruff check` passes with zero errors
- [ ] `ruff format --check` passes with zero changes
- [ ] No type: ignore comments except for untyped SDK imports
- [ ] Docstrings on all public functions/classes

---

## 8. Implementation Notes

### Key Considerations

1. **Service Method Naming**: TavilyService uses `map_urls()` not `map()` to avoid shadowing Python builtin. The route can still be `/map`.

2. **Existing Router Pattern**: Session 04 established the pattern - follow it exactly:
   ```python
   @router.post("/crawl", response_model=CrawlResponse)
   async def crawl(
       _current_user: CurrentUser,
       tavily: TavilyDep,
       request: CrawlRequest,
   ) -> Any:
   ```

3. **Exception Handler Registration**: Must be added to `app/main.py` (the FastAPI app instance), not `api/main.py` (the router).

4. **Error Response Consistency**: Use the same ErrorResponse schema for all Tavily errors to simplify client handling.

### Potential Challenges

- **SDK Exception Discovery**: tavily-python may not export exception classes clearly. Use try/except with broad catches initially, refine based on observed exceptions.
- **Timeout Configuration**: Crawl operations can take up to 150s. Ensure the exception handler distinguishes Tavily timeouts from other timeouts.

### Reference Implementations

**Crawl Endpoint Pattern:**
```python
@router.post("/crawl", response_model=CrawlResponse)
async def crawl(
    _current_user: CurrentUser,
    tavily: TavilyDep,
    request: CrawlRequest,
) -> Any:
    """Crawl a website starting from a given URL."""
    result = await tavily.crawl(
        url=request.url,
        max_depth=request.max_depth,
        max_breadth=request.max_breadth,
        limit=request.limit,
        instructions=request.instructions,
        select_paths=request.select_paths,
        select_domains=request.select_domains,
    )
    return CrawlResponse.model_validate(result)
```

**Exception Handler Pattern:**
```python
@app.exception_handler(TavilyAPIError)
async def tavily_exception_handler(
    request: Request,
    exc: TavilyAPIError,
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
        ).model_dump(),
    )
```

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Use standard quotes (`"`, `'`), standard dashes (`-`), and avoid Unicode symbols.

---

## 9. Testing Strategy

### Manual Testing (Post-Implementation)

1. **Endpoint Accessibility**:
   - Start server: `uv run fastapi dev app/main.py`
   - Visit: `http://localhost:8000/api/v1/openapi.json`
   - Verify all four Tavily endpoints listed

2. **Crawl Endpoint**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/tavily/crawl \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com", "max_depth": 0, "limit": 5}'
   ```

3. **Map Endpoint**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/tavily/map \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com", "limit": 10}'
   ```

4. **Error Handling**:
   - Remove TAVILY_API_KEY, expect 401
   - Send invalid request body, expect 422

### Deferred to Session 06
- Unit tests with mocked TavilyService
- Integration tests with real Tavily API
- Error scenario coverage tests

---

## 10. Dependencies

### External Libraries
- `fastapi>=0.115.0` - Web framework (existing)
- `tavily-python>=0.5.0` - Tavily SDK (existing)
- `pydantic>=2.0` - Schema validation (existing)

### Session Dependencies
- **Depends on**: Sessions 01-04 (all prerequisites complete)
- **Depended by**: Session 06 (testing requires all routes)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
