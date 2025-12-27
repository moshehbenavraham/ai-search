# Task Checklist

**Session ID**: `phase03-session05-gemini-service-implementation`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-27

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0305]` = Session reference (Phase 03, Session 05)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 5 | 5 | 0 |
| Implementation | 10 | 10 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0305] Verify prerequisites: confirm gemini.py schemas and exceptions exist
- [x] T002 [S0305] Verify GeminiSettings configuration available in settings.gemini
- [x] T003 [S0305] Create service file skeleton (`backend/app/services/gemini.py`)

---

## Foundation (5 tasks)

Core structures and base implementations.

- [x] T004 [S0305] Add module docstring and imports (`backend/app/services/gemini.py`)
- [x] T005 [S0305] Define GeminiService class with BASE_URL constant (`backend/app/services/gemini.py`)
- [x] T006 [S0305] Implement __init__ method with settings injection (`backend/app/services/gemini.py`)
- [x] T007 [S0305] Implement _build_headers() for x-goog-api-key auth (`backend/app/services/gemini.py`)
- [x] T008 [S0305] Implement _handle_error() HTTP-to-exception mapper (`backend/app/services/gemini.py`)

---

## Implementation (10 tasks)

Main feature implementation.

- [x] T009 [S0305] Implement _build_payload() with agent_config structure (`backend/app/services/gemini.py`)
- [x] T010 [S0305] Implement _parse_job_response() for job creation response (`backend/app/services/gemini.py`)
- [x] T011 [S0305] Implement _parse_poll_response() for poll result parsing (`backend/app/services/gemini.py`)
- [x] T012 [S0305] Implement start_research() POST /interactions method (`backend/app/services/gemini.py`)
- [x] T013 [S0305] Implement poll_research() GET /interactions/{id} method (`backend/app/services/gemini.py`)
- [x] T014 [S0305] Implement _is_terminal_status() helper method (`backend/app/services/gemini.py`)
- [x] T015 [S0305] Implement wait_for_completion() polling loop (`backend/app/services/gemini.py`)
- [x] T016 [S0305] Implement cancel_research() DELETE /interactions/{id} (`backend/app/services/gemini.py`)
- [x] T017 [S0305] [P] Add get_gemini_service() factory function (`backend/app/api/deps.py`)
- [x] T018 [S0305] [P] Add GeminiDep type alias (`backend/app/api/deps.py`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0305] Run ruff linter and fix any warnings
- [x] T020 [S0305] Run mypy type checker and fix any errors
- [x] T021 [S0305] Validate ASCII encoding on all modified files
- [x] T022 [S0305] Manual testing: verify imports and service instantiation

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All files ASCII-encoded
- [x] No ruff lint warnings
- [x] No mypy type errors
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T017 and T018 (deps.py modifications) can be worked on simultaneously since they are independent additions.

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T001-T003: Setup must complete before foundation work
- T004-T008: Foundation work provides helpers for implementation
- T009-T016: Implementation tasks build on each other
- T017-T018: Can be done in parallel after T016
- T019-T022: Testing after all implementation complete

### Key Technical Details

**API Endpoint Pattern:**
```
Base URL: https://generativelanguage.googleapis.com/v1beta

POST /interactions - Create research job
GET /interactions/{id}?last_event_id={id} - Poll for results
DELETE /interactions/{id} - Cancel job
```

**Agent Config Structure:**
```json
{
  "agent_config": {
    "type": "deep-research",
    "agent": "deep-research-pro-preview-12-2025"
  }
}
```

**Terminal Statuses:**
- COMPLETED - Job finished successfully
- FAILED - Job encountered an error
- CANCELLED - Job was cancelled

### Error Mapping Reference
| HTTP Status | GeminiAPIError Factory |
|-------------|------------------------|
| 401 | invalid_api_key() |
| 404 | interaction_not_found() |
| 429 | rate_limit_exceeded() |
| 400 | invalid_request() |
| Other | api_error() |

---

## Next Steps

Run `/validate` to verify session completeness.
