# Session Specification

**Session ID**: `phase00-session06-testing-suite`
**Phase**: 00 - Core Setup
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session delivers comprehensive test coverage for the Tavily API integration, completing Phase 00. With all four endpoints (search, extract, crawl, map) implemented along with the service layer, schemas, and error handling, testing is the final step to validate the entire backend before frontend integration.

The testing strategy employs two complementary approaches: unit tests with mocked TavilyService for fast, reliable verification of route logic, and integration tests that call the real Tavily API to ensure end-to-end functionality. This dual approach provides confidence that the implementation works correctly in isolation and in production conditions.

Completing this session satisfies Phase 00 success criteria and unblocks Phase 01 (Frontend Integration). The tests will serve as a regression safety net as the project evolves.

---

## 2. Objectives

1. Create unit tests for all four Tavily endpoints with mocked service responses
2. Verify authentication requirements on all endpoints (401 for unauthenticated)
3. Validate request validation behavior (422 for invalid requests)
4. Test error handling paths (429 rate limit, 401 auth, 504 timeout, 400/500 API errors)
5. Create integration tests with real API calls (marked for conditional execution)

---

## 3. Prerequisites

### Required Sessions
- [x] `phase00-session01-dependency-and-configuration` - Tavily SDK and settings
- [x] `phase00-session02-service-layer-implementation` - TavilyService class
- [x] `phase00-session03-pydantic-schemas` - Request/response schemas
- [x] `phase00-session04-search-and-extract-routes` - Search and extract endpoints
- [x] `phase00-session05-crawl-map-and-error-handling` - Crawl/map endpoints and error handling

### Required Tools/Knowledge
- pytest and pytest-asyncio for async test support
- unittest.mock for mocking TavilyService
- Understanding of existing test patterns in `backend/tests/`
- FastAPI TestClient usage patterns

### Environment Requirements
- Valid Tavily API key in environment (for integration tests)
- Python 3.12+ with test dependencies installed
- Database initialized for authentication tests

---

## 4. Scope

### In Scope (MVP)
- Create `backend/tests/api/routes/test_tavily.py` for unit tests
- Write unit tests for POST `/tavily/search` with mocked responses
- Write unit tests for POST `/tavily/extract` with mocked responses
- Write unit tests for POST `/tavily/crawl` with mocked responses
- Write unit tests for POST `/tavily/map` with mocked responses
- Test 401 response for unauthenticated requests on all endpoints
- Test 422 response for invalid request payloads
- Test error handling: rate limit (429), auth error (401), timeout (504), validation (400)
- Create integration tests with `@pytest.mark.integration` marker
- Add TavilyService mock fixtures to conftest.py or local conftest

### Out of Scope (Deferred)
- Performance testing - *Reason: Not required for MVP validation*
- Load testing - *Reason: Tavily handles rate limiting, not our concern for Phase 00*
- End-to-end browser testing - *Reason: Frontend not yet implemented (Phase 01)*
- Service layer unit tests - *Reason: Route tests implicitly cover service through mocking*

---

## 5. Technical Approach

### Architecture
Tests follow the existing boilerplate pattern using pytest with FastAPI TestClient. Unit tests mock the TavilyService at the dependency injection level using `app.dependency_overrides`. Integration tests use the real service but are conditionally skipped without API key.

```
backend/tests/
  conftest.py              # Existing fixtures (client, token headers)
  api/routes/
    test_tavily.py         # Unit tests for all Tavily endpoints
    test_tavily_integration.py  # Integration tests (optional separate file)
```

### Design Patterns
- **Dependency Override**: Mock TavilyService via FastAPI's dependency_overrides
- **Fixture Composition**: Reuse existing auth fixtures, add Tavily-specific mocks
- **Marker-Based Separation**: `@pytest.mark.integration` for real API tests
- **Factory Pattern**: Mock response factories for consistent test data

