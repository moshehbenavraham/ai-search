# Task Checklist

**Session ID**: `phase00-session03-pydantic-schemas`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0003]` = Session reference (Phase 00, Session 03)
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

- [x] T001 [S0003] Verify prerequisites (Pydantic v2, TavilyService exists)
- [x] T002 [S0003] Create schemas directory (`backend/app/schemas/`)
- [x] T003 [S0003] Create schemas package init file (`backend/app/schemas/__init__.py`)

---

## Foundation (6 tasks)

Core types, enums, and base structures.

- [x] T004 [S0003] Create tavily.py module with imports and module docstring (`backend/app/schemas/tavily.py`)
- [x] T005 [S0003] [P] Define SearchDepth enum (basic, advanced) (`backend/app/schemas/tavily.py`)
- [x] T006 [S0003] [P] Define SearchTopic enum (general, news) (`backend/app/schemas/tavily.py`)
- [x] T007 [S0003] Define SearchResult nested model with all fields (`backend/app/schemas/tavily.py`)
- [x] T008 [S0003] Define ExtractResult nested model (`backend/app/schemas/tavily.py`)
- [x] T009 [S0003] Define CrawlResult nested model (`backend/app/schemas/tavily.py`)

---

## Implementation (9 tasks)

Request and response schema implementation.

- [x] T010 [S0003] Implement SearchRequest schema with 10 parameters and validators (`backend/app/schemas/tavily.py`)
- [x] T011 [S0003] Implement SearchResponse schema with results, answer, images (`backend/app/schemas/tavily.py`)
- [x] T012 [S0003] Implement ExtractRequest schema with URL/URL-list union type (`backend/app/schemas/tavily.py`)
- [x] T013 [S0003] Implement ExtractResponse schema with extraction results (`backend/app/schemas/tavily.py`)
- [x] T014 [S0003] Implement CrawlRequest schema with all 7 parameters (`backend/app/schemas/tavily.py`)
- [x] T015 [S0003] Implement CrawlResponse schema with crawled page results (`backend/app/schemas/tavily.py`)
- [x] T016 [S0003] Implement MapRequest schema with all 7 parameters (`backend/app/schemas/tavily.py`)
- [x] T017 [S0003] Implement MapResponse schema with discovered URLs (`backend/app/schemas/tavily.py`)
- [x] T018 [S0003] Update __init__.py with all schema exports (`backend/app/schemas/__init__.py`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0003] Run ruff check on schemas module and fix any lint errors
- [x] T020 [S0003] Run type checker (mypy/pyright) on schemas and fix errors
- [x] T021 [S0003] Manual testing - instantiate schemas in Python REPL with sample data
- [x] T022 [S0003] Validate ASCII encoding and Unix line endings on all files

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All 22 schema fields have description strings for OpenAPI
- [x] SearchRequest exposes all 10 SDK parameters with correct defaults
- [x] ExtractRequest handles both str and list[str] for urls field
- [x] CrawlRequest/MapRequest match TavilyService signatures
- [x] All response schemas match TavilyService return structures
- [x] Constraints applied: max_results (1-20), max_depth/max_breadth/limit (>=1)
- [x] URL fields validate proper format
- [x] ruff check passes with no errors
- [x] Type checker passes with no errors
- [x] All files ASCII-encoded (0-127 characters only)
- [x] Unix LF line endings
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T005-T006 (enums) can be worked on simultaneously. All other tasks should be completed in sequence due to dependencies.

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T001-T003: Sequential setup
- T004: Creates the file that T005-T018 will modify
- T005-T006: Parallelizable (independent enums)
- T007-T009: Depends on enums for SearchResult's search_depth field type
- T010-T017: Each depends on respective nested result models
- T018: Depends on T010-T017 completion
- T019-T022: Final validation, depends on all implementation complete

### Key Files Reference
| File | Purpose |
|------|---------|
| `backend/app/services/tavily.py` | Reference for parameter names and defaults |
| `backend/app/schemas/__init__.py` | Package exports |
| `backend/app/schemas/tavily.py` | Main implementation file |

### Schema Structure Reference
```
backend/app/schemas/
    __init__.py         # Exports all public schemas
    tavily.py           # All Tavily-related schemas
```

### Response Structure Notes (from TavilyService docstrings)
- SearchResponse: query, results, answer (optional), images (optional)
- ExtractResponse: results (list of url, raw_content, images)
- CrawlResponse: base_url, results, total_pages
- MapResponse: base_url, urls, total_urls

---

## Next Steps

Run `/validate` to verify session completeness.
