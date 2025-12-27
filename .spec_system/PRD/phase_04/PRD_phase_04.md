# PRD Phase 04: Deep Research Frontend

**Status**: In Progress
**Sessions**: 6 (initial estimate)
**Estimated Duration**: 3-5 days

**Progress**: 3/6 sessions (50%)

---

## Overview

Phase 04 implements the frontend user interface for Perplexity Sonar and Google Gemini deep research features. This phase builds React pages with forms, result displays, and async workflow management, integrating with the backend services created in Phase 03.

---

## Progress Tracker

| Session | Name | Status | Est. Tasks | Validated |
|---------|------|--------|------------|-----------|
| 01 | SDK Client and Navigation | Complete | 20 | 2025-12-27 |
| 02 | Perplexity Hooks and Schema | Complete | 18 | 2025-12-27 |
| 03 | Gemini Hooks and Schema | Complete | 22 | 2025-12-27 |
| 04 | Perplexity Page and Components | Not Started | ~25 | - |
| 05 | Gemini Page and Components | Not Started | ~25 | - |
| 06 | Save Integration and Polish | Not Started | ~20 | - |

---

## Completed Sessions

- Session 01: SDK Client and Navigation (2025-12-27)
- Session 02: Perplexity Hooks and Schema (2025-12-27)
- Session 03: Gemini Hooks and Schema (2025-12-27)

---

## Upcoming Sessions

- Session 04: Perplexity Page and Components

---

## Objectives

1. Regenerate SDK client with new Perplexity and Gemini services
2. Create React Query hooks for both APIs (mutations and polling)
3. Build form components with Zod validation
4. Implement result display components with markdown rendering
5. Create progress tracking UI for Gemini async workflow
6. Add navigation and integrate with existing patterns
7. Enable saving deep research results to Items

---

## Prerequisites

- Phase 03 completed (Deep Research Backend)
- Perplexity and Gemini backend routes functional
- Backend OpenAPI spec up to date
- Node.js development environment configured

---

## Technical Considerations

### Architecture
- Perplexity: Synchronous API - single mutation with loading state
- Gemini: Asynchronous API - start mutation + polling query + cancel mutation
- Both need proper error boundaries and retry mechanisms

### Technologies
- TanStack Router for file-based routing
- TanStack Query for data fetching and caching
- React Hook Form + Zod for form validation
- shadcn/ui for accessible components
- react-markdown or similar for rendering research reports

### Risks
- **Gemini Polling Complexity**: Long-running jobs (up to 60 min) require robust polling with reconnection support
- **Large Response Rendering**: Research reports can be extensive; need virtualization or pagination
- **Network Interruptions**: Must support reconnection via last_event_id for Gemini polling
- **Rate Limit UX**: Frontend must gracefully handle 429 errors with user feedback

### Relevant Considerations
<!-- From CONSIDERATIONS.md -->
- [P03] **Perplexity API latency**: Deep research takes 30-60 seconds. Implement clear loading states with elapsed time indicators.
- [P03] **Gemini polling duration**: Jobs can run up to 60 minutes. Progress indicators and reconnection support via last_event_id are critical.
- [P03] **Sync vs async API patterns**: Frontend must handle both patterns differently - Perplexity as simple mutation, Gemini as start/poll/cancel workflow.
- [P02] **Item model extended**: Add 'perplexity' and 'gemini' as new content_type values when saving results.
- [P01] **TanStack Router + Query pattern**: Use queryOptions pattern for reusable query configurations.
- [P01] **React Hook Form + Zod**: Maintain form handling pattern established in previous phases.

---

## Success Criteria

Phase complete when:
- [ ] All 6 sessions completed
- [ ] SDK client regenerated with Perplexity and Gemini services
- [ ] usePerplexityDeepResearch hook functional
- [ ] useGeminiStartResearch, useGeminiPollResearch, useGeminiCancelResearch hooks functional
- [ ] Perplexity form validates input and displays results with citations
- [ ] Gemini form starts research, shows progress, allows cancellation
- [ ] Gemini polling stops automatically on completion or failure
- [ ] Loading states and errors displayed appropriately
- [ ] Navigation items added to sidebar
- [ ] UI is responsive on desktop and mobile
- [ ] Save to Items functional for both research types
- [ ] No lint errors or type check failures

---

## Dependencies

### Depends On
- Phase 03: Deep Research Backend

### Enables
- Future phases: SearchHistory, enhanced research features, combined Research Hub
