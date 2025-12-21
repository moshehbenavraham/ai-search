# Session Specification

**Session ID**: `phase01-session03-search-results-display`
**Phase**: 01 - Frontend Integration
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session completes the search feature by implementing the results display layer. Session 02 established the search form and query mutation - users can submit searches and receive responses. This session transforms that raw data into a polished, interactive user experience.

The core work involves creating reusable display components: result cards that show title, URL, snippet, and relevance score; a container component for rendering result lists; a detail dialog for viewing full content including raw_content when available; and skeleton loading states for visual feedback during API calls.

These components establish patterns that will be reused across the extract, crawl, and map pages. The SearchResultCard pattern directly applies to ExtractResultCard and CrawlResultCard. The skeleton and empty state patterns apply universally. Completing this session delivers a fully functional search feature end-to-end.

---

## 2. Objectives

1. Display search results in visually appealing, responsive result cards showing title, URL, snippet, score, and metadata
2. Implement a detail view dialog for viewing full content and raw_content when available
3. Provide proper loading states (skeleton), empty states, and error handling
4. Enable users to open result URLs in new browser tabs

---

## 3. Prerequisites

### Required Sessions
- [x] `phase01-session01-api-client-and-navigation` - API client with SearchResponse/SearchResult types
- [x] `phase01-session02-search-form-and-query` - Search form and useTavilySearch mutation hook

### Required Tools/Knowledge
- React 19 with TypeScript
- TanStack Query mutation states (isPending, isError, data)
- shadcn/ui component patterns (Card, Dialog, Badge, Skeleton)
- Tailwind CSS responsive design

### Environment Requirements
- Frontend dev server running (npm run dev)
- Backend API accessible with valid authentication
- Valid Tavily API key configured in backend

---

## 4. Scope

### In Scope (MVP)
- SearchResultCard component displaying title, URL (truncated), snippet, score badge
- SearchResultsList container component for rendering multiple results
- SearchResultDetail dialog showing full content and raw_content
- SearchSkeleton component for loading state
- Empty state UI when no results found
- Response metadata display (query, result count)
- "Open in new tab" button for result URLs
- AI answer display when include_answer was true
- Image results display when include_images was true

### Out of Scope (Deferred)
- Result caching - *Reason: Listed as deferred in PRD*
- Search history - *Reason: Listed as deferred in PRD*
- Infinite scroll or virtualization - *Reason: Simple display sufficient for MVP*
- Pagination - *Reason: max_results caps at 20, no pagination needed*

---

## 5. Technical Approach

### Architecture

```
SearchPage (route)
  |-- SearchForm (existing)
  |-- SearchResultsContainer (new)
        |-- SearchSkeleton (loading state)
        |-- EmptyState (no results)
        |-- SearchMetadata (query info, answer)
        |-- SearchResultsList
              |-- SearchResultCard (x N)
                    |-- onClick -> SearchResultDetail (dialog)
        |-- SearchImageGrid (if images present)
```

### Design Patterns
- **Compound Components**: SearchResultsList manages layout, cards handle individual display
- **Controlled Dialog**: Parent manages open state for detail dialog
- **Conditional Rendering**: Handle loading/empty/error/success states
- **Props Drilling Minimization**: Use callbacks for actions (onOpenDetail, onOpenUrl)

