# Session Specification

**Session ID**: `phase04-session03-gemini-hooks-and-schema`
**Phase**: 04 - Deep Research Frontend
**Status**: Not Started
**Created**: 2025-12-27

---

## 1. Session Overview

This session creates the frontend Zod validation schema and TanStack Query hooks for Gemini deep research functionality. Unlike Perplexity's synchronous API pattern, Gemini uses an asynchronous polling workflow that requires a more sophisticated hook architecture with start, poll, cancel, and sync operations.

The Gemini deep research feature enables users to initiate long-running research jobs that can take up to 60 minutes to complete. The frontend must handle this gracefully by implementing a polling mechanism that automatically fetches status updates until a terminal state is reached (COMPLETED, FAILED, or CANCELLED). The hooks will also support reconnection via `last_event_id` parameter for network interruption recovery.

This session establishes the data layer foundation that Session 05 (Gemini Page and Components) will build upon, following the same pattern established for Perplexity in Session 02 but with additional complexity for the async workflow.

---

## 2. Objectives

1. Create Zod validation schema for Gemini deep research form with all request fields
2. Implement TanStack Query mutation hooks for start, cancel, and sync operations
3. Implement TanStack Query query hook with automatic polling and terminal status detection
4. Enable reconnection support via last_event_id parameter for network resilience

---

## 3. Prerequisites

### Required Sessions
- [x] `phase04-session01-sdk-client-and-navigation` - SDK regenerated with GeminiService
- [x] `phase04-session02-perplexity-hooks-and-schema` - Hook patterns established
- [x] `phase03-session05-gemini-service-implementation` - Backend service available
- [x] `phase03-session06-gemini-routes-and-integration` - API endpoints available

### Required Tools/Knowledge
- TanStack Query v5 (useMutation, useQuery, refetchInterval)
- Zod schema validation
- TypeScript strict mode
- Understanding of async polling patterns

### Environment Requirements
- Frontend dev server running (`npm run dev`)
- SDK types generated (`npm run generate-client`)
- Backend API available at localhost:8000

---

## 4. Scope

### In Scope (MVP)
- Create `frontend/src/lib/schemas/gemini.ts` with Zod schema
- Create `frontend/src/hooks/useGeminiDeepResearch.ts` with all hooks
- `useGeminiStartResearch` mutation (returns interaction_id)
- `useGeminiPollResearch` query with configurable refetchInterval
- `useGeminiCancelResearch` mutation for job cancellation
- `useGeminiSyncResearch` mutation for blocking workflow
- Terminal status detection to auto-stop polling
- `last_event_id` parameter support for reconnection

### Out of Scope (Deferred)
- Form component UI - *Reason: Session 05 scope*
- Result display components - *Reason: Session 05 scope*
- Progress indicator component - *Reason: Session 05 scope*
- Save to Items functionality - *Reason: Session 06 scope*
- Streaming/SSE implementation - *Reason: Polling approach used instead*

---

## 5. Technical Approach

### Architecture
The hooks module will export four hooks that correspond to the GeminiService SDK methods:
1. `useGeminiStartResearch` - Mutation that POSTs to `/api/v1/gemini/deep-research`, returns `interaction_id`
2. `useGeminiPollResearch` - Query that GETs `/api/v1/gemini/deep-research/{interaction_id}`, uses refetchInterval
3. `useGeminiCancelResearch` - Mutation that DELETEs `/api/v1/gemini/deep-research/{interaction_id}`
4. `useGeminiSyncResearch` - Mutation that POSTs to `/api/v1/gemini/deep-research/sync`, blocks until complete

### Design Patterns
- **TanStack Query Mutations**: For state-changing operations (start, cancel, sync)
- **TanStack Query with refetchInterval**: For polling (automatically stops on terminal status)
- **Zod Schema Validation**: Form validation matching backend GeminiDeepResearchRequest
- **Error Boundary Pattern**: Toast notifications for API errors via useCustomToast

