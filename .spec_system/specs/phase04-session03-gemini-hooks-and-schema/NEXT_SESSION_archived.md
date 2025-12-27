# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-27
**Project State**: Phase 04 - Deep Research Frontend
**Completed Sessions**: 23

---

## Recommended Next Session

**Session ID**: `phase04-session03-gemini-hooks-and-schema`
**Session Name**: Gemini Hooks and Schema
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: ~25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 complete (SDK client regenerated with Gemini services)
- [x] Session 02 complete (Perplexity hooks pattern established)
- [x] GeminiService available in SDK (generated from backend)
- [x] TypeScript types for Gemini schemas generated

### Dependencies
- **Builds on**: `phase04-session02-perplexity-hooks-and-schema` (hook patterns)
- **Enables**: `phase04-session05-gemini-page-and-components` (UI components)

### Project Progression
Session 03 follows the established pattern in Phase 04: SDK Client → Perplexity Hooks → **Gemini Hooks** → Perplexity Page → Gemini Page → Polish. The Perplexity hooks (Session 02) established the pattern for TanStack Query mutations and Zod schemas. This session mirrors that work for the Gemini API, but with the added complexity of asynchronous polling workflow.

---

## Session Overview

### Objective
Create the Zod validation schema and TanStack Query hooks for Gemini deep research, implementing the asynchronous workflow with start, poll, cancel, and sync operations.

### Key Deliverables
1. `frontend/src/lib/schemas/gemini.ts` - Zod validation schema
2. `frontend/src/hooks/useGeminiDeepResearch.ts` - TanStack Query hooks
3. useGeminiStartResearch mutation (returns interaction_id)
4. useGeminiPollResearch query with automatic refetchInterval
5. useGeminiCancelResearch mutation
6. useGeminiSyncResearch mutation (blocking alternative)

### Scope Summary
- **In Scope (MVP)**: Zod schema, all four hooks, polling logic with terminal status detection, last_event_id reconnection support
- **Out of Scope**: Form components (Session 05), Result display (Session 05), Save to Items (Session 06)

---

## Technical Considerations

### Technologies/Patterns
- **TanStack Query**: useMutation for start/cancel/sync, useQuery with refetchInterval for polling
- **Zod**: Schema validation matching backend GeminiDeepResearchRequest
- **TypeScript**: Full type safety with SDK-generated types
- **Polling pattern**: refetchInterval with terminal status detection to auto-stop

### Potential Challenges
- **Polling lifecycle management**: Must detect terminal statuses (COMPLETED, FAILED, CANCELLED) to stop polling
- **Reconnection support**: last_event_id parameter for resuming after network interruption
- **Long-running jobs**: Research can take up to 60 minutes; hooks must handle gracefully

### Relevant Considerations
- [P03] **Gemini polling duration**: Research jobs can run up to 60 minutes (typical ~20 min). Frontend needs progress indicators and reconnection support via last_event_id.
- [P03] **Sync vs async API patterns**: Perplexity uses synchronous POST, Gemini uses async polling. Frontend must handle both patterns differently.
- [P03] **Async polling pattern**: GeminiService.wait_for_completion() with configurable poll_interval and max_attempts handles long-running jobs gracefully.

---

## Alternative Sessions

If this session is blocked:
1. **phase04-session04-perplexity-page-and-components** - Could be started since Perplexity hooks are complete; allows parallel progress
2. **phase04-session06-save-integration-and-polish** - Research on save mapper patterns could begin, though blocked on UI components

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
