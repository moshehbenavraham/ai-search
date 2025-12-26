# tavily-app - Product Requirements Document

## Overview

tavily-app is a full-stack web application that integrates the Tavily Python SDK to provide AI-powered web search, content extraction, website crawling, and sitemap generation capabilities. The backend exposes RESTful API endpoints via FastAPI, while the React frontend provides an intuitive user interface for interacting with these features.

The application builds on an existing FastAPI full-stack boilerplate (React 19, TypeScript, TanStack Router/Query, shadcn/ui, Tailwind CSS) and adds a complete Tavily integration layer across both backend and frontend.

## Goals

1. Expose Tavily's search functionality with configurable depth, topic filtering, and result customization
2. Provide URL content extraction with support for single and batch operations
3. Enable intelligent website crawling with natural language instructions and path filtering
4. Offer sitemap generation (URL mapping) for discovering website structure
5. Maintain authentication-protected endpoints consistent with existing boilerplate patterns
6. Implement robust error handling for API failures, rate limits, and partial successes
7. Provide a polished frontend UI for all Tavily features integrated into the existing React application

## Non-Goals

- Implementing Tavily Hybrid RAG features
- Creating a public-facing API (endpoints require authentication)
- Building custom caching layer beyond optional search history
- Implementing billing or credit tracking (Tavily handles this)
- WebSocket or real-time streaming of results
- Mobile-native applications (web responsive only)

## Users and Use Cases

### Primary Users

- **End Users**: Authenticated users who interact with Tavily features through the web UI
- **API Consumers**: Developers integrating with the tavily-app API programmatically
- **Internal Services**: Backend services that need programmatic web search, extraction, or crawling

### Key Use Cases

1. Execute web searches with topic-specific filtering (general, news, finance) via UI or API
2. Extract clean content from one or more URLs for processing
3. Crawl a website starting from a root URL with configurable depth and filtering
4. Generate a sitemap of URLs discovered from a starting point
5. View and manage search history for authenticated users
6. Browse search results with rich display of titles, snippets, and source links
7. Save Tavily results (search, extract, crawl, map) to Items for later reference

## Requirements

### MVP Requirements - Backend (Phase 00)

- Add tavily-python SDK dependency (>=0.5.0)
- Configure Tavily API key and optional proxy settings via environment
- Create TavilyService class managing sync/async client instances
- Implement Pydantic schemas for all request/response types
- Create POST /tavily/search endpoint with full parameter support
- Create POST /tavily/extract endpoint for single and batch URL extraction
- Create POST /tavily/crawl endpoint with depth, breadth, and instruction support
- Create POST /tavily/map endpoint for sitemap generation
- Add TavilyDep dependency injection in deps.py
- Register tavily router in api/main.py
- Implement custom TavilyAPIError exception handling
- Handle rate limiting (429), auth errors (401), timeouts (504), and validation errors (400)
- Write unit tests for all endpoints with mocked responses
- Write integration tests for real API calls (requires valid key)

### MVP Requirements - Frontend (Phase 01)

- Regenerate API client from updated OpenAPI spec
- Create /search route with search form and results display
- Create /extract route for URL content extraction
- Create /crawl route for website crawling interface
- Create /map route for sitemap generation
- Add Tavily navigation items to sidebar
- Implement search form with React Hook Form and Zod validation
- Display search results in a DataTable or card-based layout
- Show loading states during API calls (skeleton/spinner)
- Handle and display API errors with toast notifications
- Implement result detail views (dialog or expandable sections)
- Add topic filter (general/news/finance) and search depth options
- Create URL input components with validation for extract/crawl/map

### MVP Requirements - Saving Results (Phase 02)

- Extend Item model with content fields (source_url, content, content_type, metadata)
- Generate Alembic migration for new Item fields
- Regenerate frontend API client with updated schemas
- Create useSaveToItems hook for TanStack Query mutations
- Create mapper functions to convert Tavily results to Item format
- Add Save buttons to SearchResultCard and SearchResultDetail components
- Add Save buttons to ExtractResultCard and CrawlResultCard components
- Add Save All button to MapResultsList component
- Update Items table columns to display new fields (type badge, source link)
- Add content_type filter to Items page

