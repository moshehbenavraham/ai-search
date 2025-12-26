# tavily-app - Product Requirements Document

## Overview

tavily-app is a full-stack web application that integrates multiple AI-powered research APIs to provide comprehensive web search, content extraction, website crawling, sitemap generation, and deep research capabilities. The backend exposes RESTful API endpoints via FastAPI, while the React frontend provides an intuitive user interface for interacting with these features.

The application builds on an existing FastAPI full-stack boilerplate (React 19, TypeScript, TanStack Router/Query, shadcn/ui, Tailwind CSS) and integrates:
- **Tavily SDK** - Web search, extraction, crawling, and sitemap generation (Phases 00-02, complete)
- **Perplexity Sonar Deep Research** - Synchronous expert-level research with citations (Phase 03)
- **Google Gemini Deep Research** - Asynchronous agentic research with polling (Phase 04)

## Goals

1. Expose Tavily's search functionality with configurable depth, topic filtering, and result customization
2. Provide URL content extraction with support for single and batch operations
3. Enable intelligent website crawling with natural language instructions and path filtering
4. Offer sitemap generation (URL mapping) for discovering website structure
5. Integrate Perplexity Sonar Deep Research for comprehensive, citation-backed research reports
6. Integrate Google Gemini Deep Research for extended agentic research with progress tracking
7. Maintain authentication-protected endpoints consistent with existing boilerplate patterns
8. Implement robust error handling for API failures, rate limits, and partial successes
9. Provide a polished frontend UI for all features integrated into the existing React application
10. Allow saving research results to Items for persistent storage and later reference

## Non-Goals

- Implementing Tavily Hybrid RAG features
- Creating a public-facing API (endpoints require authentication)
- Building custom caching layer beyond optional search history
- Implementing billing or credit tracking (external APIs handle this)
- WebSocket or real-time streaming of results (polling pattern for Gemini instead)
- Mobile-native applications (web responsive only)
- Perplexity streaming responses (synchronous only for Phase 03)
- Gemini file search integration with private document stores

## Users and Use Cases

### Primary Users

- **End Users**: Authenticated users who interact with research features through the web UI
- **API Consumers**: Developers integrating with the tavily-app API programmatically
- **Internal Services**: Backend services that need programmatic web search, extraction, or research

### Key Use Cases

1. Execute web searches with topic-specific filtering (general, news, finance) via UI or API
2. Extract clean content from one or more URLs for processing
3. Crawl a website starting from a root URL with configurable depth and filtering
4. Generate a sitemap of URLs discovered from a starting point
5. Conduct deep research on complex topics using Perplexity Sonar (immediate results)
6. Initiate extended research projects using Gemini Deep Research (async with progress tracking)
7. View and manage search history for authenticated users
8. Browse research results with rich display of content, citations, and source links
9. Save any research results (search, extract, crawl, map, deep research) to Items

## Requirements

### MVP Requirements - Backend (Phase 00) - COMPLETE

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

### MVP Requirements - Frontend (Phase 01) - COMPLETE

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

### MVP Requirements - Saving Results (Phase 02) - COMPLETE

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

### MVP Requirements - Deep Research Backend (Phase 03)

#### Configuration
- Add PerplexitySettings class with api_key, timeout (300s), default_model, search_mode, reasoning_effort
- Add GeminiSettings class with api_key, timeout (120s), poll_interval (10s), max_poll_attempts (360), agent
- Update .env.example with PERPLEXITY_* and GEMINI_* environment variables

#### Schemas
- Create backend/app/schemas/perplexity.py with:
  - PerplexitySearchMode, PerplexityReasoningEffort, PerplexitySearchContextSize, PerplexityRecencyFilter enums (StrEnum)
  - PerplexityDeepResearchRequest with query, system_prompt, search_mode, reasoning_effort, search_context_size, user_location, max_tokens, temperature, top_p, top_k, presence_penalty, frequency_penalty, return_images, return_related_questions, stream, disable_search, enable_search_classifier, response_format, search_recency_filter, search_domain_filter, search_after_date_filter, search_before_date_filter
  - PerplexitySearchResult, PerplexityVideo, PerplexityUsage, PerplexityChoice, PerplexityDeepResearchResponse
- Create backend/app/schemas/gemini.py with:
  - GeminiInteractionStatus, GeminiStreamEventType, GeminiDeltaType enums (StrEnum)
  - GeminiDeepResearchRequest with query, enable_thinking_summaries, file_search_store_names, previous_interaction_id
  - GeminiDeepResearchPollRequest with interaction_id, last_event_id
  - GeminiUsage, GeminiOutput, GeminiDeepResearchJobResponse, GeminiDeepResearchResultResponse
