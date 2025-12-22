# PRD Phase 02: Saving Results to Items

**Status**: Complete
**Sessions**: 3
**Estimated Duration**: 1-2 days

**Progress**: 3/3 sessions (100%)

---

## Overview

Phase 02 enables users to save Tavily search, extract, crawl, and map results to the existing Items system. This involves extending the Item database model with new content fields, creating a database migration, implementing frontend save functionality with React hooks and mapper utilities, and enhancing the Items page to display and filter saved Tavily content.

---

## Progress Tracker

| Session | Name | Status | Est. Tasks | Validated |
|---------|------|--------|------------|-----------|
| 01 | Backend Model and Migration | Complete | 22 | 2025-12-22 |
| 02 | Frontend Hooks and Save Buttons | Complete | 24 | 2025-12-22 |
| 03 | Items Page Enhancements | Complete | 22 | 2025-12-22 |

---

## Completed Sessions

### Session 01: Backend Model and Migration
- Extended Item model with source_url, content, content_type, and item_metadata fields
- Created and applied Alembic migration (4ac9cd0948d7)
- Updated all Pydantic schemas for API validation
- Regenerated frontend TypeScript client
- All 89 backend tests passing with 90% coverage

### Session 02: Frontend Hooks and Save Buttons
- Created useSaveToItems TanStack Query mutation hook with cache invalidation
- Implemented mapper functions for all Tavily result types (search, extract, crawl, map)
- Added Save buttons to SearchResultCard, SearchResultDetail, ExtractResultCard, CrawlResultCard
- Added Save All button to MapResultsList
- Toast notifications for success/error feedback
- All lint and type checks passing

### Session 03: Items Page Enhancements
- Created ContentTypeBadge, SourceUrlCell, ContentTypeFilter, ContentPreview, MetadataDisplay components
- Added content_type and source_url columns to Items table
- Implemented backend content_type filter parameter
- Added URL search params for bookmarkable filtered views
- Enhanced EditItem dialog with Tavily data section (content preview, metadata display)
- Graceful handling of legacy Items (null content_type)
- All 85 backend tests passing, frontend build successful

---

## Upcoming Sessions

None - Phase 02 Complete

---

## Objectives

1. Extend Item database model with source_url, content, content_type, and metadata fields
2. Create Alembic migration and regenerate frontend API client
3. Implement useSaveToItems hook and Tavily-to-Item mapper functions
4. Add Save buttons to all Tavily result components (search, extract, crawl, map)
5. Enhance Items page with type badges, source links, and content_type filtering

---

## Prerequisites

- Phase 01 completed (Frontend Integration)
- All Tavily pages functional (search, extract, crawl, map)
- Existing Items model and CRUD operations working
- Backend and frontend development environments ready

---

## Technical Considerations

### Architecture

The Item model will be extended with optional nullable fields to support both existing Items and new Tavily-sourced Items. The content field uses SQLAlchemy Text type for unlimited length. A metadata JSON field stores type-specific data like search scores, queries, and image URLs.

### Data Model

New fields added to Item:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| source_url | String(2048) | Yes | Original URL of the content |
| content | Text | Yes | Full content without length limit |
| content_type | String(50) | Yes | Type: "search", "extract", "crawl", or "map" |
| metadata | JSON | Yes | Additional type-specific data |

### Field Mapping by Tavily Type

| Tavily Type | title | description | source_url | content | content_type | metadata |
|-------------|-------|-------------|------------|---------|--------------|----------|
| **Search** | result.title | truncate(content, 255) | result.url | raw_content | "search" | {score, query} |
| **Extract** | domain from URL | "Extracted from {url}" | result.url | raw_content | "extract" | {images} |
| **Crawl** | page path | "Crawled from {base_url}" | result.url | raw_content | "crawl" | {base_url, index} |
| **Map** | domain | "{count} URLs from {base_url}" | base_url | JSON of urls | "map" | {total_urls} |

### Technologies

- SQLAlchemy / SQLModel - database model extensions
- Alembic - database migrations
- Pydantic - schema updates
- TanStack Query - useSaveToItems mutation hook
- React Hook Form - save button integration
- shadcn/ui Badge - content type badges

### Risks

- **Migration Complexity**: Mitigation - fields are nullable, no data loss for existing Items
- **Large Content**: Mitigation - Text field handles unlimited content; consider truncation in UI
- **OpenAPI Drift**: Mitigation - regenerate client immediately after backend changes
- **Type Safety**: Mitigation - strict TypeScript types for mapper functions

---

## Success Criteria

Phase complete when:
- [x] Item model extended with source_url, content, content_type, metadata fields
- [x] Database migration applied successfully without data loss
- [x] All 3 sessions completed
- [x] Save buttons functional on all Tavily result components
- [x] Saved items appear in Items page with correct data mapping
- [x] Items page displays type badges and clickable source links
- [x] Content type filter works on Items page
- [x] Toast notifications confirm save success/failure
- [x] No lint errors or type check failures
- [x] All existing tests pass

---

## Dependencies

### Depends On

- Phase 01: Frontend Integration (all Tavily pages complete)

### Enables

- Future phases: Search history tracking, saved result analytics, export functionality
