# Task Checklist

**Session ID**: `phase02-session03-items-page-enhancements`
**Total Tasks**: 22
**Estimated Duration**: 7-9 hours
**Created**: 2025-12-22

---

## Legend

- `[x]` = Completed
- `[ ]` = Pending
- `[P]` = Parallelizable (can run with other [P] tasks)
- `[S0203]` = Session reference (Phase 02, Session 03)
- `TNNN` = Task ID

---

## Progress Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Setup | 2 | 2 | 0 |
| Foundation | 6 | 6 | 0 |
| Implementation | 10 | 10 | 0 |
| Testing | 4 | 4 | 0 |
| **Total** | **22** | **22** | **0** |

---

## Setup (2 tasks)

Initial configuration and environment preparation.

- [x] T001 [S0203] Verify prerequisites - confirm frontend/backend servers run, test Items exist (`backend/app/api/routes/items.py`, `frontend/src/routes/_layout/items.tsx`)
- [x] T002 [S0203] Verify shadcn/ui components available - Badge, Select, Tooltip, Collapsible (`frontend/src/components/ui/`)

---

## Foundation (6 tasks)

Create new reusable components for Items page.

- [x] T003 [S0203] [P] Create ContentTypeBadge component with color-coded variants (`frontend/src/components/Items/ContentTypeBadge.tsx`)
- [x] T004 [S0203] [P] Create SourceUrlCell component with truncation and tooltip (`frontend/src/components/Items/SourceUrlCell.tsx`)
- [x] T005 [S0203] [P] Create ContentTypeFilter dropdown component (`frontend/src/components/Items/ContentTypeFilter.tsx`)
- [x] T006 [S0203] [P] Create ContentPreview component with collapsible long content (`frontend/src/components/Items/ContentPreview.tsx`)
- [x] T007 [S0203] [P] Create MetadataDisplay component for formatted JSON (`frontend/src/components/Items/MetadataDisplay.tsx`)
- [x] T008 [S0203] Verify ItemPublic type includes content_type, source_url, content, item_metadata fields (`frontend/src/client/`)

---

## Implementation (10 tasks)

Main feature integration and backend updates.

- [x] T009 [S0203] Add content_type query parameter to backend read_items endpoint (`backend/app/api/routes/items.py`)
- [x] T010 [S0203] Regenerate OpenAPI client to include new content_type parameter (`frontend/src/client/`)
- [x] T011 [S0203] Add content_type column to Items table using ContentTypeBadge (`frontend/src/components/Items/columns.tsx`)
- [x] T012 [S0203] Add source_url column to Items table using SourceUrlCell (`frontend/src/components/Items/columns.tsx`)
- [x] T013 [S0203] Add URL search params type for content_type filter (`frontend/src/routes/_layout/items.tsx`)
- [x] T014 [S0203] Add ContentTypeFilter dropdown to Items page toolbar (`frontend/src/routes/_layout/items.tsx`)
- [x] T015 [S0203] Update getItemsQueryOptions to include content_type filter parameter (`frontend/src/routes/_layout/items.tsx`)
- [x] T016 [S0203] Add ContentPreview section to EditItem dialog (`frontend/src/components/Items/EditItem.tsx`)
- [x] T017 [S0203] Add MetadataDisplay section to EditItem dialog (`frontend/src/components/Items/EditItem.tsx`)
- [x] T018 [S0203] Handle legacy Items gracefully - null content_type and source_url display (`frontend/src/components/Items/columns.tsx`)

---

## Testing (4 tasks)

Verification and quality assurance.

- [x] T019 [S0203] Run TypeScript type-check and fix any errors (`npm run type-check`)
- [x] T020 [S0203] Run ESLint and fix any warnings/errors (`npm run lint`)
- [x] T021 [S0203] Run frontend build and verify success (`npm run build`)
- [x] T022 [S0203] Manual testing - verify all badge colors, URL truncation, filter dropdown, content preview, metadata display, legacy Items handling

---

## Completion Checklist

Before marking session complete:

- [x] All tasks marked `[x]`
- [x] All tests passing
- [x] All files ASCII-encoded
- [x] implementation-notes.md updated
- [x] Ready for `/validate`

---

## Notes

### Parallelization
Tasks T003-T007 (Foundation) can all be worked on simultaneously as they create independent component files.

### Task Timing
Target ~20-25 minutes per task.

### Dependencies
- T003-T007 have no interdependencies (parallel)
- T008 must be verified before T011-T018
- T009 must complete before T010
- T010 must complete before T015
- T011-T012 depend on T003-T004 respectively
- T014-T015 depend on T005 and T010
- T016-T017 depend on T006-T007 respectively
- T019-T022 depend on all implementation tasks

### Component Color Scheme
- search = blue (`bg-blue-100 text-blue-800`)
- extract = green (`bg-green-100 text-green-800`)
- crawl = orange (`bg-orange-100 text-orange-800`)
- map = purple (`bg-purple-100 text-purple-800`)
- null/legacy = gray (`bg-gray-100 text-gray-600`)

### URL Truncation
- Max visible characters: 40
- Show full URL in tooltip on hover
- Include ExternalLink icon from lucide-react

---

## Next Steps

Run `/validate` to verify session completeness.
