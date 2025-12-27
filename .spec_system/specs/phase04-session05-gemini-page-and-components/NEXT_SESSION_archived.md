# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-27
**Project State**: Phase 04 - Deep Research Frontend
**Completed Sessions**: 25

---

## Recommended Next Session

**Session ID**: `phase04-session05-gemini-page-and-components`
**Session Name**: Gemini Page and Components
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: ~25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 03 complete (Gemini hooks and schema)
- [x] Zod schema for form validation available
- [x] Navigation items in place (Session 01)
- [x] SDK client regenerated with Gemini services

### Dependencies
- **Builds on**: phase04-session03-gemini-hooks-and-schema (hooks), phase04-session04-perplexity-page-and-components (UI patterns)
- **Enables**: phase04-session06-save-integration-and-polish (save functionality)

### Project Progression
Session 05 is the natural next step as it completes the Gemini frontend integration, mirroring the Perplexity page completed in Session 04. This follows the project's parallel implementation pattern where both deep research APIs get equivalent UI treatment. With the Gemini hooks and schema already in place from Session 03, we have all the data-layer infrastructure needed to build the page and components.

---

## Session Overview

### Objective
Build the Gemini deep research page with form component, async workflow management, progress tracking, result display, and cancel functionality for long-running research jobs.

### Key Deliverables
1. GeminiDeepResearchForm.tsx component with React Hook Form integration
2. GeminiProgressIndicator.tsx showing polling status and elapsed time
3. GeminiCancelButton.tsx for cancelling in-progress research
4. GeminiResultView.tsx for markdown research report display
5. GeminiUsageStats.tsx for token usage display
6. GeminiErrorDisplay.tsx with error state and retry option
7. Complete gemini-research.tsx route page with async state management

### Scope Summary
- **In Scope (MVP)**: Form component, progress indicator, cancel button, result view, usage stats, error display, async workflow state machine (idle -> polling -> complete/error), thinking summaries display, reconnection support
- **Out of Scope**: File search with private stores, follow-up questions with previous_interaction_id, save to Items (Session 06)

---

## Technical Considerations

### Technologies/Patterns
- React Hook Form + Zod for form validation
- TanStack Query for mutations and polling
- useGeminiStartResearch, useGeminiPollResearch, useGeminiCancelResearch hooks
- State machine pattern for async workflow management
- Markdown rendering for research reports
- Elapsed time tracking with intervals

### Potential Challenges
- **Long polling duration**: Gemini research can run up to 60 minutes; UI must gracefully handle extended waits with progress feedback
- **Async state management**: Managing idle -> polling -> complete/error states requires careful state machine design
- **Reconnection support**: Must store interaction_id and last_event_id for reconnection scenarios
- **Thinking summaries**: Conditional display of thinking process when enabled

### Relevant Considerations
- [P03] **Gemini polling duration**: Research jobs can run up to 60 minutes (typical ~20 min). Frontend needs progress indicators and reconnection support via last_event_id.
- [P03] **Sync vs async API patterns**: Perplexity uses synchronous POST, Gemini uses async polling. Frontend must handle both patterns differently.
- [P03] **Async polling pattern (Lesson)**: GeminiService.wait_for_completion() with configurable poll_interval and max_attempts handles long-running jobs gracefully. Polling loop checks terminal status before returning.

---

## Alternative Sessions

If this session is blocked:
1. **phase04-session06-save-integration-and-polish** - Could start save integration for Perplexity results only, but Gemini save would remain incomplete
2. **Return to Phase 03 for additional backend work** - Only if Gemini routes need fixes discovered during frontend work

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
