# Task Checklist

**Session ID**: `phase00-session04-search-and-extract-routes`
**Total Tasks**: 18
**Estimated Duration**: 1.5-2 hours
**Created**: 2025-12-21

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0004]` = Session reference (Phase 00, Session 04)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 3 | 3 | 0 |
| Foundation | 4 | 4 | 0 |
| Implementation | 7 | 7 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **18** | **18** | **0** |

---

## Setup (3 tasks)

Initial verification and environment preparation.

- [x] T001 [S0004] Verify prerequisites: TavilyService exists at `backend/app/services/tavily.py`
- [x] T002 [S0004] Verify prerequisites: TavilyDep defined in `backend/app/api/deps.py`
- [x] T003 [S0004] Verify prerequisites: Request/response schemas exist at `backend/app/schemas/tavily.py`

---

## Foundation (4 tasks)

Core router structure and imports.

- [x] T004 [S0004] Create router file `backend/app/api/routes/tavily.py` with module docstring
- [x] T005 [S0004] Add imports: fastapi.APIRouter, typing.Any
- [x] T006 [S0004] Add imports: CurrentUser, TavilyDep from app.api.deps
- [x] T007 [S0004] Add imports: SearchRequest, SearchResponse, ExtractRequest, ExtractResponse from app.schemas.tavily

---

## Implementation (7 tasks)

Route handler implementation.

- [ ] T008 [S0004] Create APIRouter instance with prefix="/tavily" and tags=["tavily"]
- [ ] T009 [S0004] Implement POST /search route decorator with response_model=SearchResponse
- [ ] T010 [S0004] Implement search function signature with CurrentUser, TavilyDep, SearchRequest params
- [ ] T011 [S0004] Implement search function body: extract params, call service, return response
- [ ] T012 [S0004] Implement POST /extract route decorator with response_model=ExtractResponse
- [ ] T013 [S0004] Implement extract function signature with CurrentUser, TavilyDep, ExtractRequest params
- [ ] T014 [S0004] Implement extract function body: extract urls, call service, return response

---

## Testing (4 tasks)

Verification and quality assurance.

- [ ] T015 [S0004] Verify file syntax and imports: `python -c "from app.api.routes.tavily import router"`
- [ ] T016 [S0004] Run ruff check: `ruff check backend/app/api/routes/tavily.py`
- [ ] T017 [S0004] Run ruff format check: `ruff format --check backend/app/api/routes/tavily.py`
- [ ] T018 [S0004] Validate ASCII encoding on tavily.py (no Unicode chars 128+)

---

## Completion Checklist

Before marking session complete:

- [ ] All tasks marked `[x]`
- [ ] All files ASCII-encoded
- [ ] ruff check passes with zero errors
- [ ] ruff format --check passes with zero changes
- [ ] implementation-notes.md updated
- [ ] Ready for `/validate`

---

## Notes

### File to Create

Single deliverable: `backend/app/api/routes/tavily.py` (~70 lines)

### Dependency Chain

```
TavilyService (S02) --> TavilyDep (S02) --> Router (S04)
                                              |
SearchRequest/Response (S03) ----------------+
ExtractRequest/Response (S03) ---------------+
```

### Key Implementation Details

1. **Route handlers must be async**: TavilyService methods are async
2. **Parameter mapping**: Use explicit kwargs when calling service methods
3. **Response construction**: Use `ResponseModel.model_validate(result)` to convert dict to Pydantic model
4. **CurrentUser unused**: Auth is enforced but user object not needed for these operations

### Router Not Registered Yet

Router registration in `api/main.py` is deferred to Session 05. After this session:
- File exists and is syntactically correct
- Cannot test via /docs until Session 05 registers the router

### Reference Pattern

```python
@router.post("/search", response_model=SearchResponse)
async def search(
    current_user: CurrentUser,
    tavily: TavilyDep,
    request: SearchRequest,
) -> SearchResponse:
    """Perform a web search using Tavily API."""
    result = await tavily.search(
        query=request.query,
        search_depth=request.search_depth,
        # ... other params
    )
    return SearchResponse.model_validate(result)
```

---

## Next Steps

Run `/implement` to begin AI-led implementation.
