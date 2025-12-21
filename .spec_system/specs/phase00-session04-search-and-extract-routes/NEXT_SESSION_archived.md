# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-21
**Project State**: Phase 00 - Core Setup
**Completed Sessions**: 3

---

## Recommended Next Session

**Session ID**: `phase00-session04-search-and-extract-routes`
**Session Name**: Search and Extract Routes
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~20

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 02 completed - TavilyService class available with search() and extract() methods
- [x] Session 03 completed - Pydantic schemas defined (SearchRequest, SearchResponse, ExtractRequest, ExtractResponse)
- [x] Existing authentication patterns understood (CurrentUser dependency)

### Dependencies
- **Builds on**: Session 02 (service layer) + Session 03 (schemas)
- **Enables**: Session 05 (crawl/map routes and error handling)

### Project Progression
This session is the natural next step in the implementation flow. With the service layer and schemas complete, we now need to expose the Tavily functionality via API routes. This session creates the router structure and implements the two core endpoints (search and extract), establishing patterns that Session 05 will follow for crawl and map.

---

## Session Overview

### Objective
Create the API route handlers for Tavily search and extract operations, wiring together the service layer and Pydantic schemas with proper authentication.

### Key Deliverables
1. `backend/app/api/routes/tavily.py` with APIRouter
2. POST `/search` endpoint accepting SearchRequest, returning SearchResponse
3. POST `/extract` endpoint accepting ExtractRequest, returning ExtractResponse
4. Both endpoints requiring authenticated user (CurrentUser dependency)
5. OpenAPI metadata for endpoint documentation

### Scope Summary
- **In Scope (MVP)**: Router creation, search endpoint, extract endpoint, authentication, request/response mapping, OpenAPI docs
- **Out of Scope**: Crawl and map routes (Session 05), comprehensive error handling (Session 05), router registration (Session 05), testing (Session 06)

---

## Technical Considerations

### Technologies/Patterns
- FastAPI APIRouter with tags and prefix
- CurrentUser dependency for JWT authentication
- TavilyDep dependency injection for service access
- Async endpoint handlers
- Pydantic model validation (automatic via type hints)

### Potential Challenges
- Ensuring proper async/await patterns with the TavilyService
- Mapping between SDK responses and Pydantic response schemas
- Consistent OpenAPI documentation format
- Handling the authenticated user context (even if not used in this session)

---

## Alternative Sessions

If this session is blocked:
1. **phase00-session06-testing-suite** - Could write test stubs and fixtures in preparation, but tests would fail without routes
2. **Phase 01 planning** - Could begin defining Phase 01 sessions, but Phase 00 should complete first

Note: Sessions 05 and 06 have hard dependencies on Session 04 and cannot proceed.

---

## Next Steps

Run `/sessionspec` to generate the formal specification with detailed task breakdown.
