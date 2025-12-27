# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-27
**Project State**: Phase 04 - Deep Research Frontend
**Completed Sessions**: 26

---

## Recommended Next Session

**Session ID**: `phase04-session06-save-integration-and-polish`
**Session Name**: Save Integration and Polish
**Estimated Duration**: 2-3 hours
**Estimated Tasks**: ~20

---

## Why This Session Next?

### Prerequisites Met
- [x] Sessions 04-05 complete (Perplexity and Gemini pages functional)
- [x] useSaveToItems hook available from Phase 02
- [x] Items page with content_type filtering operational

### Dependencies
- **Builds on**: phase04-session05-gemini-page-and-components (Gemini UI complete)
- **Enables**: Phase 04 completion - Deep Research Frontend fully delivered

### Project Progression
This is the **final session of Phase 04** and completes the Deep Research Frontend phase. All prerequisite sessions (01-05) are complete:
- SDK client regenerated with Perplexity/Gemini services
- React Query hooks implemented for both APIs
- Form components with Zod validation built
- Result display components with markdown rendering done
- Progress tracking UI for Gemini async workflow complete
- Navigation integrated

This session ties everything together by adding save functionality and final polish, bringing the project to full MVP completion.

---

## Session Overview

### Objective
Add save to Items functionality for Perplexity and Gemini research results, update the Items page to display and filter new content types, and polish the overall deep research UI.

### Key Deliverables
1. Save button on PerplexityResultView with mapper function
2. Save button on GeminiResultView with mapper function
3. Updated Items page with perplexity/gemini type badges and filters
4. Polished, accessible UI across both research pages

### Scope Summary
- **In Scope (MVP)**: Save buttons, mapper functions, Items page type badges, content_type filter updates, metadata display, loading state polish, error handling consistency, responsiveness testing, accessibility review
- **Out of Scope**: SearchHistory model, rate limiting per user, combined "Research Hub" page

---

## Technical Considerations

### Technologies/Patterns
- useSaveToItems hook (existing from Phase 02)
- Mapper functions following extract/crawl/map patterns
- Type badge variants in Items table
- Sonner toast notifications

### Potential Challenges
- Perplexity response structure differs from Gemini (citations vs outputs)
- Gemini results may have large output arrays requiring selective storage
- Items detail view needs to render varying metadata structures

### Relevant Considerations
- [P02] **Item model extended**: New content_type values ('perplexity', 'gemini') need to be added; metadata JSON field can store citations, usage stats
- [P03] **Sync vs async API patterns**: Already handled in sessions 04-05; save operations use same mutation pattern
- [P03] **Perplexity API latency**: Loading states need review to ensure they're smooth for 30-60s operations
- [P03] **Gemini polling duration**: Ensure save is only enabled when research is complete

---

## Alternative Sessions

If this session is blocked:
1. **None** - This is the only remaining session in Phase 04
2. **Phase 05 planning** - If Phase 04 needs more features, consider planning a new phase

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