### Deferred Requirements

- SearchHistory database model for tracking user queries
- Rate limiting per user
- Credit usage tracking and quotas
- README documentation updates
- Search result caching in frontend

## Non-Functional Requirements

- **Performance**: Configurable timeout (default 60s), async client for non-blocking operations, React Query caching for frontend
- **Security**: API key stored in environment variables, JWT authentication on all endpoints, input validation and URL sanitization
- **Reliability**: Graceful handling of partial failures in batch operations, proper error categorization, optimistic UI updates where appropriate
- **Accessibility**: WCAG 2.1 AA compliance via Radix UI components, keyboard navigation, proper ARIA labels

## Constraints and Dependencies

- Requires tavily-python>=0.5.0 package
- Requires valid Tavily API key (TAVILY_API_KEY environment variable)
- Must integrate with existing FastAPI boilerplate structure
- Must use existing authentication system (CurrentUser dependency)
- Frontend must follow existing patterns (TanStack Query, React Hook Form, shadcn/ui)
- API credit usage governed by Tavily pricing (basic=1 credit, advanced=2 credits)

## Phases

This system delivers the product via phases. Each phase is implemented via multiple 2-4 hour sessions (15-30 tasks each).

| Phase | Name | Sessions | Status |
|-------|------|----------|--------|
| 00 | Core Setup | 6 | Complete |
| 01 | Frontend Integration | 6 | Complete |
| 02 | Saving Results to Items | 3 | Not Started |

## Phase 00: Core Setup

### Objectives

1. Add Tavily SDK dependency and configure environment settings
2. Create service layer with TavilyService class
3. Implement Pydantic schemas for all Tavily operations
4. Create API routes for search, extract, crawl, and map endpoints
5. Implement error handling and register router
6. Write unit and integration tests

### Sessions

| Session | Name | Est. Tasks |
|---------|------|------------|
| 01 | Dependency and Configuration | ~20 |
| 02 | Service Layer Implementation | ~25 |
| 03 | Pydantic Schemas | ~25 |
| 04 | Search and Extract Routes | ~20 |
| 05 | Crawl, Map, and Error Handling | ~20 |
| 06 | Testing Suite | ~25 |

Session specifications in `.spec_system/PRD/phase_00/`.

## Phase 01: Frontend Integration

### Objectives

1. Regenerate API client and add Tavily service types
2. Create Tavily page routes (search, extract, crawl, map)
3. Build search form components with validation
4. Implement results display components (tables, cards, detail views)
5. Add navigation and integrate with existing UI patterns
6. Handle loading states, errors, and edge cases

### Sessions

| Session | Name | Est. Tasks |
|---------|------|------------|
| 01 | API Client and Navigation | ~20 |
| 02 | Search Form and Query | ~25 |
| 03 | Search Results Display | ~25 |
| 04 | Extract Page | ~25 |
| 05 | Crawl Page | ~25 |
| 06 | Map Page and Polish | ~20 |

Session specifications in `.spec_system/PRD/phase_01/`.

## Phase 02: Saving Results to Items

### Objectives

1. Extend Item database model with content fields for storing Tavily results
2. Create database migration and update API schemas
3. Implement frontend save functionality with hooks and mapper utilities
4. Add Save buttons to all Tavily result components
5. Enhance Items page to display and filter saved Tavily results

### Sessions

| Session | Name | Est. Tasks |
|---------|------|------------|
| 01 | Backend Model and Migration | ~20 |
| 02 | Frontend Hooks and Save Buttons | ~25 |
| 03 | Items Page Enhancements | ~20 |

Session specifications in `.spec_system/PRD/phase_02/`.

### Data Model

New fields added to ItemBase:

