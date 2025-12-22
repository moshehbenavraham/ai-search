# Session Specification

**Session ID**: `phase02-session03-items-page-enhancements`
**Phase**: 02 - Saving Results to Items
**Status**: Not Started
**Created**: 2025-12-22

---

## 1. Session Overview

This session enhances the Items page to properly display and filter saved Tavily results. With Sessions 01 and 02 complete, users can now save search, extract, crawl, and map results to their Items collection. However, the current Items table only displays the basic title, description, and ID columns - it lacks visibility into what type of content was saved and where it came from.

This session adds a content type badge column with color-coded badges (search=blue, extract=green, crawl=orange, map=purple), a source URL column with clickable external links and URL truncation with tooltips, and a content type filter dropdown in the toolbar. The backend will be updated to support filtering by content_type parameter. Additionally, Item detail views will be enhanced to show content preview and formatted metadata.

Completing this session marks Phase 02 and the entire MVP as feature-complete. Users will have full visibility into their saved Tavily results with the ability to filter, view source links, and inspect content details.

---

## 2. Objectives

1. Add content type badge and source URL columns to the Items table
2. Implement content type filter dropdown with backend query support
3. Enhance Item detail view with content preview and metadata display
4. Ensure graceful handling of legacy Items (those without Tavily fields)

---

## 3. Prerequisites

### Required Sessions
- [x] `phase02-session01-backend-model-and-migration` - Item model has source_url, content, content_type, item_metadata fields
- [x] `phase02-session02-frontend-hooks-and-save-buttons` - Save functionality works, Items can be created with Tavily data

### Required Tools/Knowledge
- React 19, TypeScript, TanStack Router/Query patterns
- shadcn/ui components (Badge, Select, Tooltip)
- FastAPI/SQLModel query filtering

### Environment Requirements
- Frontend development server running
- Backend API server with database migration applied
- Test Items saved from Tavily operations (or ability to create them)

---

## 4. Scope

### In Scope (MVP)
- Content type badge column with color-coded badges
- Source URL column with truncation, tooltips, and external link icon
- Content type filter dropdown in Items page toolbar
- Backend content_type filter parameter on GET /items
- Content preview in Item detail/edit dialog
- Metadata display in Item detail/edit dialog
- Graceful null handling for legacy Items

### Out of Scope (Deferred)
- Full-text search on content - *Reason: Complex feature for later phase*
- Content editing - *Reason: Out of MVP scope*
- Bulk operations on Items - *Reason: Out of MVP scope*
- Export functionality - *Reason: Out of MVP scope*
- Content type statistics/analytics - *Reason: Polish feature*

---

## 5. Technical Approach

### Architecture
The implementation follows existing patterns in the codebase:
- New column definitions added to `columns.tsx` using TanStack Table
- Filter state managed via URL search params for shareable filtered views
- Backend filtering via optional query parameter passed through OpenAPI client
- Detail view enhancements in existing EditItem dialog component

### Design Patterns
- **Component Composition**: Small, focused components (ContentTypeBadge, SourceUrlCell, ContentTypeFilter)
- **URL State**: Filter state in URL params via TanStack Router for bookmarkable filters
- **Query Invalidation**: TanStack Query cache invalidation on filter change
- **Graceful Degradation**: Null-safe rendering for legacy Items without Tavily fields

### Technology Stack
- React 19, TypeScript
- TanStack Router (search params), TanStack Query (data fetching)
- shadcn/ui: Badge, Select, Tooltip, Button components
- Lucide React: ExternalLink icon
- FastAPI: Query parameter filtering
- SQLModel: .where() clause for filtering

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `frontend/src/components/Items/ContentTypeBadge.tsx` | Color-coded badge component | ~25 |
| `frontend/src/components/Items/SourceUrlCell.tsx` | URL cell with truncation/tooltip | ~35 |
| `frontend/src/components/Items/ContentTypeFilter.tsx` | Filter dropdown component | ~40 |
| `frontend/src/components/Items/ContentPreview.tsx` | Collapsible content preview | ~40 |
| `frontend/src/components/Items/MetadataDisplay.tsx` | Formatted JSON metadata view | ~35 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `frontend/src/components/Items/columns.tsx` | Add content_type and source_url columns | +30 |
| `frontend/src/routes/_layout/items.tsx` | Add filter dropdown, pass filter to query | +25 |
| `frontend/src/components/Items/EditItem.tsx` | Add content preview and metadata sections | +30 |
| `backend/app/api/routes/items.py` | Add content_type query parameter to read_items | +10 |
| `frontend/src/client/*` | Regenerate client (automated) | ~0 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Content type badge column displays in Items table
- [ ] Badges are color-coded: search=blue, extract=green, crawl=orange, map=purple
- [ ] Source URL column displays with external link icon
- [ ] Long URLs (>40 chars) are truncated with tooltip showing full URL
- [ ] Content type filter dropdown appears in toolbar
- [ ] Selecting a filter updates the displayed Items immediately
- [ ] Backend filters Items by content_type correctly
- [ ] Item edit dialog shows content preview (collapsible for long content)
- [ ] Item edit dialog shows formatted metadata
- [ ] Legacy Items (no content_type) display correctly without errors
- [ ] Items without source_url show dash or empty cell

### Testing Requirements
- [ ] Manual testing of all filter options
- [ ] Manual testing with legacy Items (null content_type)
- [ ] Verify external links open in new tab with rel="noopener noreferrer"
- [ ] Test tooltip appears on URL hover

### Quality Gates
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No lint errors (`npm run lint`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend passes tests (`pytest`)
- [ ] OpenAPI client regenerated after backend changes
- [ ] All files ASCII-encoded
- [ ] Unix LF line endings

---

## 8. Implementation Notes

### Key Considerations
- URL truncation at 40 characters provides good balance of visibility vs. space
- TooltipProvider must wrap tooltips (check if already in app root)
- Filter state in URL enables bookmarking filtered views
- Content preview should be collapsed by default for long content (>500 chars)
- Metadata JSON should be formatted with indentation for readability

### Potential Challenges
- **TooltipProvider**: May need to add to app layout if not present
- **Filter Query Key**: Must include filter value in query key for proper caching
- **Client Regeneration**: Must regenerate OpenAPI client after backend changes
- **Type Safety**: ItemPublic type must include new fields (should already from Session 01)

### ASCII Reminder
All output files must use ASCII-only characters (0-127). No special Unicode characters in code.

---

## 9. Testing Strategy

### Unit Tests
- N/A for this session (UI components, manual testing sufficient)

### Integration Tests
- N/A (backend filter is simple query parameter)

### Manual Testing
1. Create Items via Tavily save buttons (search, extract, crawl, map)
2. Verify each type shows correct colored badge
3. Verify source URLs display and open correctly
4. Test filter dropdown - each option filters correctly
5. Test "All Types" shows all Items
6. Open Item edit dialog - verify content preview works
7. Verify metadata displays formatted JSON
8. Test with legacy Item (null content_type, source_url)

### Edge Cases
- Items with null content_type (legacy) - should show no badge or "Manual" text
- Items with null source_url - should show dash
- Items with very long URLs - tooltip should show full URL
- Items with very long content - should be collapsed with expand button
- Empty metadata object - should handle gracefully

---

## 10. Dependencies

### External Libraries
- All dependencies already installed (shadcn/ui Badge, Select, Tooltip, Lucide icons)

### Other Sessions
- **Depends on**: phase02-session01-backend-model-and-migration, phase02-session02-frontend-hooks-and-save-buttons
- **Depended by**: None (final session)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
