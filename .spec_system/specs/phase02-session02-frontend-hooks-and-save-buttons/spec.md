# Session Specification

**Session ID**: `phase02-session02-frontend-hooks-and-save-buttons`
**Phase**: 02 - Saving Results to Items
**Status**: Not Started
**Created**: 2025-12-22

---

## 1. Session Overview

This session implements the frontend infrastructure that enables users to save Tavily search, extract, crawl, and map results to the Items system. With the backend model already extended in Session 01 to include `source_url`, `content`, `content_type`, and `item_metadata` fields, we now build the client-side components that bridge Tavily features with persistent storage.

The implementation follows a layered approach: first creating a reusable `useSaveToItems` TanStack Query mutation hook, then building mapper utilities that transform each Tavily result type into the ItemCreate format, and finally integrating Save buttons into all existing result display components. This pattern ensures consistency, reusability, and maintainability across all Tavily features.

The session delivers immediate user value by enabling one-click saving of any result, with proper loading states, success/error feedback via toast notifications, and automatic cache invalidation to keep the Items list current. This establishes the foundation for Session 03's Items page enhancements.

---

## 2. Objectives

1. Create a reusable `useSaveToItems` hook that handles Item creation via TanStack Query mutation with cache invalidation
2. Implement mapper utilities that correctly transform each Tavily result type (search, extract, crawl, map) to ItemCreate format
3. Integrate Save buttons into all Tavily result components (SearchResultCard, SearchResultDetail, ExtractResultCard, CrawlResultCard, MapResultsList)
4. Provide consistent UX with loading spinners, success toasts, and error handling across all save operations

---

## 3. Prerequisites

### Required Sessions
- [x] `phase02-session01-backend-model-and-migration` - Extended Item model with source_url, content, content_type, item_metadata fields; regenerated frontend client

### Required Tools/Knowledge
- TanStack Query mutation patterns
- TypeScript generics and type inference
- URL parsing with JavaScript URL API
- shadcn/ui Button component patterns

### Environment Requirements
- Frontend dev server running (`npm run dev`)
- Backend API running with updated Item endpoints
- Valid user authentication for testing

---

## 4. Scope

### In Scope (MVP)
- `useSaveToItems` TanStack Query mutation hook with optimistic UX
- `mapSearchResultToItem(result, query)` mapper function
- `mapExtractResultToItem(result)` mapper function
- `mapCrawlResultToItem(result, baseUrl, index)` mapper function
- `mapMapResultsToItem(urls, baseUrl)` mapper function
- Save button on SearchResultCard (individual search results)
- Save button on SearchResultDetail dialog
- Save button on ExtractResultCard (success state only)
- Save button on CrawlResultCard
- Save All button on MapResultsList
- Loading spinner during save operations
- Success/error toast notifications
- Query cache invalidation after successful save

### Out of Scope (Deferred)
- Items page UI changes - *Session 03*
- Batch save for search/extract/crawl results - *Future enhancement*
- Undo save functionality - *Complexity vs. value*
- Save to specific collection/folder - *No collections feature yet*
- Duplicate detection before save - *Nice-to-have, not MVP*

---

## 5. Technical Approach

### Architecture

```
User clicks Save -> Component calls mapper -> useSaveToItems.mutate(item)
                                                     |
                                                     v
                                        ItemsService.createItem()
                                                     |
                              +-----------+----------+----------+
                              |                                 |
                         onSuccess                         onError
                              |                                 |
                    invalidate queries              toast.error()
                    toast.success()
```

### Design Patterns
- **Custom Hook Pattern**: Encapsulate mutation logic in `useSaveToItems` for reuse
- **Mapper Pattern**: Pure functions to transform Tavily types to Item format
- **Composition**: Pass mapped item to hook, not raw result data

### Technology Stack
- TanStack Query v5 - `useMutation`, `useQueryClient`
- Sonner - Toast notifications (already configured)
- Lucide React - Save, Loader2 icons
- TypeScript - Full type safety with ItemCreate

---

## 6. Deliverables

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|------------|
| `frontend/src/hooks/useSaveToItems.ts` | TanStack Query mutation hook for creating Items | ~30 |
| `frontend/src/lib/tavily-mappers.ts` | Mapper functions for all Tavily result types | ~80 |

### Files to Modify