| Field | Type | Description |
|-------|------|-------------|
| source_url | str (max 2048) | Original URL of the content |
| content | Text | Full content without length limit |
| content_type | str (max 50) | Type: "search", "extract", "crawl", or "map" |
| metadata | JSON | Additional data (score, query, images, etc.) |

### Field Mapping by Tavily Type

| Tavily Type | title | description | source_url | content | content_type | metadata |
|-------------|-------|-------------|------------|---------|--------------|----------|
| **Search** | result.title | truncate(content, 255) | result.url | raw_content | "search" | {score, query} |
| **Extract** | domain from URL | "Extracted from {url}" | result.url | raw_content | "extract" | {images} |
| **Crawl** | page path | "Crawled from {base_url}" | result.url | raw_content | "crawl" | {base_url, index} |
| **Map** | domain | "{count} URLs from {base_url}" | base_url | JSON of urls | "map" | {total_urls} |

## Technical Stack

### Backend
- FastAPI - existing boilerplate framework
- tavily-python - official Tavily SDK for API integration
- Pydantic - request/response validation and serialization
- SQLModel - optional SearchHistory model (if implemented)
- pytest - unit and integration testing

### Frontend
- React 19 - UI framework
- TypeScript - type safety
- Vite - build tooling
- TanStack Router - file-based routing
- TanStack Query - data fetching and caching
- React Hook Form + Zod - form management and validation
- shadcn/ui (Radix UI) - accessible component library
- Tailwind CSS - utility-first styling
- Sonner - toast notifications
- Lucide React - icons

## Success Criteria

### Phase 00 (Backend) - COMPLETE
- [x] All four Tavily endpoints (search, extract, crawl, map) are functional
- [x] Endpoints require valid JWT authentication
- [x] All Tavily SDK parameters are exposed via request schemas
- [x] Error responses include proper status codes and structured error bodies
- [x] Unit tests pass with mocked Tavily responses
- [x] Integration tests pass with valid API key
- [x] No lint errors or type check failures

### Phase 01 (Frontend) - COMPLETE
- [x] All Tavily features accessible via navigation sidebar
- [x] Search form validates input and displays results
- [x] Extract, crawl, and map pages are functional
- [x] Loading states shown during API calls
- [x] Errors displayed via toast notifications
- [x] UI is responsive on desktop and mobile
- [x] All new components follow existing code patterns

### Phase 02 (Saving Results)
- [ ] Item model extended with source_url, content, content_type, metadata fields
- [ ] Database migration applied successfully
- [ ] Save buttons functional on all Tavily result components
- [ ] Saved items appear in Items page with correct data
- [ ] Items page displays type badges and source links
- [ ] Content type filter works on Items page
- [ ] Toast notifications confirm save success/failure

## Risks

- **API Key Exposure**: Mitigation - store in environment variables, never commit to repo
- **Rate Limiting**: Mitigation - implement proper 429 handling with retry guidance in UI
- **SDK Breaking Changes**: Mitigation - pin to specific tavily-python version
- **Crawl Timeouts**: Mitigation - respect Tavily's 150s max timeout, show progress indicators
- **Large Result Sets**: Mitigation - implement pagination and virtualization for large crawl results
- **OpenAPI Client Drift**: Mitigation - regenerate client after any backend schema changes

## Assumptions

- Tavily API key will be provided and is valid
- Existing FastAPI boilerplate authentication is functional
- Python environment supports async/await patterns
- Test environment can make external API calls for integration tests
- Frontend development environment is configured (Node.js, npm)
- Existing React app structure and patterns are stable

## Open Questions

1. Should SearchHistory be implemented in Phase 00 or deferred to a later phase?
2. What rate limits (if any) should be applied per user?
3. Should crawl/map operations have lower default timeouts for better UX?
4. Are there specific domain restrictions to enforce (include_domains/exclude_domains)?
5. Should search results be paginated or use infinite scroll?
6. What level of detail should be shown in result cards vs. detail views?
