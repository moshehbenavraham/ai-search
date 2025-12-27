# Task Checklist

**Session ID**: `phase03-session04-perplexity-service-and-route`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-27

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[SNNMM]` = Session reference (NN=phase number, MM=session number)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 5 | 5 | 0 |
| Implementation | 9 | 9 | 0 |
| Testing | 5 | 5 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0304] Verify prerequisites from Session 01 and 02 are complete (PerplexitySettings, schemas, exceptions)
- [x] T002 [S0304] Verify httpx is installed in requirements.txt
- [x] T003 [S0304] Create empty service file (`backend/app/services/perplexity.py`)

---

## Foundation (5 tasks)

Core structures and base implementations.

- [x] T004 [S0304] Add module docstring and imports to perplexity service (`backend/app/services/perplexity.py`)
- [x] T005 [S0304] Define PerplexityService class with BASE_URL constant (`backend/app/services/perplexity.py`)
- [x] T006 [S0304] Implement __init__ method reading settings.perplexity (`backend/app/services/perplexity.py`)
- [x] T007 [S0304] Implement _build_headers method for Bearer token auth (`backend/app/services/perplexity.py`)
- [x] T008 [S0304] [P] Add get_perplexity_service factory and PerplexityDep to deps.py (`backend/app/api/deps.py`)

---

## Implementation (9 tasks)

Main feature implementation.

- [x] T009 [S0304] Implement _build_payload method with messages array structure (`backend/app/services/perplexity.py`)
- [x] T010 [S0304] Add web_search_options nesting in _build_payload for search parameters (`backend/app/services/perplexity.py`)
- [x] T011 [S0304] Implement _parse_response method extracting content from choices[0].message.content (`backend/app/services/perplexity.py`)
- [x] T012 [S0304] Implement _handle_error method mapping HTTP status to PerplexityAPIError subtypes (`backend/app/services/perplexity.py`)
- [x] T013 [S0304] Implement async deep_research public method with httpx request (`backend/app/services/perplexity.py`)
- [x] T014 [S0304] Add timeout handling and TimeoutException conversion in deep_research (`backend/app/services/perplexity.py`)
- [x] T015 [S0304] Create perplexity router with POST /deep-research endpoint (`backend/app/api/routes/perplexity.py`)
- [x] T016 [S0304] Add perplexity_exception_handler to main.py (`backend/app/main.py`)
- [x] T017 [S0304] Register perplexity router in api/main.py (`backend/app/api/main.py`)

---

## Testing (5 tasks)

Verification and quality assurance.

- [x] T018 [S0304] Run ruff linter and fix any warnings
- [x] T019 [S0304] Run mypy type checker and fix any errors
- [x] T020 [S0304] Validate ASCII encoding on all created/modified files
- [x] T021 [S0304] Verify application starts without errors (uvicorn)
- [x] T022 [S0304] Manual test endpoint with valid API key (if available) or verify OpenAPI docs

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
Tasks marked `[P]` can be worked on simultaneously:
- T008 (deps.py) can be done in parallel with T007 (service headers)

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T004-T007 must complete before T009-T014 (service methods depend on class structure)
- T008 (deps.py) enables T015 (route using PerplexityDep)
- T015 must complete before T016-T017 (router registration)
- T018-T022 are sequential verification steps

### Key Implementation Details

**Perplexity API Specifics**:
- Endpoint: `POST https://api.perplexity.ai/chat/completions`
- Auth: `Authorization: Bearer {api_key}` (not API key header)
- Request format:
  ```json
  {
    "model": "sonar-pro",
    "messages": [{"role": "user", "content": "query"}],
    "web_search_options": {
      "search_mode": "auto",
      "search_recency_filter": "day",
      "search_domain_filter": ["example.com"]
    }
  }
  ```
- Timeout: 300 seconds (from PerplexitySettings)
- Response content at: `response["choices"][0]["message"]["content"]`

**Error Mapping**:
- HTTP 401 -> PerplexityAPIError.invalid_api_key()
- HTTP 429 -> PerplexityAPIError.rate_limit_exceeded()
- HTTP 403 -> PerplexityAPIError.content_filter()
- HTTP 400 -> PerplexityAPIError.invalid_request()
- Timeout -> PerplexityAPIError.request_timeout()
- Other -> PerplexityAPIError.api_error()

---

## Session Complete

All 22 tasks completed. Run `/validate` to verify session completeness.
