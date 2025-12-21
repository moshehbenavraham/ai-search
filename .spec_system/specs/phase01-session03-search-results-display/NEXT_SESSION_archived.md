# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-21
**Project State**: Phase 01 - Frontend Integration
**Completed Sessions**: 8 (6 backend + 2 frontend)

---

## Recommended Next Session

**Session ID**: `phase01-session03-search-results-display`
**Session Name**: Search Results Display
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: ~25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 02 completed (search form and mutation working)
- [x] Search API returning results successfully
- [x] API client generated with proper types
- [x] Navigation and routing structure in place

### Dependencies
- **Builds on**: phase01-session02-search-form-and-query (search form submits queries successfully)
- **Enables**: Full search feature completion, establishes component patterns for extract/crawl/map pages

### Project Progression

This is the natural continuation of the search feature implementation. Session 02 established the search form and query mutation - users can now submit searches. Session 03 completes the user experience by displaying those results in a polished, interactive UI. The component patterns established here (result cards, detail views, skeleton loading, empty states) will be reused across the extract, crawl, and map pages in subsequent sessions.

---

## Session Overview

### Objective

Implement the search results display components including result cards, detail views, and proper handling of loading/empty/error states.

### Key Deliverables
1. **SearchResultCard.tsx** - Individual result display with title, URL, snippet, score, published date
2. **SearchResultsList.tsx** - Container component for rendering multiple results
3. **SearchResultDetail.tsx** - Dialog/sheet component for viewing full content and raw_content
4. **SearchSkeleton.tsx** - Loading skeleton state during search execution
5. **Updated /search route** - Complete integration of all display components

### Scope Summary
- **In Scope (MVP)**: Result cards, results list, detail dialog, skeleton loading, empty state, error handling, "open in new tab" action, response metadata display
- **Out of Scope**: Result caching, search history, infinite scroll

---

## Technical Considerations

### Technologies/Patterns
- shadcn/ui components (Card, Dialog/Sheet, Button, Badge)
- TanStack Query mutation state (`isPending`, `isError`, `data`)
- Tailwind CSS for responsive layouts
- Lucide React icons (ExternalLink, Clock, Globe)
- Zod validation (URL validation for external links)

### Component Patterns
```
SearchResultCard:
  - Title (link to detail view)
  - URL (truncated, clickable)
  - Snippet (preview text)
  - Score badge (if available)
  - Published date (formatted)

SearchResultDetail:
  - Full title and URL
  - Complete snippet
  - raw_content (if include_raw_content was true)
  - "Open in New Tab" button
```

### Potential Challenges
- **Long content handling**: raw_content can be very long; need scrollable container
- **Missing fields**: Not all results have score or published_date; handle gracefully
- **Responsive design**: Results should display well on mobile and desktop
- **Performance**: Large result sets may need virtualization (future consideration)

---

## Alternative Sessions

If this session is blocked:
1. **phase01-session04-extract-page** - Independent of search results; only needs Session 01 (API client)
2. **phase01-session05-crawl-page** - Also independent; only needs Session 01

However, completing Session 03 first is recommended because:
- It finishes the search feature end-to-end
- The component patterns will be reused in other pages
- Natural user flow (complete one feature before starting another)

---

## Success Criteria

- [ ] Search results display correctly after form submission
- [ ] Each result shows title, URL, snippet, and score
- [ ] Clicking result opens detail view with full content
- [ ] Skeleton shown while search is loading
- [ ] Empty state shown when no results found
- [ ] Error state handled gracefully
- [ ] Results are visually appealing and consistent with app design
- [ ] No TypeScript errors or lint warnings

---

## Next Steps

Run `/sessionspec` to generate the formal specification with detailed task breakdown.
