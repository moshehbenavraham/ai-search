# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-22
**Project State**: Phase 02 - Saving Results to Items
**Completed Sessions**: 13

---

## Recommended Next Session

**Session ID**: `phase02-session02-frontend-hooks-and-save-buttons`
**Session Name**: Frontend Hooks and Save Buttons
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: ~25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 complete - backend model updated and frontend client regenerated
- [x] Frontend TypeScript types include new Item fields (source_url, content, content_type, metadata)
- [x] All Tavily result components exist and are functional (Search, Extract, Crawl, Map)
- [x] Toast notification system (Sonner) configured

### Dependencies
- **Builds on**: phase02-session01-backend-model-and-migration (Item model extended with content fields)
- **Enables**: phase02-session03-items-page-enhancements (needs saved Items to display)

### Project Progression
This is the natural second step in Phase 02's "Saving Results to Items" feature. With the backend model and API schemas updated in Session 01, we now need to implement the frontend plumbing that allows users to actually save Tavily results. This session creates the bridge between the Tavily feature pages and the Items system, enabling the core save workflow that Session 03 will then enhance with better display and filtering.

---

## Session Overview

### Objective
Implement the frontend infrastructure for saving Tavily results to Items, including a reusable useSaveToItems hook, mapper functions for each Tavily result type, and Save buttons integrated into all Tavily result components.

### Key Deliverables
1. **useSaveToItems Hook** - TanStack Query mutation for creating Items with automatic cache invalidation
2. **Mapper Utilities** - Functions to convert SearchResult, ExtractResult, CrawlResult, and MapResults to ItemCreate format
3. **Save Buttons** - Integrated into SearchResultCard, SearchResultDetail, ExtractResultCard, CrawlResultCard, and MapResultsList
4. **UX Polish** - Loading states, success/error toasts, and graceful error handling

### Scope Summary
- **In Scope (MVP)**: useSaveToItems hook, 4 mapper functions, Save buttons on all result components, toast notifications
- **Out of Scope**: Items page UI changes, batch save (except Map), undo functionality, save to collections

---

## Technical Considerations

### Technologies/Patterns
- TanStack Query mutations with queryClient.invalidateQueries
- ItemsService.createItem from regenerated API client
- Sonner toast notifications for feedback
- Lucide icons (Save, Loader2) for button states

### Potential Challenges
- Ensuring mapper functions handle all edge cases (null values, missing fields)
- Correctly typing the ItemCreate interface with new optional fields
- Handling the Map "Save All" operation efficiently (sequential saves vs. optimized approach)
- Preventing duplicate saves if user clicks quickly

---

## Alternative Sessions

If this session is blocked:
1. **phase02-session03-items-page-enhancements** - Could start on display-only enhancements if API issues, but save buttons are needed for full testing
2. **Return to polish** - Could address any outstanding issues from Phase 01 if frontend regeneration failed

---

## Next Steps

Run `/sessionspec` to generate the formal specification with detailed task checklist.
