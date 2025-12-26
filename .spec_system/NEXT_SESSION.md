# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-26
**Project State**: Phase 02 Complete - Ready for Phase 03
**Completed Sessions**: 15

---

## Recommended Next Phase

**Phase**: 03 - Deep Research Backend
**Status**: Not Started (requires scaffolding)
**Estimated Sessions**: 4-6 sessions

---

## Why Phase 03 Next?

### Prerequisites Met
- [x] Phase 00 Complete - Core Tavily SDK integration
- [x] Phase 01 Complete - Frontend Integration with all Tavily features
- [x] Phase 02 Complete - Saving Results to Items with extended model

### Dependencies
- **Builds on**: Existing FastAPI patterns from Tavily integration
- **Enables**: Phase 04 (Deep Research Frontend)

### Project Progression
Phase 03 adds two new AI research APIs (Perplexity Sonar Deep Research and Google Gemini Deep Research) to the backend. This follows the natural progression of:
1. Core Tavily features (Phases 00-02) - COMPLETE
2. Deep research capabilities (Phases 03-04) - NEXT

The backend must be implemented before the frontend can consume these new APIs.

---

## Phase 03 Overview

### Objectives
1. Add configuration settings for Perplexity and Gemini APIs
2. Create Pydantic schemas for all request/response types
3. Implement custom exception classes with factory methods
4. Build service classes for both APIs (sync and async patterns)
5. Create FastAPI routes with proper authentication
6. Add exception handlers to main application

### Key Deliverables
1. **PerplexitySettings & GeminiSettings** - Environment configuration
2. **Pydantic schemas** - Request/response models for both APIs
3. **Exception classes** - PerplexityAPIError and GeminiAPIError with factory methods
4. **PerplexityService** - Synchronous deep research with Bearer auth
5. **GeminiService** - Async polling pattern with start/poll/wait/cancel
6. **API Routes** - Authenticated endpoints for both services

### Scope Summary
- **In Scope (MVP)**:
  - Perplexity synchronous deep research
  - Gemini async with polling pattern
  - Exception handling and structured errors
  - JWT-protected endpoints
- **Out of Scope**:
  - Perplexity streaming
  - Gemini file search integration
  - Follow-up questions with previous_interaction_id

---

## Technical Considerations

### Technologies/Patterns
- httpx async client for both APIs
- Bearer token auth (Perplexity)
- API key header auth (Gemini)
- Polling pattern with configurable intervals (Gemini)
- Factory method pattern for exceptions

### API Endpoints to Implement
| Service | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Perplexity | /api/v1/perplexity/deep-research | POST | Execute synchronous research |
| Gemini | /api/v1/gemini/deep-research | POST | Start async research job |
| Gemini | /api/v1/gemini/deep-research/{id} | GET | Poll status |
| Gemini | /api/v1/gemini/deep-research/{id} | DELETE | Cancel research |
| Gemini | /api/v1/gemini/deep-research/sync | POST | Blocking wait for completion |

### Potential Challenges
- Perplexity 300s timeout for deep research queries
- Gemini polling can take up to 60 minutes
- Network interruption recovery (last_event_id for Gemini)
- Complex request payload mapping for Perplexity web_search_options

---

## Action Required

Phase 03 session stubs do not exist yet. Run `/phasebuild` to:
1. Create `.spec_system/PRD/phase_03/` directory
2. Generate session stub files
3. Update state.json with Phase 03 metadata

---

## Next Steps

1. Run `/phasebuild` to scaffold Phase 03 sessions
2. Review generated session stubs
3. Run `/nextsession` again to get specific session recommendation
4. Run `/sessionspec` to generate formal specification
