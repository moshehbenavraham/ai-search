# Session 05: Crawl, Map, and Error Handling

**Session ID**: `phase00-session05-crawl-map-and-error-handling`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Complete the API routes for crawl and map operations, implement comprehensive error handling for all Tavily endpoints, and register the router in the main API.

---

## Scope

### In Scope (MVP)
- Implement POST /tavily/crawl endpoint
- Implement POST /tavily/map endpoint
- Create TavilyAPIError custom exception class
- Create exception handler for TavilyAPIError
- Handle SDK-specific exceptions (rate limit, auth, timeout)
- Map exceptions to proper HTTP status codes (400, 401, 429, 504)
- Create structured error response schema
- Register tavily router in backend/app/api/main.py
- Add /tavily prefix and tags

### Out of Scope
- Testing (Session 06)
- Frontend integration (Phase 01)

---

## Prerequisites

- [ ] Session 04 completed (search/extract routes exist)
- [ ] Understanding of FastAPI exception handlers
- [ ] tavily-python exception types documented

---

## Deliverables

1. POST /crawl endpoint accepting CrawlRequest, returning CrawlResponse
2. POST /map endpoint accepting MapRequest, returning MapResponse
3. TavilyAPIError exception class with error_code, message, details
4. Exception handler registered in app for TavilyAPIError
5. Proper HTTP status mapping: 401 (auth), 429 (rate limit), 504 (timeout), 400 (validation)
6. Router registered at /api/v1/tavily in main API
7. Error response schema for consistent error format

---

## Success Criteria

- [ ] POST /tavily/crawl and POST /tavily/map endpoints functional
- [ ] All Tavily endpoints accessible under /api/v1/tavily prefix
- [ ] Rate limit errors return 429 with retry guidance
- [ ] Authentication errors return 401
- [ ] Timeout errors return 504
- [ ] Validation errors return 400 with details
- [ ] Error responses follow consistent schema
- [ ] All endpoints appear in OpenAPI documentation
- [ ] No lint errors or type check failures
