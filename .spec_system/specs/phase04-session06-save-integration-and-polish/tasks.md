# Task Checklist

**Session ID**: `phase04-session06-save-integration-and-polish`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-27

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0406]` = Session reference (Phase 04, Session 06)
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

- [x] T001 [S0406] Verify prerequisites: confirm PerplexityResultView, GeminiResultView, useSaveToItems, ContentTypeBadge, and ContentTypeFilter exist
- [x] T002 [S0406] Review existing tavily-mappers.ts pattern for ItemCreate mapper structure
- [x] T003 [S0406] Review ItemCreate schema and item_metadata structure from SDK client

---

## Foundation (5 tasks)

Core structures and base implementations.

- [x] T004 [S0406] Add 'perplexity' to ContentType enum in backend (`backend/app/models.py`)
- [x] T005 [S0406] Add 'gemini' to ContentType enum in backend (`backend/app/models.py`)
- [x] T006 [S0406] Regenerate frontend SDK client after backend enum update (`frontend/src/client/`)
- [x] T007 [S0406] Create deep-research-mappers.ts file with imports and type definitions (`frontend/src/lib/deep-research-mappers.ts`)
- [x] T008 [S0406] Update items.tsx search schema to include 'perplexity' and 'gemini' content types (`frontend/src/routes/_layout/items.tsx`)

---

## Implementation (10 tasks)

Main feature implementation.

- [x] T009 [S0406] Implement mapPerplexityResultToItem() function with title, content extraction (`frontend/src/lib/deep-research-mappers.ts`)
- [x] T010 [S0406] Add metadata mapping for Perplexity: citations, search_results, usage (`frontend/src/lib/deep-research-mappers.ts`)
- [x] T011 [S0406] [P] Implement mapGeminiResultToItem() function with title, content extraction (`frontend/src/lib/deep-research-mappers.ts`)
- [x] T012 [S0406] [P] Add metadata mapping for Gemini: thinking_summary, outputs, grounding_metadata (`frontend/src/lib/deep-research-mappers.ts`)
- [x] T013 [S0406] Add Save button to PerplexityResultView with useSaveToItems hook (`frontend/src/components/Perplexity/PerplexityResultView.tsx`)
- [x] T014 [S0406] Add loading state and disabled logic to Perplexity Save button (`frontend/src/components/Perplexity/PerplexityResultView.tsx`)
- [x] T015 [S0406] Add Save button to GeminiResultView with useSaveToItems hook (`frontend/src/components/Gemini/GeminiResultView.tsx`)
- [x] T016 [S0406] Add loading state and status-based disabled logic to Gemini Save button (`frontend/src/components/Gemini/GeminiResultView.tsx`)
- [x] T017 [S0406] [P] Add 'perplexity' and 'gemini' badge variants to ContentTypeBadge (`frontend/src/components/Items/ContentTypeBadge.tsx`)
- [x] T018 [S0406] [P] Add 'Perplexity' and 'Gemini' filter options to ContentTypeFilter (`frontend/src/components/Items/ContentTypeFilter.tsx`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0406] Run TypeScript type checking (npm run build) and fix any errors
- [x] T020 [S0406] Run lint checks (npm run lint) and fix any errors
- [x] T021 [S0406] Manual testing: Perplexity save workflow - research, save, verify in Items page
- [x] T022 [S0406] Manual testing: Gemini save workflow - research, save, verify Items filtering and badges

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
- T011 + T012: Gemini mapper functions (independent of Perplexity)
- T017 + T018: Badge and filter updates (independent components)

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T004/T005 must complete before T006 (SDK regeneration)
- T006 must complete before T007-T018 (need updated types)
- T009/T010 must complete before T013/T014 (Perplexity mapper before save button)
- T011/T012 must complete before T015/T016 (Gemini mapper before save button)

### Critical Path
```
T001-T003 (Setup)
    |
    v
T004-T005 (Backend enum)
    |
    v
T006 (SDK regeneration)
    |
    +---> T007 (Mapper file) ---> T009-T010 (Perplexity mapper) ---> T013-T014 (Perplexity Save)
    |
    +---> T008 (Items schema)
    |
    +---> T017-T018 (Badge/Filter) [P]
    |
    v
T011-T012 (Gemini mapper) ---> T015-T016 (Gemini Save)
    |
    v
T019-T022 (Testing)
```

### Key Considerations
- Gemini Save button must only enable when status === "COMPLETED"
- Perplexity response uses choices[0].message.content structure
- Gemini response uses outputs array with thinking_summary
- All metadata stored in item_metadata JSON field

---

## Session Complete

All 22 tasks completed. Run `/validate` to verify session completeness.
