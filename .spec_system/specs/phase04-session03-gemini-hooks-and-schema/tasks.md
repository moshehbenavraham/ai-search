# Task Checklist

**Session ID**: `phase04-session03-gemini-hooks-and-schema`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-27

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0403]` = Session reference (Phase 04, Session 03)
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

- [x] T001 [S0403] Verify prerequisites met (SDK regenerated with GeminiService, dev server ready)
- [x] T002 [S0403] Verify backend API endpoints available at localhost:8000 (`/api/v1/gemini/deep-research`)
- [x] T003 [S0403] Review SDK types for GeminiDeepResearchRequest and response types

---

## Foundation (6 tasks)

Core structures and base implementations.

- [x] T004 [S0403] Create Zod schema file scaffold (`frontend/src/lib/schemas/gemini.ts`)
- [x] T005 [S0403] Define Zod schema for query field with required validation (`frontend/src/lib/schemas/gemini.ts`)
- [x] T006 [S0403] [P] Add enable_thinking_summaries boolean field to schema (`frontend/src/lib/schemas/gemini.ts`)
- [x] T007 [S0403] [P] Add file_search_store_names array field to schema (`frontend/src/lib/schemas/gemini.ts`)
- [x] T008 [S0403] [P] Add previous_interaction_id optional field to schema (`frontend/src/lib/schemas/gemini.ts`)
- [x] T009 [S0403] Export GeminiFormData type and default form values (`frontend/src/lib/schemas/gemini.ts`)

---

## Implementation (9 tasks)

Main feature implementation.

- [x] T010 [S0403] Create hooks file scaffold with imports (`frontend/src/hooks/useGeminiDeepResearch.ts`)
- [x] T011 [S0403] Define terminal status constants and helper function (`frontend/src/hooks/useGeminiDeepResearch.ts`)
- [x] T012 [S0403] Implement useGeminiStartResearch mutation hook (`frontend/src/hooks/useGeminiDeepResearch.ts`)
- [x] T013 [S0403] Implement useGeminiPollResearch query hook with refetchInterval (`frontend/src/hooks/useGeminiDeepResearch.ts`)
- [x] T014 [S0403] Add terminal status detection to stop polling automatically (`frontend/src/hooks/useGeminiDeepResearch.ts`)
- [x] T015 [S0403] Add last_event_id parameter support for reconnection (`frontend/src/hooks/useGeminiDeepResearch.ts`)
- [x] T016 [S0403] Implement useGeminiCancelResearch mutation hook (`frontend/src/hooks/useGeminiDeepResearch.ts`)
- [x] T017 [S0403] Implement useGeminiSyncResearch mutation hook (`frontend/src/hooks/useGeminiDeepResearch.ts`)
- [x] T018 [S0403] Add error handling with useCustomToast integration (`frontend/src/hooks/useGeminiDeepResearch.ts`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0403] Run TypeScript compiler to verify no type errors
- [x] T020 [S0403] Run biome lint/format check and fix any issues
- [x] T021 [S0403] Validate ASCII encoding on all created files
- [x] T022 [S0403] Manual testing: verify hooks via browser devtools console

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All files ASCII-encoded
- [x] No TypeScript errors in strict mode
- [x] No biome lint/format errors
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks marked `[P]` can be worked on simultaneously:
- T006, T007, T008 - Independent schema field additions

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T004 must complete before T005-T009
- T010 must complete before T011-T018
- T011 should complete before T013-T015 (terminal status helper needed for polling)

### SDK Types Reference
```typescript
// Request type from SDK
type GeminiDeepResearchRequest = {
  query: string;
  enable_thinking_summaries?: boolean;
  file_search_store_names?: (Array<string> | null);
  previous_interaction_id?: (string | null);
}

// Terminal statuses (lowercase per SDK)
type GeminiInteractionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

// Terminal: 'completed', 'failed', 'cancelled'
```

### Hook Architecture
1. `useGeminiStartResearch` - POST mutation, returns interaction_id
2. `useGeminiPollResearch` - GET query with refetchInterval (default 5s), stops on terminal
3. `useGeminiCancelResearch` - DELETE mutation
4. `useGeminiSyncResearch` - POST mutation, blocking workflow

---

## Next Steps

Run `/validate` to verify session completeness.
