# Session Specification

**Session ID**: `phase03-session04-perplexity-service-and-route`
**Phase**: 03 - Deep Research Backend
**Status**: Not Started
**Created**: 2025-12-27

---

## 1. Session Overview

This session implements the PerplexityService class and FastAPI route for executing deep research queries against the Perplexity Sonar API. Building on the configuration (Session 01) and schema/exception definitions (Session 02), this session creates the core integration layer that connects our backend to Perplexity's powerful deep research capabilities.

The PerplexityService will use httpx AsyncClient for HTTP requests with Bearer token authentication, properly map request parameters to the Perplexity API format (including nested web_search_options), and handle the 300-second timeout required for deep research queries. The service follows the established TavilyService pattern for consistency across the codebase.

The FastAPI route will expose the deep research functionality at `/api/v1/perplexity/deep-research`, requiring JWT authentication and returning structured responses with proper error handling via the PerplexityAPIError exception handler registered in main.py.

---

## 2. Objectives

1. Implement PerplexityService class with async deep_research() method that calls the Perplexity Sonar API
2. Create FastAPI POST endpoint at /api/v1/perplexity/deep-research with JWT authentication
3. Add PerplexityDep dependency injection to deps.py following TavilyDep pattern
4. Register perplexity_exception_handler and perplexity router for structured error responses

---

## 3. Prerequisites

### Required Sessions
- [x] `phase03-session01-configuration-and-environment` - Provides PerplexitySettings with api_key, timeout, default_model
- [x] `phase03-session02-perplexity-schemas-and-exceptions` - Provides request/response schemas and PerplexityAPIError

### Required Tools/Knowledge
- httpx AsyncClient for async HTTP requests
- Bearer token authentication pattern
- Perplexity API documentation (POST https://api.perplexity.ai/chat/completions)
- FastAPI dependency injection and router patterns

### Environment Requirements
- PERPLEXITY_API_KEY environment variable configured (optional for build, required for runtime)
- Python 3.11+ with httpx installed

---

## 4. Scope

### In Scope (MVP)
- PerplexityService class with BASE_URL constant
- _build_headers() method for Bearer token authentication
- _build_payload() method mapping request fields to API format with web_search_options nesting
- _parse_response() method extracting content from API response
- _handle_error() method converting HTTP errors to PerplexityAPIError subtypes
- async deep_research(request: PerplexityDeepResearchRequest) public method
- get_perplexity_service() factory function in deps.py
- PerplexityDep type alias in deps.py
- POST /api/v1/perplexity/deep-research route with CurrentUser authentication
- perplexity_exception_handler in main.py
- Router registration in api/main.py

### Out of Scope (Deferred)
- Gemini service implementation - *Reason: Session 05 scope*
- Gemini routes - *Reason: Session 06 scope*
- Integration tests - *Reason: Can be added in future testing session*
- Streaming response support - *Reason: MVP uses non-streaming responses*
- Response caching - *Reason: Deep research results are unique per query*

---

## 5. Technical Approach

### Architecture
The PerplexityService follows the service layer pattern established by TavilyService, encapsulating all Perplexity API interactions. Unlike TavilyService which uses an SDK, PerplexityService uses raw httpx calls since no official Perplexity Python SDK exists. The service reads configuration from settings.perplexity and converts our schema types to the Perplexity API format.

```
Request Flow:
Frontend -> FastAPI Route -> PerplexityService -> Perplexity API
                |                   |
           CurrentUser         _build_headers()
           PerplexityDep       _build_payload()
                                _parse_response()
                                _handle_error()
```

### Design Patterns
- **Service Layer**: Encapsulates external API calls, isolating route handlers from HTTP details
- **Factory Pattern**: get_perplexity_service() creates service instances for dependency injection
- **Typed Dependency**: PerplexityDep = Annotated[PerplexityService, Depends(...)]
- **Exception Mapping**: HTTP error codes mapped to domain-specific PerplexityAPIError subtypes

### Technology Stack
- httpx 0.27+ - Async HTTP client with timeout support
- FastAPI 0.109+ - Route handlers with dependency injection
- Pydantic 2.x - Request/response validation via schemas from Session 02

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `backend/app/services/perplexity.py` | PerplexityService class with deep_research() method | ~150 |
| `backend/app/api/routes/perplexity.py` | POST /deep-research endpoint with auth | ~60 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `backend/app/api/deps.py` | Add get_perplexity_service() and PerplexityDep | ~10 |
| `backend/app/main.py` | Add perplexity_exception_handler | ~15 |
| `backend/app/api/main.py` | Import and register perplexity router | ~3 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] PerplexityService instantiates with settings from config
- [ ] deep_research() makes POST request to https://api.perplexity.ai/chat/completions
- [ ] Headers include Authorization: Bearer {api_key}
- [ ] Request payload properly formatted with messages array and web_search_options nested
- [ ] Response parsed and returned as PerplexityDeepResearchResponse
- [ ] HTTP 429 converted to PerplexityAPIError.rate_limit_exceeded()
- [ ] HTTP 401 converted to PerplexityAPIError.invalid_api_key()
- [ ] Timeout errors converted to PerplexityAPIError.request_timeout()
- [ ] Route requires JWT authentication via CurrentUser
- [ ] Endpoint accessible at /api/v1/perplexity/deep-research

