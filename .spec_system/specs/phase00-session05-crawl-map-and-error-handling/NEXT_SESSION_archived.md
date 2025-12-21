# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-21
**Project State**: Phase 00 - Core Setup
**Completed Sessions**: 3 of 6

---

## Current Session Status

**Session 04** (`phase00-session04-search-and-extract-routes`) appears **implementation-complete** but has not been validated:

| Check | Status |
|-------|--------|
| File created | `backend/app/api/routes/tavily.py` (82 lines) |
| ruff check | Passed |
| ruff format | Passed |
| Formal validation | **Not run** |

**Action Required**: Run `/validate` to formally complete Session 04 before proceeding.

---

## Recommended Next Session

**Session ID**: `phase00-session05-crawl-map-and-error-handling`
**Session Name**: Crawl, Map, and Error Handling
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~20

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 completed (Tavily SDK configured)
- [x] Session 02 completed (TavilyService available)
- [x] Session 03 completed (All Pydantic schemas defined)
- [x] Session 04 completed* (Search/Extract routes implemented)

*Session 04 implementation complete, pending formal validation

### Dependencies
- **Builds on**: Session 04 (extends tavily.py with crawl/map routes)
- **Enables**: Session 06 (testing suite requires all routes)

### Project Progression
Session 05 completes the backend API layer by:
1. Adding the remaining two Tavily endpoints (crawl, map)
2. Implementing comprehensive error handling for all routes
3. Registering the router in the main API (making endpoints accessible)

Without Session 05, the Tavily routes exist but are not accessible via `/api/v1/tavily`.

---

## Session Overview

### Objective
Complete the API routes for crawl and map operations, implement comprehensive error handling for all Tavily endpoints, and register the router in the main API.

### Key Deliverables
1. POST `/tavily/crawl` endpoint with depth, breadth, and instruction support
2. POST `/tavily/map` endpoint for sitemap generation
3. `TavilyAPIError` custom exception class
4. Exception handler with proper HTTP status mapping (401, 429, 504, 400)
5. Router registration in `backend/app/api/main.py`
6. Structured error response schema

### Scope Summary
- **In Scope (MVP)**: Crawl route, map route, error handling, router registration
- **Out of Scope**: Testing (Session 06), Frontend (Phase 01)

---

## Technical Considerations

### Technologies/Patterns
- FastAPI exception handlers for centralized error handling
- tavily-python SDK exception types
- HTTP status code mapping (401/429/504/400)
- APIRouter registration with prefix

### Potential Challenges
- **SDK Exception Types**: Need to identify all tavily-python exception classes
- **Error Response Schema**: Must be consistent with existing API patterns
- **Timeout Handling**: Crawl operations may have long timeouts (up to 150s)

### Files to Create/Modify
| File | Action |
|------|--------|
| `backend/app/api/routes/tavily.py` | Add crawl, map routes |
| `backend/app/schemas/tavily.py` | Add ErrorResponse schema |
| `backend/app/core/exceptions.py` | Create TavilyAPIError class |
| `backend/app/api/main.py` | Register tavily router |

---

## Alternative Sessions

If this session is blocked:

1. **Session 06 (Testing Suite)** - Could write tests for existing search/extract routes while crawl/map are blocked
2. **Phase 01 (Frontend)** - Could begin frontend scaffolding, though backend APIs incomplete

**Note**: Neither alternative is recommended as Session 05 has no blockers.

---

## Next Steps

1. Run `/validate` to formally complete Session 04
2. Run `/sessionspec` to generate the formal specification for Session 05
3. Run `/tasks` to generate the task checklist
4. Run `/implement` to begin AI-led implementation
