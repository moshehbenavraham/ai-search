# Task Checklist

**Session ID**: `phase02-session02-frontend-hooks-and-save-buttons`
**Total Tasks**: 24
**Estimated Duration**: 8-10 hours
**Created**: 2025-12-22

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0202]` = Session reference (Phase 02, Session 02)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 2 | 2 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 12 | 12 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **24** | **24** | **0** |

---

## Setup (2 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0202] Verify prerequisites: frontend dev server, backend API, ItemsService available (`frontend/src/client/sdk.gen.ts`)
- [x] T002 [S0202] Confirm ItemCreate type has source_url, content, content_type, item_metadata fields (`frontend/src/client/types.gen.ts`)

---

## Foundation (6 tasks)

Core hooks and mapper utilities.

- [x] T003 [S0202] Create useSaveToItems hook with TanStack Query mutation (`frontend/src/hooks/useSaveToItems.ts`)
- [x] T004 [S0202] [P] Implement mapSearchResultToItem mapper function (`frontend/src/lib/tavily-mappers.ts`)
- [x] T005 [S0202] [P] Implement mapExtractResultToItem mapper function (`frontend/src/lib/tavily-mappers.ts`)
- [x] T006 [S0202] [P] Implement mapCrawlResultToItem mapper function (`frontend/src/lib/tavily-mappers.ts`)
- [x] T007 [S0202] [P] Implement mapMapResultsToItem mapper function (`frontend/src/lib/tavily-mappers.ts`)
- [x] T008 [S0202] Add type exports and validate all mappers return ItemCreate (`frontend/src/lib/tavily-mappers.ts`)

---

## Implementation (12 tasks)

Save button integration into all Tavily components.

### Search Components

- [x] T009 [S0202] Add query prop to SearchResultCard interface and component (`frontend/src/components/Tavily/SearchResultCard.tsx`)
- [x] T010 [S0202] Integrate Save button into SearchResultCard footer actions (`frontend/src/components/Tavily/SearchResultCard.tsx`)
- [x] T011 [S0202] Add query prop to SearchResultsList and pass to SearchResultCard (`frontend/src/components/Tavily/SearchResultsList.tsx`)
- [x] T012 [S0202] Add query prop to SearchResultDetail and integrate Save button (`frontend/src/components/Tavily/SearchResultDetail.tsx`)
- [x] T013 [S0202] Update search.tsx to pass query to SearchResultsList and SearchResultDetail (`frontend/src/routes/_layout/search.tsx`)

### Extract Component

- [x] T014 [S0202] Integrate Save button into ExtractResultCard success state actions (`frontend/src/components/Tavily/ExtractResultCard.tsx`)

### Crawl Components

- [x] T015 [S0202] Add baseUrl prop to CrawlResultCard interface and component (`frontend/src/components/Tavily/CrawlResultCard.tsx`)
- [x] T016 [S0202] Integrate Save button into CrawlResultCard actions row (`frontend/src/components/Tavily/CrawlResultCard.tsx`)
- [x] T017 [S0202] Add baseUrl prop to CrawlResultsList and pass to CrawlResultCard (`frontend/src/components/Tavily/CrawlResultsList.tsx`)
- [x] T018 [S0202] Update crawl.tsx to pass baseUrl to CrawlResultsList (`frontend/src/routes/_layout/crawl.tsx`)

### Map Component

- [x] T019 [S0202] Add baseUrl prop to MapResultsList interface (`frontend/src/components/Tavily/MapResultsList.tsx`)
- [x] T020 [S0202] Integrate Save All button into MapResultsList header next to Copy All (`frontend/src/components/Tavily/MapResultsList.tsx`)
- [x] T021 [S0202] Update map.tsx to pass baseUrl to MapResultsList (`frontend/src/routes/_layout/map.tsx`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T022 [S0202] Run lint and type-check, fix any errors (`npm run lint && npm run type-check`)
- [x] T023 [S0202] Manual test: Save search, extract, crawl, and map results; verify in Items page
- [x] T024 [S0202] Validate all files use ASCII encoding (0-127) and Unix LF line endings

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All lint/type-check passing
- [x] All files ASCII-encoded
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T004-T007 (mapper functions) can be implemented simultaneously as they are independent functions in the same file.

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T003 (hook) must complete before T009-T021 (integration tasks)
- T004-T008 (mappers) must complete before T009-T021 (integration tasks)
- T009-T011 must complete before T013 (search page update)
- T015-T017 must complete before T018 (crawl page update)
- T019-T020 must complete before T021 (map page update)

### Key Implementation Details

1. **useSaveToItems hook** should:
   - Use TanStack Query useMutation
   - Call ItemsService.createItem
   - Invalidate items query cache on success
   - Show success/error toasts via sonner

2. **Mapper functions** should:
   - Return ItemCreate type
   - Use try/catch for URL parsing
   - Set correct content_type enum value

3. **Save buttons** should:
   - Disable while isPending
   - Show Loader2 spinner during save
   - Use ghost variant matching existing buttons

---

## Next Steps

Run `/validate` to verify session completeness.