- Export new schemas in backend/app/schemas/__init__.py

#### Exceptions
- Add PerplexityErrorCode enum (rate_limit_exceeded, invalid_api_key, request_timeout, invalid_request, content_filter, perplexity_api_error)
- Add PerplexityAPIError class with factory methods (rate_limit_exceeded, invalid_api_key, request_timeout, invalid_request, content_filter, api_error)
- Add GeminiErrorCode enum (rate_limit_exceeded, invalid_api_key, request_timeout, invalid_request, research_failed, interaction_not_found, max_polls_exceeded, polling_timeout, gemini_api_error)
- Add GeminiAPIError class with factory methods

#### Services
- Create backend/app/services/perplexity.py with PerplexityService class:
  - BASE_URL = "https://api.perplexity.ai"
  - _build_headers() for Bearer token auth
  - _build_payload() mapping flat fields to web_search_options
  - _parse_response() extracting content from choices[0].message.content
  - _handle_error() converting HTTP errors to PerplexityAPIError
  - async deep_research() executing the query
- Create backend/app/services/gemini.py with GeminiService class:
  - BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
  - _build_headers() for x-goog-api-key header
  - async start_research() with background=True, store=True, agent_config.type="deep-research"
  - async poll_research() supporting last_event_id for reconnection
  - async wait_for_completion() with configurable polling
  - async cancel_research() for DELETE endpoint
  - _handle_error() converting errors to GeminiAPIError

#### Dependencies
- Add get_perplexity_service() and PerplexityDep to backend/app/api/deps.py
- Add get_gemini_service() and GeminiDep to backend/app/api/deps.py

#### Routes
- Create backend/app/api/routes/perplexity.py with:
  - POST /api/v1/perplexity/deep-research (execute deep research query)
- Create backend/app/api/routes/gemini.py with:
  - POST /api/v1/gemini/deep-research (start research job, returns interaction_id)
  - GET /api/v1/gemini/deep-research/{interaction_id} (poll status with optional last_event_id)
  - DELETE /api/v1/gemini/deep-research/{interaction_id} (cancel research)
  - POST /api/v1/gemini/deep-research/sync (blocking wait for completion)
- Register routers in backend/app/api/main.py

#### Exception Handlers
- Add perplexity_exception_handler to backend/app/main.py (reuse ErrorResponse schema)
- Add gemini_exception_handler to backend/app/main.py

### MVP Requirements - Deep Research Frontend (Phase 04)

#### SDK and Types
- Regenerate frontend SDK client: npm run generate-client
- Verify PerplexityService and GeminiService classes generated in sdk.gen.ts
- Verify TypeScript types generated in types.gen.ts

#### Hooks
- Create frontend/src/hooks/usePerplexityDeepResearch.ts with useMutation
- Create frontend/src/hooks/useGeminiDeepResearch.ts with:
  - useGeminiStartResearch (mutation to start job)
  - useGeminiPollResearch (query with refetchInterval for polling)
  - useGeminiCancelResearch (mutation to cancel)
  - useGeminiSyncResearch (mutation for blocking call)

#### Zod Schemas
- Create frontend/src/lib/schemas/perplexity.ts with perplexityDeepResearchSchema
- Create frontend/src/lib/schemas/gemini.ts with geminiDeepResearchSchema

#### Components - Perplexity
- Create PerplexityDeepResearchForm.tsx (form with all query options)
- Create PerplexityResultView.tsx (markdown research report display)
- Create PerplexityCitationsList.tsx (render citations/sources)
- Create PerplexityVideos.tsx (video results grid, optional)
- Create PerplexityUsageStats.tsx (token usage display)

#### Components - Gemini
- Create GeminiDeepResearchForm.tsx (form with query options)
- Create GeminiResultView.tsx (markdown report with outputs)
- Create GeminiProgressIndicator.tsx (polling status with elapsed time)
- Create GeminiCancelButton.tsx (cancel in-progress research)
- Create GeminiUsageStats.tsx (token usage display)
- Create GeminiErrorDisplay.tsx (error state with retry option)

#### Routes
- Create frontend/src/routes/_layout/perplexity-research.tsx page
- Create frontend/src/routes/_layout/gemini-research.tsx page with state management for async workflow

