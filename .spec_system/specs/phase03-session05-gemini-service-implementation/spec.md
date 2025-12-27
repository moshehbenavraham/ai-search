# Session Specification

**Session ID**: `phase03-session05-gemini-service-implementation`
**Phase**: 03 - Deep Research Backend
**Status**: Not Started
**Created**: 2025-12-27

---

## 1. Session Overview

This session implements the GeminiService class for the Google Gemini Deep Research API integration. Unlike the synchronous Perplexity API, Gemini uses an asynchronous polling workflow where clients submit a research job, receive an interaction ID, and then poll for status updates until completion. Research jobs can run for extended periods (typically 20 minutes, up to 60 minutes).

The service layer encapsulates all HTTP communication with the Gemini API v1beta interactions endpoint, handling authentication via x-goog-api-key headers, request payload construction with agent configuration, and error mapping to typed exceptions. This follows the established service pattern from PerplexityService but adds polling-specific methods for the async workflow.

Upon completion, the service will be ready for route integration in Session 06, enabling the frontend to initiate and monitor deep research tasks through the backend API.

---

## 2. Objectives

1. Implement GeminiService class with all core methods (start_research, poll_research, wait_for_completion, cancel_research)
2. Establish proper error handling with mapping from HTTP errors to GeminiAPIError subtypes
3. Configure dependency injection in deps.py with get_gemini_service() factory and GeminiDep type alias
4. Support network interruption recovery via last_event_id parameter in polling

---

## 3. Prerequisites

### Required Sessions
- [x] `phase03-session01-configuration-and-environment` - Provides GeminiSettings configuration
- [x] `phase03-session03-gemini-schemas-and-exceptions` - Provides request/response schemas and error classes

### Required Tools/Knowledge
- Understanding of Gemini async polling workflow (background jobs, interaction IDs)
- Familiarity with httpx AsyncClient patterns (consistent with PerplexityService)
- Knowledge of Gemini API v1beta interactions endpoint structure

### Environment Requirements
- GEMINI_API_KEY environment variable (optional for development, required for runtime)
- Python 3.11+ with httpx installed

---

## 4. Scope

### In Scope (MVP)
- GeminiService class with BASE_URL constant for v1beta API
- _build_headers() method for x-goog-api-key authentication
- _build_payload() method creating interaction request with agent_config
- _handle_error() method converting HTTP status codes to GeminiAPIError
- start_research() - POST /interactions with background=True, store=True
- poll_research() - GET /interactions/{id} with optional last_event_id query param
- wait_for_completion() - Polling loop until terminal status or max attempts
- cancel_research() - DELETE /interactions/{id}
- Dependency injection setup with get_gemini_service() and GeminiDep

### Out of Scope (Deferred)
- Route definitions - *Reason: Session 06 scope*
- Exception handler registration in main.py - *Reason: Session 06 scope*
- Integration tests - *Reason: Separate testing session*
- Streaming/SSE support - *Reason: MVP uses polling pattern*

---

## 5. Technical Approach

### Architecture
The service follows the repository/service pattern established by PerplexityService:
- Configuration injected from settings.gemini (GeminiSettings)
- All methods are async using httpx.AsyncClient
- Private helper methods for headers, payload construction, and error handling
- Public methods return typed Pydantic response schemas

### Design Patterns
- **Factory Pattern**: get_gemini_service() creates configured instances
- **Async Context Manager**: httpx.AsyncClient for HTTP connections
- **Polling Pattern**: wait_for_completion() loops with configurable interval
- **Error Mapping**: HTTP status codes mapped to typed exception classes

### Technology Stack
- Python 3.11+ with async/await
- httpx for async HTTP client
- Pydantic v2 for schema validation
- FastAPI dependency injection

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `backend/app/services/gemini.py` | GeminiService class with all methods | ~250 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `backend/app/api/deps.py` | Add get_gemini_service() and GeminiDep | ~15 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] GeminiService instantiates with settings from config
- [ ] start_research() creates background job and returns interaction_id
- [ ] poll_research() retrieves current status and outputs
- [ ] poll_research() supports last_event_id for reconnection after network issues
- [ ] wait_for_completion() polls until terminal status reached (completed, failed, cancelled)
- [ ] wait_for_completion() respects configurable poll_interval and max_attempts
- [ ] wait_for_completion() raises GeminiAPIError.max_polls_exceeded when limit hit
- [ ] cancel_research() successfully terminates running jobs
- [ ] All HTTP errors properly converted to GeminiAPIError subtypes

### Testing Requirements
- [ ] Manual testing of service instantiation
- [ ] Code review for pattern consistency with PerplexityService

### Quality Gates
- [ ] All files ASCII-encoded
- [ ] Unix LF line endings
- [ ] No type errors from mypy
- [ ] No lint warnings from ruff
- [ ] Code follows project conventions (snake_case functions, PascalCase classes)

---

## 8. Implementation Notes

### Key Considerations
- Gemini API uses `x-goog-api-key` header (not Bearer token like Perplexity)
- Agent config must specify `type: "deep-research"` and `agent: "deep-research-pro-preview-12-2025"`
- POST /interactions requires `background: true` and `store: true` for async execution
- Poll interval default is 10 seconds (from GeminiSettings.poll_interval)
- Max poll attempts default is 360 (from GeminiSettings.max_poll_attempts)

### Potential Challenges
- **Long-running jobs**: Research can take up to 60 minutes; polling must be efficient
- **Network interruption**: last_event_id enables reconnection without losing progress
- **Terminal status detection**: Must correctly identify completed, failed, cancelled states
- **API rate limiting**: 429 errors should be mapped appropriately

### API Endpoint Details
```
Base URL: https://generativelanguage.googleapis.com/v1beta

POST /interactions
- Headers: x-goog-api-key, Content-Type: application/json
- Body: { query, agent_config: { type, agent }, background: true, store: true, ... }
- Returns: { interaction_id, status, created_at }

GET /interactions/{interaction_id}?last_event_id={id}
- Headers: x-goog-api-key
- Returns: { status, outputs, usage, completed_at, event_id, ... }

DELETE /interactions/{interaction_id}
- Headers: x-goog-api-key
- Returns: 204 No Content on success
```

### ASCII Reminder
All output files must use ASCII-only characters (0-127).

---

## 9. Testing Strategy

### Unit Tests
- Service instantiation with valid/invalid API key
- _build_headers() returns correct x-goog-api-key format
- _build_payload() constructs correct agent_config structure
- _handle_error() maps status codes to correct exception types

### Integration Tests
- Deferred to separate testing session

### Manual Testing
- Verify service imports correctly
- Test dependency injection with get_gemini_service()
- Confirm type annotations are correct (mypy)

### Edge Cases
- API key not configured (should raise GeminiAPIError.invalid_api_key)
- HTTP 404 on poll (should raise GeminiAPIError.interaction_not_found)
- HTTP 429 rate limit (should raise GeminiAPIError.rate_limit_exceeded)
- Max polls exceeded (should raise GeminiAPIError.max_polls_exceeded)
- Job status is FAILED (should raise GeminiAPIError.research_failed)

---

## 10. Dependencies

### External Libraries
- httpx: Async HTTP client (already installed)
- pydantic: Schema validation (already installed)

### Other Sessions
- **Depends on**: phase03-session01 (config), phase03-session03 (schemas/exceptions)
- **Depended by**: phase03-session06 (routes and integration)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
