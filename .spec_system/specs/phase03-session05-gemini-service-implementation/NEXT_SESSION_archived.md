# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-27
**Project State**: Phase 03 - Deep Research Backend
**Completed Sessions**: 19

---

## Recommended Next Session

**Session ID**: `phase03-session05-gemini-service-implementation`
**Session Name**: Gemini Service Implementation
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~20

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 complete (configuration with GeminiSettings)
- [x] Session 03 complete (Gemini schemas and exceptions)
- [x] Understanding of Gemini async polling workflow (documented in PRD)
- [x] Review of existing service patterns (PerplexityService completed in Session 04)

### Dependencies
- **Builds on**: Session 03 (Gemini schemas and exceptions) and Session 01 (GeminiSettings config)
- **Enables**: Session 06 (Gemini routes and integration)

### Project Progression
This is the logical next step because:
1. **Sequential dependency**: Session 06 (routes) requires the service layer to be implemented first
2. **Pattern consistency**: Follows the same service-then-routes pattern used for Perplexity (Session 04 service, then routes in same session)
3. **Parallel structure**: Mirrors the Perplexity implementation - now completing the Gemini side
4. **Phase completion path**: Only 2 sessions remain in Phase 03; completing this enables the final integration session

---

## Session Overview

### Objective
Implement GeminiService class with full async research workflow support including start, poll, wait, and cancel operations.

### Key Deliverables
1. `backend/app/services/gemini.py` with GeminiService class
2. Updated `backend/app/api/deps.py` with get_gemini_service() and GeminiDep

### Scope Summary
- **In Scope (MVP)**:
  - GeminiService class with BASE_URL, _build_headers(), _build_payload(), _handle_error()
  - start_research() - POST to /interactions with background=True, store=True
  - poll_research() - GET /interactions/{id} with optional last_event_id for reconnection
  - wait_for_completion() - Loop polling until completion or max attempts
  - cancel_research() - DELETE /interactions/{id}
  - Dependency injection setup in deps.py

- **Out of Scope**:
  - Route definitions (Session 06)
  - Exception handler integration (Session 06)
  - Integration tests

---

## Technical Considerations

### Technologies/Patterns
- httpx async client (consistent with PerplexityService)
- Gemini API v1beta interactions endpoint
- x-goog-api-key header authentication
- Agent config: type="deep-research", agent="deep-research-pro-preview-12-2025"
- Polling pattern with configurable interval and max attempts

### Potential Challenges
- Handling long-running research (up to 60 minutes, typical ~20 min)
- Reconnection support via last_event_id parameter
- Proper status handling (completed, failed, cancelled)
- Rate limit and timeout error handling

### Key Implementation Details
- POST /interactions with: `background=True`, `store=True`, `agent_config.type="deep-research"`
- Poll interval configurable (default 10s from GeminiSettings)
- Max poll attempts configurable (default 360 from GeminiSettings)
- Support last_event_id query param for network interruption recovery

---

## Alternative Sessions

If this session is blocked:
1. **Session 06** - Cannot proceed (depends on Session 05)
2. **Phase 04 setup** - Could begin frontend scaffolding, but backend should complete first

Note: No alternative sessions are recommended. Session 05 has all prerequisites met and should proceed.

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
