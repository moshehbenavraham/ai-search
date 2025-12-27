# Session Specification

**Session ID**: `phase04-session05-gemini-page-and-components`
**Phase**: 04 - Deep Research Frontend
**Status**: Not Started
**Created**: 2025-12-27

---

## 1. Session Overview

This session builds the complete Gemini deep research frontend, implementing the user interface for initiating, monitoring, and viewing results from Google Gemini's deep research API. Unlike the synchronous Perplexity integration, Gemini uses an asynchronous polling pattern where research jobs can run up to 60 minutes, requiring careful state management and progress tracking.

The implementation mirrors the structure established in Session 04 (Perplexity page) while adapting to Gemini's unique async workflow. Key challenges include managing the idle -> polling -> complete/error state machine, handling extended wait times with visual feedback, supporting job cancellation, and displaying thinking summaries when enabled.

This session completes the Gemini frontend integration, leaving only the save-to-Items functionality for Session 06. Once complete, users can initiate deep research queries through both Perplexity (synchronous) and Gemini (asynchronous) from the application frontend.

---

## 2. Objectives

1. Create a fully functional Gemini deep research page with form submission and result display
2. Implement async workflow state management (idle -> polling -> complete/error/cancelled)
3. Build progress indicators with elapsed time tracking for long-running jobs (up to 60 min)
4. Enable job cancellation and reconnection support via interaction_id/last_event_id

---

## 3. Prerequisites

### Required Sessions
- [x] `phase04-session01-sdk-client-and-navigation` - SDK regeneration and nav items
- [x] `phase04-session03-gemini-hooks-and-schema` - useGeminiStartResearch, useGeminiPollResearch, useGeminiCancelResearch hooks and Zod schema

### Required Tools/Knowledge
- React Hook Form + Zod pattern from Perplexity implementation
- TanStack Query refetchInterval for polling
- State machine patterns for async workflow

### Environment Requirements
- Frontend dev server running (npm run dev)
- Backend API available with Gemini routes

---

## 4. Scope

### In Scope (MVP)
- GeminiDeepResearchForm.tsx with query input and enable_thinking_summaries toggle
- GeminiProgressIndicator.tsx showing polling status, current status, and elapsed time
- GeminiCancelButton.tsx for cancelling in-progress research
- GeminiResultView.tsx for markdown research report display with thinking summaries
- GeminiUsageStats.tsx for token usage display
- GeminiErrorDisplay.tsx with error state and retry option
- gemini-research.tsx route page with async state machine
- Reconnection support (store interaction_id and last_event_id in state)
- Responsive layout for desktop and mobile

### Out of Scope (Deferred)
- File search with private stores - *Reason: Requires additional backend infrastructure*
- Follow-up questions with previous_interaction_id - *Reason: Deferred to future enhancement*
- Save to Items functionality - *Reason: Session 06 scope*

---

## 5. Technical Approach

### Architecture
The page uses a state machine pattern with states: `idle`, `polling`, `completed`, `failed`, `cancelled`. Form submission triggers `startResearch` mutation which returns an `interaction_id`. This ID enables the polling query which auto-refetches until reaching a terminal status. The cancel mutation can interrupt polling at any time.

```
idle -> [submit] -> polling -> [terminal status] -> completed/failed
                            -> [cancel] -> cancelled
```

### Design Patterns
- **State Machine**: Explicit status tracking for async workflow clarity
- **Polling with Auto-Stop**: TanStack Query refetchInterval returns false on terminal status
- **Component Composition**: Small, focused components assembled in route page
- **Controlled Forms**: React Hook Form with Zod validation