| File | Changes | Est. Lines Changed |
|------|---------|------------|
| `frontend/src/components/Tavily/SearchResultCard.tsx` | Add Save button to footer actions | ~25 |
| `frontend/src/components/Tavily/SearchResultDetail.tsx` | Add Save button to dialog footer | ~20 |
| `frontend/src/components/Tavily/ExtractResultCard.tsx` | Add Save button to success state actions | ~25 |
| `frontend/src/components/Tavily/CrawlResultCard.tsx` | Add Save button to actions row | ~25 |
| `frontend/src/components/Tavily/MapResultsList.tsx` | Add Save All button next to Copy All | ~30 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] useSaveToItems hook exports mutate, isPending, isSuccess, isError
- [ ] mapSearchResultToItem correctly maps title, url, content, score, query
- [ ] mapExtractResultToItem correctly maps domain, url, raw_content, images
- [ ] mapCrawlResultToItem correctly maps path, url, raw_content, base_url, index
- [ ] mapMapResultsToItem correctly maps domain, base_url, JSON urls array, count
- [ ] Save button appears on SearchResultCard between "Visit site" and "View details"
- [ ] Save button appears on SearchResultDetail dialog footer
- [ ] Save button appears on ExtractResultCard success state actions
- [ ] Save button appears on CrawlResultCard actions row
- [ ] Save All button appears on MapResultsList header next to Copy All
- [ ] Clicking Save creates an Item via API with correct data
- [ ] Save button shows Loader2 spinner while isPending
- [ ] Success toast "Saved to Items" shown after save completes
- [ ] Error toast "Failed to save item" shown if save fails
- [ ] Items query cache invalidated after successful save

### Testing Requirements
- [ ] Manual test: Save search result -> verify in Items page
- [ ] Manual test: Save extract result -> verify in Items page
- [ ] Manual test: Save crawl result -> verify in Items page
- [ ] Manual test: Save All map results -> verify in Items page
- [ ] Manual test: Verify loading spinner appears during save
- [ ] Manual test: Verify toast notifications appear

### Quality Gates
- [ ] `npm run lint` passes with no errors
- [ ] `npm run type-check` passes with no errors
- [ ] All files use ASCII-only characters (0-127)
- [ ] Unix LF line endings throughout
- [ ] No console.log statements in production code (except error handler)
- [ ] Consistent code style with existing components

---

## 8. Implementation Notes

### Key Considerations

1. **ItemCreate field naming**: The backend uses `item_metadata` not `metadata` - mappers must use correct field name
2. **content_type enum**: Must be exactly `'search' | 'extract' | 'crawl' | 'map'` to match backend
3. **URL parsing safety**: Use try/catch when parsing URLs in mappers to handle malformed URLs gracefully
4. **SearchResultCard needs query**: The mapper needs the original search query, so SearchResultCard must receive it as a prop or from context
5. **CrawlResultCard needs baseUrl**: Already receives `index`, also needs `baseUrl` prop for the mapper
6. **MapResultsList needs baseUrl**: Must receive `baseUrl` prop for the mapper

### Potential Challenges

- **Query context for SearchResultCard**: May need to pass query as prop from parent SearchResultsList or route
  - *Mitigation*: Check how SearchResultsList is structured; add query prop if needed
- **Rapid clicking**: User may click Save multiple times quickly
  - *Mitigation*: Disable button while isPending is true
- **Large Map results**: Saving many URLs as JSON could be large
  - *Mitigation*: JSON.stringify with indentation is fine; content field has no limit

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid special quotes, em-dashes, and non-ASCII symbols.

---

## 9. Testing Strategy

### Unit Tests
Not required for this session - focus on manual integration testing

### Integration Tests
Not required for this session

### Manual Testing

1. **Search Save Flow**
   - Perform a search
   - Click Save on a result card
   - Verify spinner appears
   - Verify success toast
   - Navigate to Items page
   - Verify item appears with content_type "search"

2. **Extract Save Flow**
   - Extract a URL
   - Click Save on result card (success state)
   - Verify item saved with content_type "extract"

3. **Crawl Save Flow**
   - Crawl a website
   - Click Save on a result card
   - Verify item saved with content_type "crawl"

4. **Map Save All Flow**
   - Map a website
   - Click Save All button
   - Verify item saved with content_type "map"
   - Verify content contains JSON array of URLs

5. **Error Handling**
   - Disable network or logout
   - Try to save
   - Verify error toast appears

### Edge Cases
- [ ] Save result with very long title (should truncate description)
- [ ] Save result with null/undefined raw_content
- [ ] Save extract result with no images array
- [ ] Map with single URL vs. many URLs

---

## 10. Dependencies

### External Libraries
- `@tanstack/react-query` - v5.x (already installed)
- `sonner` - v1.x (already installed)
- `lucide-react` - (already installed)

### Internal Dependencies
- `@/client` - ItemsService, ItemCreate, SearchResult, ExtractResult, CrawlResult types
- `@/components/ui/button` - Button component
- `@/lib/utils` - cn utility (if needed)

### Other Sessions
- **Depends on**: `phase02-session01-backend-model-and-migration` (complete)
- **Depended by**: `phase02-session03-items-page-enhancements` (Items page display)

---

## 11. Component Props Changes

### SearchResultCard
```typescript
interface SearchResultCardProps {
  result: SearchResult
  query: string  // NEW: needed for mapper
  onClick?: () => void
}
```

### SearchResultDetail
```typescript
interface SearchResultDetailProps {
  result: SearchResult | null
  query: string  // NEW: needed for mapper
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

### CrawlResultCard
```typescript
interface CrawlResultCardProps {
  result: CrawlResult
  index: number
  baseUrl: string  // NEW: needed for mapper
}
```

### MapResultsList
```typescript
interface MapResultsListProps {
  urls: string[]
  baseUrl: string  // NEW: needed for mapper
}
```

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