#### Navigation
- Add "Perplexity Research" navigation item to sidebar
- Add "Gemini Research" navigation item to sidebar

### Deferred Requirements

- SearchHistory database model for tracking user queries
- Rate limiting per user
- Credit usage tracking and quotas
- README documentation updates
- Search result caching in frontend
- Perplexity streaming responses
- Gemini file search with private document stores
- Follow-up questions using previous_interaction_id

## Non-Functional Requirements

- **Performance**: Configurable timeouts (Tavily 60s, Perplexity 300s, Gemini 120s per-poll), async clients for non-blocking operations, React Query caching for frontend
- **Security**: API keys stored in environment variables, JWT authentication on all endpoints, input validation and URL sanitization
- **Reliability**: Graceful handling of partial failures, proper error categorization, Gemini reconnection support via last_event_id, optimistic UI updates where appropriate
- **Accessibility**: WCAG 2.1 AA compliance via Radix UI components, keyboard navigation, proper ARIA labels

## Constraints and Dependencies

- Requires tavily-python>=0.5.0 package
- Requires valid Tavily API key (TAVILY_API_KEY environment variable)
- Requires valid Perplexity API key (PERPLEXITY_API_KEY environment variable)
- Requires valid Gemini API key (GEMINI_API_KEY environment variable)
- Must integrate with existing FastAPI boilerplate structure
- Must use existing authentication system (CurrentUser dependency)
- Frontend must follow existing patterns (TanStack Query, React Hook Form, shadcn/ui)
- API credit usage governed by respective API providers
- Gemini deep research can take up to 60 minutes (typical 20 min)
- Perplexity Sonar context window is 128K tokens

## Phases

This system delivers the product via phases. Each phase is implemented via multiple 2-4 hour sessions (15-30 tasks each).

| Phase | Name | Sessions | Status |
|-------|------|----------|--------|
| 00 | Core Setup | 6 | Complete |
| 01 | Frontend Integration | 6 | Complete |
| 02 | Saving Results to Items | 3 | Complete |
| 03 | Deep Research Backend | TBD | Not Started |
| 04 | Deep Research Frontend | TBD | Not Started |

## Phase 00: Core Setup - COMPLETE

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

## Phase 01: Frontend Integration - COMPLETE

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

## Phase 02: Saving Results to Items - COMPLETE

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

Fields added to ItemBase:

| Field | Type | Description |
|-------|------|-------------|
| source_url | str (max 2048) | Original URL of the content |
| content | Text | Full content without length limit |
| content_type | str (max 50) | Type: "search", "extract", "crawl", "map", "perplexity", "gemini" |
| metadata | JSON | Additional data (score, query, images, citations, usage, etc.) |

## Phase 03: Deep Research Backend

### Objectives

1. Add configuration settings for Perplexity and Gemini APIs
2. Create Pydantic schemas for all request/response types
3. Implement custom exception classes with factory methods
4. Build service classes for both APIs (sync and async patterns)
5. Create FastAPI routes with proper authentication
6. Add exception handlers to main application

### Sessions (To Be Defined)

Sessions are defined via `/phasebuild` as `session_NN_name.md` stubs under `.spec_system/PRD/phase_03/`.

**Note**: Run `/phasebuild` to create phase directory and session stubs.

### API Reference

#### Perplexity Sonar Deep Research

| Attribute | Value |
|-----------|-------|
| Endpoint | POST https://api.perplexity.ai/chat/completions |
| Model | sonar-deep-research |
| Auth | Bearer token (Authorization: Bearer key) |
| Pattern | Synchronous - immediate response |
| Context Window | 128K tokens |

#### Google Gemini Deep Research

| Attribute | Value |
|-----------|-------|
| Endpoint | POST https://generativelanguage.googleapis.com/v1beta/interactions |
| Agent | deep-research-pro-preview-12-2025 |
| Auth | API key header (x-goog-api-key: key) |
| Pattern | Asynchronous - background job with polling |
| Max Duration | 60 minutes (typical ~20 min) |

## Phase 04: Deep Research Frontend

### Objectives

1. Regenerate SDK client with new Perplexity and Gemini services
2. Create React Query hooks for both APIs (mutations and polling)
3. Build form components with Zod validation
4. Implement result display components with markdown rendering
5. Create progress tracking UI for Gemini async workflow
6. Add navigation and integrate with existing patterns

### Sessions (To Be Defined)