### Technology Stack
- React 19 with TypeScript strict mode
- TanStack Query v5 for mutations and polling
- React Hook Form v7 with Zod resolver
- react-markdown for report rendering
- shadcn/ui components (Card, Button, Form, Checkbox)
- Tailwind CSS for styling

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `frontend/src/components/Gemini/GeminiDeepResearchForm.tsx` | Form with query input and thinking toggle | ~120 |
| `frontend/src/components/Gemini/GeminiProgressIndicator.tsx` | Polling status and elapsed time display | ~80 |
| `frontend/src/components/Gemini/GeminiCancelButton.tsx` | Cancel button with confirmation | ~40 |
| `frontend/src/components/Gemini/GeminiResultView.tsx` | Markdown result display with thinking summaries | ~130 |
| `frontend/src/components/Gemini/GeminiUsageStats.tsx` | Token usage statistics display | ~50 |
| `frontend/src/components/Gemini/GeminiErrorDisplay.tsx` | Error state with retry option | ~50 |
| `frontend/src/components/Gemini/index.ts` | Barrel exports for components | ~10 |
| `frontend/src/routes/_layout/gemini-research.tsx` | Complete page with state management | ~180 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| None expected | - | - |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Form validates query input (required, max 50,000 chars) with Zod schema
- [ ] Start button initiates research and transitions to polling state
- [ ] Progress indicator shows current status (pending/running) and elapsed time
- [ ] Polling automatically stops on COMPLETED, FAILED, or CANCELLED status
- [ ] Cancel button stops in-progress research and updates UI
- [ ] Research report renders as formatted markdown
- [ ] Thinking summaries display in expandable section when present
- [ ] Token usage (input/output/total) visible after completion
- [ ] Errors display with clear message and retry button
- [ ] UI handles jobs running up to 60 minutes gracefully

### Testing Requirements
- [ ] Manual testing: Complete happy path (submit -> poll -> complete)
- [ ] Manual testing: Cancel flow (submit -> poll -> cancel)
- [ ] Manual testing: Error handling (network errors, API errors)
- [ ] Manual testing: Reconnection scenario simulation

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No lint errors (`npm run lint`)
- [ ] Code follows project conventions (CONVENTIONS.md)
- [ ] Components use PascalCase naming
- [ ] Hooks use camelCase with `use` prefix

---

## 8. Implementation Notes

### Key Considerations
- Gemini jobs can run up to 60 minutes; UI must not timeout or lose state
- Store interaction_id in component state for cancel/reconnection
- Store last_event_id from poll responses for reconnection support
- Use 5-second poll interval (DEFAULT_POLL_INTERVAL from hooks)
- Display elapsed time in minutes:seconds format for long jobs

### Potential Challenges
- **Extended polling duration**: Mitigate by showing encouraging messages, elapsed time, and status updates
- **Page refresh during polling**: Store interaction_id in URL params or localStorage for reconnection (future enhancement)
- **Race conditions on cancel**: Disable cancel button immediately on click, handle API response gracefully

### Relevant Considerations
<!-- From CONSIDERATIONS.md -->
- [P03] **Gemini polling duration**: Research jobs can run up to 60 minutes. Progress indicator must track elapsed time and show appropriate messaging.
- [P03] **Sync vs async API patterns**: Unlike Perplexity's synchronous POST, Gemini uses async polling. State machine pattern handles the workflow difference.
- [P03] **Async polling pattern (Lesson)**: Polling loop with terminal status check already implemented in useGeminiPollResearch hook. Frontend integrates via refetchInterval.

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid curly quotes, em-dashes, and other Unicode characters in code and strings.

---

## 9. Testing Strategy

### Unit Tests
- Form validation with invalid/valid inputs (deferred - no frontend test infrastructure)

### Integration Tests
- API integration with mock responses (deferred)

### Manual Testing
- Submit form with valid query, verify polling starts
- Watch progress indicator update status and elapsed time
- Wait for completion, verify result displays with markdown formatting
- Test with enable_thinking_summaries enabled, verify summaries appear
- Submit and cancel mid-polling, verify cancelled state
- Submit with empty query, verify validation error
- Disconnect network during polling, verify error handling
- Test responsive layout on mobile viewport

### Edge Cases
- Empty query submission (should be blocked by validation)
- Very long query (up to 50,000 chars)
- Network disconnect during polling
- API returns error status
- Cancel request fails (network error)
- Multiple rapid form submissions (disable button during pending)

---

## 10. Dependencies

### External Libraries
- `react-markdown`: ^9.x (already installed for Perplexity)
- `react-hook-form`: ^7.x (already installed)
- `zod`: ^3.x (already installed)
- `@hookform/resolvers`: ^3.x (already installed)

### Other Sessions
- **Depends on**:
  - phase04-session01-sdk-client-and-navigation (SDK with Gemini services)
  - phase04-session03-gemini-hooks-and-schema (hooks and Zod schema)
  - phase04-session04-perplexity-page-and-components (UI patterns to mirror)
- **Depended by**:
  - phase04-session06-save-integration-and-polish (save functionality)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