### Testing Requirements
- [ ] Manual testing with valid API key confirms response parsing
- [ ] Manual testing with invalid key confirms 401 error mapping
- [ ] Code compiles with no type errors

### Quality Gates
- [ ] All files ASCII-encoded
- [ ] Unix LF line endings
- [ ] Code follows CONVENTIONS.md patterns
- [ ] No ruff lint warnings
- [ ] No mypy type errors
- [ ] Docstrings on all public functions and classes

---

## 8. Implementation Notes

### Key Considerations
- Perplexity API uses Bearer token auth, not API key header like Tavily
- Request must wrap query in messages array: [{"role": "user", "content": query}]
- Search parameters (search_mode, recency_filter, domain_filter, date filters) nest under web_search_options
- Response content is at choices[0].message.content path
- 300-second timeout configured in PerplexitySettings for deep research

### Potential Challenges
- **Payload Mapping**: Flat request schema fields must be restructured into nested API format
  - *Mitigation*: _build_payload() method handles all nesting logic
- **Long Timeouts**: 300s timeout may cause connection pool issues
  - *Mitigation*: Create new AsyncClient per request or configure pool timeouts
- **Error Response Parsing**: Perplexity error format may vary
  - *Mitigation*: _handle_error() checks status code first, then parses body if available

### ASCII Reminder
All output files must use ASCII-only characters (0-127).

---

## 9. Testing Strategy

### Unit Tests
- PerplexityService._build_headers() returns correct Authorization header
- PerplexityService._build_payload() correctly nests web_search_options
- PerplexityService._handle_error() maps status codes to correct exception types

### Integration Tests
- (Deferred) Full request/response cycle with mocked httpx responses

### Manual Testing
- Execute deep research query with valid API key and verify response structure
- Test with invalid API key to verify 401 handling
- Test error scenarios by simulating network issues

### Edge Cases
- Empty query string (should be caught by schema validation)
- Missing API key (should raise PerplexityAPIError.invalid_api_key at service init)
- Malformed API response (should raise PerplexityAPIError.api_error)
- Timeout after 300s (should raise PerplexityAPIError.request_timeout)

---

## 10. Dependencies

### External Libraries
- httpx: 0.27+ (already in requirements.txt)
- fastapi: 0.109+ (already in requirements.txt)
- pydantic: 2.x (already in requirements.txt)

### Other Sessions
- **Depends on**: phase03-session01 (PerplexitySettings), phase03-session02 (schemas, exceptions)
- **Depended by**: phase03-session05 (establishes service pattern for Gemini)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