### Technology Stack
- React 19.0.0 with TypeScript
- shadcn/ui: Card, Dialog, DialogContent, DialogHeader, Badge, Button, Skeleton
- Tailwind CSS for responsive grid layouts
- Lucide React: ExternalLink, Clock, Globe, Search, FileText icons

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `frontend/src/components/Tavily/SearchResultCard.tsx` | Individual result display with title, URL, snippet, score | ~80 |
| `frontend/src/components/Tavily/SearchResultsList.tsx` | Container for rendering result cards in grid | ~40 |
| `frontend/src/components/Tavily/SearchResultDetail.tsx` | Dialog for full content view | ~100 |
| `frontend/src/components/Tavily/SearchSkeleton.tsx` | Loading skeleton for search results | ~50 |
| `frontend/src/components/Tavily/SearchEmptyState.tsx` | Empty state when no results | ~30 |
| `frontend/src/components/Tavily/SearchMetadata.tsx` | Response metadata and AI answer display | ~60 |
| `frontend/src/components/Tavily/SearchImageGrid.tsx` | Grid display for image results | ~50 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|------------|
| `frontend/src/routes/_layout/search.tsx` | Integrate all results components, handle states | ~80 |
| `frontend/src/components/Tavily/SearchForm.tsx` | Pass mutation object for loading state access | ~10 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Search results display correctly after form submission
- [ ] Each result shows title, URL (truncated to ~50 chars), snippet, and score badge
- [ ] Clicking a result card opens detail dialog with full content
- [ ] Detail dialog shows raw_content in scrollable container when available
- [ ] "Open in New Tab" button opens result URL in new browser tab
- [ ] Skeleton loading state shown while search is pending
- [ ] Empty state shown when search returns zero results
- [ ] AI answer displays prominently when include_answer was true
- [ ] Image grid displays when include_images was true

### Testing Requirements
- [ ] Manual testing of all states (loading, empty, results, error)
- [ ] Test with various result counts (1, 5, 10, 20)
- [ ] Test result card click opens correct detail
- [ ] Test external link opens in new tab
- [ ] Test responsive layout on mobile and desktop widths

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Code follows existing project conventions (see SearchForm.tsx)
- [ ] Consistent with shadcn/ui component usage patterns

---

## 8. Implementation Notes

### Key Considerations
- SearchResult.score is a float (0-1), display as percentage or decimal
- SearchResult.raw_content can be very long (10k+ chars), use max-height with overflow
- Not all results have raw_content - only when include_raw_content=true in request
- URL truncation should preserve domain visibility
- Score badge color should reflect relevance (green high, yellow medium)

### Potential Challenges
- **Long raw_content**: Use prose max-w with overflow-y-auto and max-h-[60vh]
- **Missing fields**: raw_content is optional, handle null/undefined gracefully
- **Responsive grid**: 1 column mobile, 2 columns tablet, 3 columns desktop
- **Dialog scrolling**: Content may exceed viewport, use ScrollArea or native scroll

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No fancy quotes, no em-dashes, no special Unicode.

---

## 9. Testing Strategy

### Unit Tests
- Not required for this session (UI components)

### Integration Tests
- Not required for this session (manual testing sufficient)

### Manual Testing

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Basic search | Enter query, submit | Results display in cards |
| Empty results | Search nonsense query | Empty state message shown |
| Loading state | Submit search, observe | Skeleton shown during load |
| Detail view | Click result card | Dialog opens with full content |
| External link | Click "Open in New Tab" | URL opens in new browser tab |
| With answer | Enable "Include AI Answer" | Answer displays above results |
| With images | Enable "Include Images" | Image grid displays |
| Responsive | Resize browser | Grid adapts to viewport width |

### Edge Cases
- Search with 0 results
- Search with 1 result (no grid, single card)
- Result with no raw_content
- Very long title (should truncate)
- Very long snippet (should show first ~200 chars)
- Result with special characters in title/content

---

## 10. Dependencies

### External Libraries
- `@radix-ui/react-dialog`: ^1.1.4 (via shadcn/ui)
- `lucide-react`: ^0.468.0
- `tailwind-merge`: ^2.6.0 (via cn utility)

### Other Sessions
- **Depends on**: phase01-session01-api-client-and-navigation, phase01-session02-search-form-and-query
- **Depended by**: None directly, but establishes patterns for phase01-session04, 05, 06

---

## Type Reference

```typescript
// From frontend/src/client/types.gen.ts
export type SearchResponse = {
  query: string;
  results?: Array<SearchResult>;
  answer?: string | null;
  images?: Array<SearchImage>;
};

export type SearchResult = {
  url: string;
  title: string;
  content: string;      // snippet
  score: number;        // 0-1 relevance
  raw_content?: string | null;
};

export type SearchImage = {
  url: string;
  description?: string | null;
};
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