Sessions are defined via `/phasebuild` as `session_NN_name.md` stubs under `.spec_system/PRD/phase_04/`.

**Note**: Run `/phasebuild` to create phase directory and session stubs.

### Component Summary

| API | Form | Result View | Supporting Components |
|-----|------|-------------|----------------------|
| Perplexity | PerplexityDeepResearchForm | PerplexityResultView | CitationsList, Videos, UsageStats |
| Gemini | GeminiDeepResearchForm | GeminiResultView | ProgressIndicator, CancelButton, ErrorDisplay, UsageStats |

## Technical Stack

### Backend
- FastAPI - existing boilerplate framework
- tavily-python - official Tavily SDK for API integration
- httpx - async HTTP client for Perplexity and Gemini APIs
- Pydantic - request/response validation and serialization
- SQLModel - database models
- pytest - unit and integration testing

### Frontend
- React 19 - UI framework
- TypeScript - type safety
- Vite - build tooling
- TanStack Router - file-based routing
- TanStack Query - data fetching, caching, and polling
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

### Phase 02 (Saving Results) - COMPLETE
- [x] Item model extended with source_url, content, content_type, metadata fields
- [x] Database migration applied successfully
- [x] Save buttons functional on all Tavily result components
- [x] Saved items appear in Items page with correct data
- [x] Items page displays type badges and source links
- [x] Content type filter works on Items page
- [x] Toast notifications confirm save success/failure

### Phase 03 (Deep Research Backend)
- [ ] PerplexitySettings and GeminiSettings configured with all options
- [ ] Environment variables documented in .env.example
- [ ] All Pydantic schemas implemented with proper validation
- [ ] PerplexityAPIError and GeminiAPIError with factory methods
- [ ] PerplexityService executes synchronous deep research
- [ ] GeminiService supports start, poll, wait, and cancel operations
- [ ] All endpoints require JWT authentication
- [ ] Exception handlers return structured ErrorResponse
- [ ] No lint errors or type check failures

### Phase 04 (Deep Research Frontend)
- [ ] SDK client regenerated with Perplexity and Gemini services
- [ ] usePerplexityDeepResearch hook functional
- [ ] useGeminiStartResearch, useGeminiPollResearch, useGeminiCancelResearch hooks functional
- [ ] Perplexity form validates input and displays results with citations
- [ ] Gemini form starts research, shows progress, allows cancellation
- [ ] Gemini polling stops automatically on completion or failure
- [ ] Loading states and errors displayed appropriately
- [ ] Navigation items added to sidebar
- [ ] UI is responsive on desktop and mobile

## Risks

- **API Key Exposure**: Mitigation - store in environment variables, never commit to repo
- **Rate Limiting**: Mitigation - implement proper 429 handling with retry guidance in UI
- **SDK Breaking Changes**: Mitigation - pin to specific tavily-python version
- **Crawl Timeouts**: Mitigation - respect Tavily's 150s max timeout, show progress indicators
- **Large Result Sets**: Mitigation - implement pagination and virtualization for large crawl results
- **OpenAPI Client Drift**: Mitigation - regenerate client after any backend schema changes
- **Gemini Long Polling**: Mitigation - configurable poll intervals, max attempts, proper timeout handling
- **Perplexity Deep Research Latency**: Mitigation - 300s timeout, clear loading indicators
- **Network Interruption During Gemini**: Mitigation - support last_event_id for reconnection

## Assumptions

- Tavily API key will be provided and is valid
- Perplexity API key will be provided and is valid
- Gemini API key will be provided and is valid
- Existing FastAPI boilerplate authentication is functional
- Python environment supports async/await patterns
- Test environment can make external API calls for integration tests
- Frontend development environment is configured (Node.js, npm)
- Existing React app structure and patterns are stable
- Gemini deep-research-pro-preview-12-2025 agent is available

## Open Questions

1. Should SearchHistory be implemented in a future phase?
2. What rate limits (if any) should be applied per user?
3. Should Perplexity streaming be added in Phase 03 or deferred?
4. Should Gemini file search with private stores be implemented?
5. What is the appropriate polling interval for Gemini (5s vs 10s)?
6. Should follow-up questions (previous_interaction_id) be supported?
7. How should deep research results be integrated with Items (new content_type values)?
8. Should there be a combined "Research Hub" page or separate pages per API?

---

*Document Version: 2.0*
*Last Updated: December 2025*
*Validated Against: EXAMPLE/gemini-perplexity-deepresearch-api/docs/, backend/app/*
