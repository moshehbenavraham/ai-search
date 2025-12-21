# Task Checklist

**Session ID**: `phase00-session06-testing-suite`
**Total Tasks**: 24
**Estimated Duration**: 8-10 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0006]` = Session reference (Phase 00, Session 06)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 5 | 5 | 0 |
| Implementation | 12 | 12 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **24** | **24** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0006] Verify test dependencies installed (pytest, coverage, etc.)
- [x] T002 [S0006] Add integration marker to pyproject.toml if not present
- [x] T003 [S0006] Create test file skeleton (`backend/tests/api/routes/test_tavily.py`)

---

## Foundation (5 tasks)

Mock fixtures and test utilities.

- [x] T004 [S0006] Create mock TavilyService class with AsyncMock methods
- [x] T005 [S0006] Create mock response factory for SearchResponse
- [x] T006 [S0006] [P] Create mock response factory for ExtractResponse
- [x] T007 [S0006] [P] Create mock response factory for CrawlResponse
- [x] T008 [S0006] [P] Create mock response factory for MapResponse

---

## Implementation (12 tasks)

Unit tests for all Tavily endpoints.

### Search Endpoint Tests

- [x] T009 [S0006] Implement test_search_success - valid request returns SearchResponse
- [x] T010 [S0006] [P] Implement test_search_unauthenticated - returns 401 without auth
- [x] T011 [S0006] [P] Implement test_search_invalid_query - empty query returns 422
- [x] T012 [S0006] Implement test_search_error_handling - rate limit (429), timeout (504), auth (401)

### Extract Endpoint Tests

- [x] T013 [S0006] Implement test_extract_single_url_success - single URL extraction
- [x] T014 [S0006] [P] Implement test_extract_batch_urls_success - multiple URL extraction
- [x] T015 [S0006] [P] Implement test_extract_unauthenticated - returns 401 without auth
- [x] T016 [S0006] Implement test_extract_invalid_request - invalid/empty URLs return 422

### Crawl Endpoint Tests

- [x] T017 [S0006] Implement test_crawl_success - valid request returns CrawlResponse
- [x] T018 [S0006] [P] Implement test_crawl_unauthenticated - returns 401 without auth
- [x] T019 [S0006] Implement test_crawl_error_handling - invalid URL (422), API error (500)

### Map Endpoint Tests

- [x] T020 [S0006] Implement test_map_success_and_errors - success, 401, 422 tests

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T021 [S0006] Run full test suite and verify all tests pass
- [x] T022 [S0006] Run coverage report and verify >= 90% on tavily.py routes
- [x] T023 [S0006] Validate ASCII encoding on all created/modified files
- [x] T024 [S0006] Run linters (ruff, mypy) and fix any issues

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing
- [x] All files ASCII-encoded
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks marked `[P]` can be worked on simultaneously within their group.

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T004-T008 must complete before T009-T020
- T009-T020 can be parallelized within endpoint groups
- T021-T024 must run after all implementation tasks

### Key Patterns

**Mocking Strategy:**
```python
from unittest.mock import AsyncMock, MagicMock
from app.api.deps import get_tavily_service
from app.main import app

mock_service = MagicMock()
mock_service.search = AsyncMock(return_value={...})
app.dependency_overrides[get_tavily_service] = lambda: mock_service
```

**Testing Error Handling:**
```python
# Simulate rate limit exception
mock_service.search = AsyncMock(side_effect=Exception("rate limit exceeded"))
```

**Auth Testing:**
```python
# Test without auth headers
response = client.post("/api/v1/tavily/search", json={...})
assert response.status_code == 401
```

---

## Next Steps

Run `/implement` to begin AI-led implementation.
