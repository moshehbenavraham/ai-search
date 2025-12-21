# Task Checklist

**Session ID**: `phase00-session02-service-layer-implementation`
**Total Tasks**: 24
**Estimated Duration**: 8-10 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0002]` = Session reference (Phase 00, Session 02)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 10 | 10 | 0 |
| Testing | 5 | 5 | 0 |
| **Total** | **24** | **24** | **0** |

---

## Setup (3 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0002] Verify Session 01 prerequisites (TavilySettings exists in config.py)
- [x] T002 [S0002] Create `backend/app/services/` directory
- [x] T003 [S0002] Verify tavily-python SDK is installed and importable

---

## Foundation (6 tasks)

Core structures and base implementations.

- [x] T004 [S0002] Create `backend/app/services/__init__.py` with TavilyService export
- [x] T005 [S0002] Create `backend/app/services/tavily.py` with module docstring and imports
- [x] T006 [S0002] Define TavilyService class skeleton with __init__ method signature
- [x] T007 [S0002] Implement AsyncTavilyClient initialization in __init__
- [x] T008 [S0002] Add proxy format conversion logic (str to dict) for client initialization
- [x] T009 [S0002] Add timeout configuration passthrough to client

---

## Implementation (10 tasks)

Main feature implementation - service methods for all Tavily operations.

- [x] T010 [S0002] Implement async search() method with full parameter support (`backend/app/services/tavily.py`)
- [x] T011 [S0002] Add search() docstring documenting all parameters
- [x] T012 [S0002] Implement async extract() method for URL content extraction (`backend/app/services/tavily.py`)
- [x] T013 [S0002] Add extract() docstring documenting URL and batch parameters
- [x] T014 [S0002] Implement async crawl() method with depth and instruction support (`backend/app/services/tavily.py`)
- [x] T015 [S0002] Add crawl() docstring documenting crawl parameters
- [x] T016 [S0002] Implement async map_urls() method for sitemap generation (`backend/app/services/tavily.py`)
- [x] T017 [S0002] Add map_urls() docstring documenting mapping parameters
- [x] T018 [S0002] Create get_tavily_service() factory function in `backend/app/api/deps.py`
- [x] T019 [S0002] Create TavilyDep annotated dependency following SessionDep pattern

---

## Testing (5 tasks)

Verification and quality assurance.

- [x] T020 [S0002] Run mypy type checking on services and deps modules
- [x] T021 [S0002] Run ruff lint checking on services and deps modules
- [x] T022 [S0002] Validate ASCII encoding on all created/modified files
- [x] T023 [S0002] Manual verification: TavilyService import and instantiation
- [x] T024 [S0002] Manual verification: TavilyDep dependency import

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing (mypy, ruff)
- [x] All files ASCII-encoded
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T010-T017 (method implementations) are sequential because each method follows a similar pattern - implementing one informs the next. However, docstring tasks can be done immediately after their respective method.

### Task Timing
Target ~20-25 minutes per task. Foundation and Implementation tasks may take longer due to complexity.

### Dependencies
- T004-T009 must complete before T010 (service class must exist)
- T010-T017 are sequential (method implementations)
- T018-T019 depend on T004 (TavilyService must be importable)
- T020-T024 are final verification

### Key Files

| File | Action | Purpose |
|------|--------|---------|
| `backend/app/services/__init__.py` | Create | Package init with exports |
| `backend/app/services/tavily.py` | Create | TavilyService class (~150 lines) |
| `backend/app/api/deps.py` | Modify | Add TavilyDep (~15 lines) |

### SDK Method Reference

From tavily-python AsyncTavilyClient:
- `search(query, **kwargs)` - Web search
- `extract(urls, **kwargs)` - Content extraction
- `crawl(url, **kwargs)` - Site crawling
- `map(url, **kwargs)` - Sitemap generation (note: our method is map_urls to avoid Python builtin conflict)

### Type Hint Strategy

Return types are `dict[str, Any]` for now. Pydantic schemas in Session 03 will provide structured response types.

---

## Next Steps

Run `/implement` to begin AI-led implementation.
