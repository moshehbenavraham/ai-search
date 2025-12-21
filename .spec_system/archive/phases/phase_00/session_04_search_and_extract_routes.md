# Session 04: Search and Extract Routes

**Session ID**: `phase00-session04-search-and-extract-routes`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Create the API route handlers for Tavily search and extract operations, wiring together the service layer and Pydantic schemas with proper authentication.

---

## Scope

### In Scope (MVP)
- Create backend/app/api/routes/tavily.py router
- Implement POST /tavily/search endpoint
- Implement POST /tavily/extract endpoint
- Add CurrentUser dependency for authentication
- Wire TavilyService via TavilyDep injection
- Map request schemas to service method calls
- Return response schemas with proper status codes
- Add OpenAPI documentation (summary, description, tags)
- Basic error handling (let exceptions propagate for now)

### Out of Scope
- Crawl and map routes (Session 05)
- Comprehensive error handling (Session 05)
- Router registration in api/main.py (Session 05)
- Testing (Session 06)

---

## Prerequisites

- [ ] Session 02 completed (TavilyService available)
- [ ] Session 03 completed (schemas defined)
- [ ] Existing authentication patterns understood

---

## Deliverables

1. backend/app/api/routes/tavily.py with APIRouter
2. POST /search endpoint accepting SearchRequest, returning SearchResponse
3. POST /extract endpoint accepting ExtractRequest, returning ExtractResponse
4. Both endpoints requiring authenticated user (CurrentUser dependency)
5. OpenAPI metadata for endpoint documentation

---

## Success Criteria

- [ ] POST /tavily/search accepts valid SearchRequest and returns SearchResponse
- [ ] POST /tavily/extract accepts valid ExtractRequest and returns ExtractResponse
- [ ] Endpoints reject unauthenticated requests with 401
- [ ] Request validation errors return 422 with details
- [ ] OpenAPI spec includes both endpoints with schemas
- [ ] No lint errors or type check failures
