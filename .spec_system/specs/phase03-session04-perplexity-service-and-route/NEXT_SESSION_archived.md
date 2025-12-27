# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-27
**Project State**: Phase 03 - Deep Research Backend
**Completed Sessions**: 18

---

## Recommended Next Session

**Session ID**: `phase03-session04-perplexity-service-and-route`
**Session Name**: Perplexity Service and Route
**Estimated Duration**: 2-4 hours
**Estimated Tasks**: ~25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 complete (Configuration and Environment - PerplexitySettings)
- [x] Session 02 complete (Perplexity Schemas and Exceptions)
- [x] Understanding of existing service pattern (TavilyService available as reference)
- [x] Understanding of existing route patterns in backend/app/api/routes/

### Dependencies
- **Builds on**: phase03-session02-perplexity-schemas-and-exceptions (schemas, request/response types, exception classes)
- **Enables**: phase03-session05-gemini-service-implementation (establishes service patterns for Gemini)

### Project Progression
This session takes the configuration and schemas from Sessions 01-02 and implements the actual service layer and API route for Perplexity deep research. It's the natural next step in the Phase 03 flow:

1. Configuration (Session 01) - Provides PerplexitySettings with API key and defaults
2. Schemas (Session 02) - Provides request/response types and exception classes
3. **Service & Route (Session 04)** - Connects schemas to API with HTTP client implementation
4. Gemini Service (Session 05) - Follows same pattern for Gemini API
5. Gemini Routes (Session 06) - Completes backend integration

---

## Session Overview

### Objective
Implement PerplexityService class and FastAPI route for executing deep research queries with proper error handling.

### Key Deliverables
1. `backend/app/services/perplexity.py` - PerplexityService class with async HTTP client
2. Updated `backend/app/api/deps.py` - PerplexityDep dependency injection
3. `backend/app/api/routes/perplexity.py` - POST /api/v1/perplexity/deep-research endpoint
4. Updated `backend/app/main.py` - perplexity_exception_handler
5. Updated `backend/app/api/main.py` - Router registration

### Scope Summary
- **In Scope (MVP)**: PerplexityService with deep_research() method, Bearer auth, request payload mapping, response parsing, error handling, FastAPI route with JWT auth, exception handler
- **Out of Scope**: Gemini service (Session 05), Gemini routes (Session 06), integration tests, streaming support

---

## Technical Considerations

### Technologies/Patterns
- httpx AsyncClient for HTTP requests
- Bearer token authentication (Authorization: Bearer {api_key})
- Perplexity API endpoint: POST https://api.perplexity.ai/chat/completions
- Model: sonar-deep-research
- web_search_options nesting for search parameters
- FastAPI dependency injection pattern (matching TavilyDep)

### Potential Challenges
- Properly mapping flat request fields to nested web_search_options structure
- Handling the 300-second timeout for deep research queries
- Converting HTTP error codes to appropriate PerplexityAPIError subtypes (rate_limit_exceeded, invalid_api_key, etc.)
- Parsing response content from choices[0].message.content path

### Relevant Considerations
No CONSIDERATIONS.md file found - this is the first session of new Phase 03 implementation after schema work.

---

## Alternative Sessions

If this session is blocked:
1. **phase03-session05-gemini-service-implementation** - Could implement Gemini service first if Perplexity API access is unavailable, though Session 04 patterns inform Session 05
2. **Phase 04 planning** - Could begin frontend phase planning while backend issues are resolved

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
