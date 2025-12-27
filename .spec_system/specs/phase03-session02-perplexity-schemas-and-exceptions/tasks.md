# Task Checklist

**Session ID**: `phase03-session02-perplexity-schemas-and-exceptions`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-27

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0302]` = Session reference (Phase 03, Session 02)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 9 | 9 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0302] Verify prerequisites met (Python 3.11+, Pydantic v2, phase03-session01 complete)
- [x] T002 [S0302] Create exceptions directory (`backend/app/exceptions/`)
- [x] T003 [S0302] Review Perplexity Sonar API documentation for parameter accuracy

---

## Foundation (6 tasks)

Core structures and base implementations - Enums and nested models.

- [x] T004 [S0302] [P] Create PerplexitySearchMode enum (auto, news, academic, social) (`backend/app/schemas/perplexity.py`)
- [x] T005 [S0302] [P] Create PerplexityReasoningEffort enum (low, medium, high) (`backend/app/schemas/perplexity.py`)
- [x] T006 [S0302] [P] Create PerplexitySearchContextSize enum (low, medium, high) (`backend/app/schemas/perplexity.py`)
- [x] T007 [S0302] [P] Create PerplexityRecencyFilter enum (hour, day, week, month) (`backend/app/schemas/perplexity.py`)
- [x] T008 [S0302] Create PerplexityErrorCode enum with all error codes (`backend/app/exceptions/perplexity.py`)
- [x] T009 [S0302] Add module docstrings and imports for schemas file (`backend/app/schemas/perplexity.py`)

---

## Implementation (9 tasks)

Main feature implementation - Request/Response schemas and exception class.

- [x] T010 [S0302] [P] Create PerplexitySearchResult nested model with url, title, snippet fields (`backend/app/schemas/perplexity.py`)
- [x] T011 [S0302] [P] Create PerplexityVideo nested model with url, title, thumbnail fields (`backend/app/schemas/perplexity.py`)
- [x] T012 [S0302] [P] Create PerplexityUsage nested model with token counts (`backend/app/schemas/perplexity.py`)
- [x] T013 [S0302] [P] Create PerplexityChoice nested model with message content (`backend/app/schemas/perplexity.py`)
- [x] T014 [S0302] Implement PerplexityDeepResearchRequest with core parameters (query, model, system_prompt) (`backend/app/schemas/perplexity.py`)
- [x] T015 [S0302] Add reasoning and generation parameters to request schema (max_tokens, temperature, top_p, etc.) (`backend/app/schemas/perplexity.py`)
- [x] T016 [S0302] Add search filter parameters with validators (recency, domain, date filters) (`backend/app/schemas/perplexity.py`)
- [x] T017 [S0302] Implement PerplexityDeepResearchResponse with nested models (`backend/app/schemas/perplexity.py`)
- [x] T018 [S0302] Implement PerplexityAPIError exception class with factory methods (`backend/app/exceptions/perplexity.py`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0302] [P] Update schemas __init__.py with Perplexity exports (`backend/app/schemas/__init__.py`)
- [x] T020 [S0302] [P] Create exceptions __init__.py with exports (`backend/app/exceptions/__init__.py`)
- [x] T021 [S0302] Validate ASCII encoding on all created files
- [x] T022 [S0302] Manual testing - instantiate schemas and exceptions, verify parsing

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All files ASCII-encoded
- [x] Unix LF line endings
- [x] Code follows CONVENTIONS.md patterns
- [x] No type errors (mypy compatible)
- [x] No lint warnings (ruff compatible)
- [x] Docstrings for all public classes and methods
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks marked `[P]` can be worked on simultaneously:
- T004-T007: All enums are independent
- T010-T013: Nested models are independent
- T019-T020: Both __init__.py updates are independent

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T009 should be done before other schema implementation tasks
- T008 must be done before T018 (exception class needs error codes)
- T014-T017 should be done sequentially (building up the request schema)
- T019-T020 depend on schema/exception files being complete

### Key Reference Files
- Pattern for schemas: `backend/app/schemas/tavily.py`
- Pattern for exceptions: `backend/app/core/exceptions.py`
- Configuration reference: `backend/app/core/config.py` (PerplexitySettings)

### Request Parameter Groups
1. **Core**: query (required), system_prompt, model (default: sonar-pro)
2. **Reasoning**: search_mode, reasoning_effort, search_context_size
3. **Generation**: max_tokens, temperature, top_p, top_k, presence_penalty, frequency_penalty
4. **Search Filters**: search_recency_filter, search_domain_filter, search_after_date_filter, search_before_date_filter
5. **Output Options**: return_images, return_related_questions
6. **Control**: stream

### Factory Methods for PerplexityAPIError
- rate_limit_exceeded (429)
- invalid_api_key (401)
- request_timeout (504)
- invalid_request (400)
- content_filter (403)
- api_error (500)

---

## Actual Implementation Notes

### Enum Value Adjustments
- PerplexitySearchMode uses actual API values (auto, news, academic, social) instead of spec values
- PerplexityRecencyFilter includes 'hour' in addition to day, week, month based on API docs

### Additional Models Created
- PerplexityMessage: Added to properly type the message content in choices

### Validation Features
- Date filter validator enforces MM/DD/YYYY format
- Domain filter validator normalizes (strips whitespace, lowercases, removes empty strings)
- Request schema uses extra="forbid" for strict validation
- Response schema uses extra="allow" for flexible parsing

---

## Next Steps

Run `/validate` to verify session completeness.
