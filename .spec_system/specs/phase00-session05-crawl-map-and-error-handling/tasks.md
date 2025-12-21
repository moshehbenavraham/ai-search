# Task Checklist

**Session ID**: `phase00-session05-crawl-map-and-error-handling`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0005]` = Session reference (Phase 00, Session 05)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 9 | 9 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0005] Verify session 04 prerequisites - confirm search/extract routes work (`backend/app/api/routes/tavily.py`)
- [x] T002 [S0005] Verify TavilyService has crawl and map_urls methods available (`backend/app/services/tavily.py`)
- [x] T003 [S0005] Verify CrawlRequest/Response and MapRequest/Response schemas exist (`backend/app/schemas/tavily.py`)

---

## Foundation (6 tasks)

Core structures and base implementations.

- [x] T004 [S0005] Create TavilyErrorCode enum with error code constants (`backend/app/core/exceptions.py`)
- [x] T005 [S0005] Create TavilyAPIError exception class with status_code, error_code, message, details (`backend/app/core/exceptions.py`)
- [x] T006 [S0005] Add exception factory methods for common error types (rate_limit, auth, timeout) (`backend/app/core/exceptions.py`)
- [x] T007 [S0005] Add ErrorResponse Pydantic schema for consistent error format (`backend/app/schemas/tavily.py`)
- [x] T008 [S0005] [P] Import CrawlRequest, CrawlResponse in routes file (`backend/app/api/routes/tavily.py`)
- [x] T009 [S0005] [P] Import MapRequest, MapResponse in routes file (`backend/app/api/routes/tavily.py`)

---

## Implementation (9 tasks)

Main feature implementation.

- [x] T010 [S0005] Implement POST /tavily/crawl endpoint with docstring (`backend/app/api/routes/tavily.py`)
- [x] T011 [S0005] Wire up crawl endpoint to TavilyService.crawl with all parameters (`backend/app/api/routes/tavily.py`)
- [x] T012 [S0005] Implement POST /tavily/map endpoint with docstring (`backend/app/api/routes/tavily.py`)
- [x] T013 [S0005] Wire up map endpoint to TavilyService.map_urls with all parameters (`backend/app/api/routes/tavily.py`)
- [x] T014 [S0005] Add try/except blocks to all four endpoints wrapping SDK calls (`backend/app/api/routes/tavily.py`)
- [x] T015 [S0005] Map SDK exceptions to TavilyAPIError with appropriate error codes (`backend/app/api/routes/tavily.py`)
- [x] T016 [S0005] Create tavily_exception_handler function for TavilyAPIError (`backend/app/main.py`)
- [x] T017 [S0005] Register exception handler on FastAPI app instance (`backend/app/main.py`)
- [x] T018 [S0005] Register tavily router in API router with proper import (`backend/app/api/main.py`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0005] Run ruff check on all modified files and fix issues (`backend/app/`)
- [x] T020 [S0005] Run ruff format on all modified files (`backend/app/`)
- [x] T021 [S0005] Validate ASCII encoding on all created/modified files (no chars > 127)
- [x] T022 [S0005] Start dev server and verify all four endpoints appear in OpenAPI docs

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All ruff checks passing
- [x] All files ASCII-encoded
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T008 and T009 can be done simultaneously (import statements).

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T004-T006 must complete before T014-T015 (exception class needed)
- T007 must complete before T016 (ErrorResponse schema needed)
- T010-T015 must complete before T016-T018 (routes before handler/registration)

### SDK Exception Types
The tavily-python SDK may use these exception patterns:
- `UsageLimitExceeded` -> 429 rate_limit_exceeded
- `InvalidAPIKey` / `AuthenticationError` -> 401 invalid_api_key
- `asyncio.TimeoutError` -> 504 request_timeout
- `ValidationError` -> 400 invalid_request
- Generic Exception -> 500 tavily_api_error

### Key Files
| File | Purpose |
|------|---------|
| `backend/app/core/exceptions.py` | NEW - Exception class and error codes |
| `backend/app/schemas/tavily.py` | ADD - ErrorResponse schema |
| `backend/app/api/routes/tavily.py` | ADD - crawl/map endpoints |
| `backend/app/api/main.py` | ADD - Router registration |
| `backend/app/main.py` | ADD - Exception handler |

---

## Next Steps

Run `/validate` to verify session completeness.