### Technology Stack
- pytest >= 8.0
- pytest-asyncio >= 0.23
- unittest.mock (stdlib)
- FastAPI TestClient
- SQLModel Session (for auth setup)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `backend/tests/api/routes/test_tavily.py` | Unit tests for all Tavily endpoints | ~400 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `backend/tests/conftest.py` | Add Tavily mock fixtures (optional) | ~30 |
| `backend/pyproject.toml` | Add integration marker if not present | ~5 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] All unit tests pass with mocked TavilyService
- [ ] Tests cover success path for search, extract, crawl, map endpoints
- [ ] Tests verify 401 response for unauthenticated requests
- [ ] Tests verify 422 response for invalid request schemas
- [ ] Tests verify error status codes: 429, 401, 504, 400, 500
- [ ] Integration tests pass when run with valid API key

### Testing Requirements
- [ ] Unit tests execute in < 30 seconds
- [ ] Test coverage for `app/api/routes/tavily.py` >= 90%
- [ ] No flaky tests (all tests deterministic with mocks)

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] Code follows project conventions (ruff lint passes)
- [ ] No type errors (mypy passes)

---

## 8. Implementation Notes

### Key Considerations
- Use `app.dependency_overrides[get_tavily_service]` pattern for mocking
- Create mock responses matching actual Tavily API response structure
- Test both single URL and batch URL extraction for extract endpoint
- Verify `_handle_tavily_exception` mapping for all error types

### Potential Challenges
- **Async mocking**: TavilyService methods are async; use `AsyncMock` appropriately
- **Dependency injection**: Ensure mock is properly injected via TavilyDep
- **Error simulation**: Create exceptions that trigger correct error code paths
- **Auth fixture reuse**: Leverage existing `superuser_token_headers` fixture

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No smart quotes, em-dashes, or Unicode symbols.

---

## 9. Testing Strategy

### Unit Tests

**Search Endpoint (`POST /tavily/search`)**
- `test_search_success`: Valid request returns SearchResponse
- `test_search_unauthenticated`: Returns 401 without auth header
- `test_search_invalid_query`: Empty query returns 422
- `test_search_invalid_max_results`: Out-of-range max_results returns 422
- `test_search_rate_limit_error`: Rate limit exception returns 429
- `test_search_timeout_error`: Timeout exception returns 504
- `test_search_api_key_error`: Auth exception returns 401

**Extract Endpoint (`POST /tavily/extract`)**
- `test_extract_single_url_success`: Single URL extraction works
- `test_extract_batch_urls_success`: Multiple URL extraction works
- `test_extract_unauthenticated`: Returns 401 without auth header
- `test_extract_invalid_url`: Invalid URL format returns 422
- `test_extract_empty_urls`: Empty URL list returns 422

**Crawl Endpoint (`POST /tavily/crawl`)**
- `test_crawl_success`: Valid request returns CrawlResponse
- `test_crawl_unauthenticated`: Returns 401 without auth header
- `test_crawl_invalid_url`: Invalid URL format returns 422
- `test_crawl_api_error`: Generic API error returns 500

**Map Endpoint (`POST /tavily/map`)**
- `test_map_success`: Valid request returns MapResponse
- `test_map_unauthenticated`: Returns 401 without auth header
- `test_map_invalid_url`: Invalid URL format returns 422

### Integration Tests
- `test_integration_search_real_api`: Real search with simple query
- `test_integration_extract_real_api`: Real extraction of known URL
- Skip when TAVILY_API_KEY not available

### Manual Testing
- Run test suite: `cd backend && pytest tests/api/routes/test_tavily.py -v`
- Run with coverage: `pytest --cov=app/api/routes/tavily tests/api/routes/test_tavily.py`
- Run integration: `pytest -m integration tests/api/routes/test_tavily.py`

### Edge Cases
- Empty query string for search
- Invalid URL schemes (ftp://, mailto:)
- Empty URL list for extract
- Zero max_results value
- Negative depth values for crawl/map
- Extremely long query strings (near 1000 char limit)

---

## 10. Dependencies

### External Libraries
- pytest >= 8.0.0 (existing)
- pytest-asyncio >= 0.23.0 (may need to add)
- FastAPI TestClient (existing)

### Other Sessions
- **Depends on**: Sessions 01-05 (complete implementation)
- **Depended by**: Phase 01 sessions (frontend needs stable backend)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
