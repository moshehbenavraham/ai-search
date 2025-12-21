# Session 06: Testing Suite

**Session ID**: `phase00-session06-testing-suite`
**Status**: Not Started
**Estimated Tasks**: ~25
**Estimated Duration**: 3-4 hours

---

## Objective

Write comprehensive unit tests with mocked Tavily responses and integration tests using real API calls to validate all Tavily endpoints.

---

## Scope

### In Scope (MVP)
- Create backend/app/tests/api/routes/test_tavily.py
- Write unit tests for all four endpoints with mocked TavilyService
- Test authentication requirements (401 for unauthenticated)
- Test request validation (422 for invalid requests)
- Test successful responses for search, extract, crawl, map
- Test error handling (rate limit, timeout, auth errors)
- Create integration tests in separate file/markers
- Use pytest fixtures for authenticated client
- Mock external API calls with unittest.mock or pytest-mock

### Out of Scope
- Performance testing
- Load testing
- End-to-end browser testing (Phase 01)

---

## Prerequisites

- [ ] Session 05 completed (all routes and error handling done)
- [ ] pytest and pytest-asyncio available
- [ ] Valid Tavily API key for integration tests
- [ ] Understanding of existing test patterns

---

## Deliverables

1. Unit tests for POST /tavily/search with mocked responses
2. Unit tests for POST /tavily/extract with mocked responses
3. Unit tests for POST /tavily/crawl with mocked responses
4. Unit tests for POST /tavily/map with mocked responses
5. Tests for authentication requirements on all endpoints
6. Tests for error handling (429, 401, 504, 400 scenarios)
7. Integration tests marked with @pytest.mark.integration
8. Pytest fixtures for authenticated test client
9. Mock fixtures for TavilyService responses

---

## Success Criteria

- [ ] All unit tests pass with mocked responses
- [ ] Unit tests cover success, auth failure, validation failure paths
- [ ] Error handling tests verify correct status codes
- [ ] Integration tests pass with valid API key (when run)
- [ ] Test coverage for tavily routes >= 90%
- [ ] No flaky tests
- [ ] Tests run in < 30 seconds (excluding integration)
- [ ] No lint errors in test files