### Technology Stack
- TanStack Query v5 (useMutation, useQuery)
- Zod v3 for schema validation
- TypeScript 5.x strict mode
- SDK-generated types (GeminiDeepResearchRequest, GeminiDeepResearchJobResponse, etc.)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `frontend/src/lib/schemas/gemini.ts` | Zod validation schema and form defaults | ~50 |
| `frontend/src/hooks/useGeminiDeepResearch.ts` | TanStack Query hooks for all Gemini operations | ~150 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| None | N/A | 0 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Zod schema validates query (required), enable_thinking_summaries, file_search_store_names, previous_interaction_id
- [ ] useGeminiStartResearch mutation returns GeminiDeepResearchJobResponse with interaction_id
- [ ] useGeminiPollResearch query automatically refetches at configured interval (default 5s)
- [ ] useGeminiPollResearch stops polling when status is COMPLETED, FAILED, or CANCELLED
- [ ] useGeminiCancelResearch mutation successfully cancels in-progress job
- [ ] useGeminiSyncResearch mutation blocks until completion and returns full response
- [ ] last_event_id parameter supported in poll hook for reconnection

### Testing Requirements
- [ ] Manual testing: Start research, verify polling updates status
- [ ] Manual testing: Cancel in-progress research, verify status changes
- [ ] Manual testing: Verify terminal status stops polling

### Quality Gates
- [ ] All files ASCII-encoded
- [ ] Unix LF line endings
- [ ] Code follows project conventions (camelCase functions, PascalCase types)
- [ ] No TypeScript errors in strict mode
- [ ] No biome lint/format errors
- [ ] Hooks use named exports per conventions

---

## 8. Implementation Notes

### Key Considerations
- Gemini research jobs can run up to 60 minutes; hooks must not timeout prematurely
- Polling interval should be configurable (default 5 seconds, but may need adjustment)
- Terminal statuses are: `completed`, `failed`, `cancelled` (lowercase per SDK types)
- The `enabled` option on useQuery controls whether polling starts/stops

### Potential Challenges
- **Polling lifecycle**: Must track enabled state to stop polling on terminal status. Use React state or ref to track.
- **Network interruption**: Use last_event_id from previous poll response to resume. Hook caller must store and pass this.
- **Memory leaks**: Ensure polling stops when component unmounts. TanStack Query handles this automatically.

### Relevant Considerations
- [P03] **Gemini polling duration**: Research can run up to 60 minutes. Hooks must handle gracefully with progress updates.
- [P03] **Sync vs async API patterns**: Perplexity uses sync, Gemini uses async polling. Different hook patterns required.
- [P03] **Async polling pattern**: Backend uses configurable poll_interval; frontend should match or use independent interval.

### ASCII Reminder
All output files must use ASCII-only characters (0-127).

---

## 9. Testing Strategy

### Unit Tests
- Out of scope for this session (frontend test infrastructure not established per P01 consideration)

### Integration Tests
- Out of scope for this session

### Manual Testing
- Start a Gemini research query via console/devtools
- Verify mutation returns interaction_id
- Verify poll query fires at interval
- Verify poll stops on COMPLETED/FAILED/CANCELLED
- Test cancel mutation stops in-progress job
- Test sync mutation blocks until completion

### Edge Cases
- Start research with only query (minimal request)
- Start research with all optional fields
- Poll with invalid interaction_id (should error)
- Cancel already-completed job (should handle gracefully)
- Network interruption during polling (test reconnection via last_event_id)

---

## 10. Dependencies

### External Libraries
- @tanstack/react-query: ^5.x (already installed)
- zod: ^3.x (already installed)

### Other Sessions
- **Depends on**: phase04-session01-sdk-client-and-navigation, phase04-session02-perplexity-hooks-and-schema
- **Depended by**: phase04-session05-gemini-page-and-components, phase04-session06-save-integration-and-polish

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
