# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-21
**Project State**: Phase 00 - Core Setup
**Completed Sessions**: 2 of 6

---

## Recommended Next Session

**Session ID**: `phase00-session03-pydantic-schemas`
**Session Name**: Pydantic Schemas
**Estimated Duration**: 3-4 hours
**Estimated Tasks**: ~25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 completed (dependency and configuration)
- [x] Session 02 completed (TavilyService class exists)
- [x] tavily-python SDK installed and configured

### Dependencies
- **Builds on**: Session 02 - Service Layer Implementation
- **Enables**: Session 04 - Search and Extract Routes, Session 05 - Crawl, Map, and Error Handling

### Project Progression
This is the logical next step because:
1. **Service layer requires typed contracts** - TavilyService methods need defined request/response types
2. **Routes depend on schemas** - Sessions 04-05 cannot be implemented without Pydantic models
3. **OpenAPI spec generation** - FastAPI requires Pydantic schemas to generate accurate API documentation
4. **Validation foundation** - URL validators, enum constraints, and field defaults must be established before route handlers

---

## Session Overview

### Objective
Implement comprehensive Pydantic v2 schemas for all Tavily API request and response types, ensuring full parameter support and proper validation.

### Key Deliverables
1. `backend/app/schemas/tavily.py` with all request/response models
2. SearchRequest/SearchResponse schemas with full SDK parameter coverage
3. ExtractRequest/ExtractResponse schemas for single and batch URL extraction
4. CrawlRequest/CrawlResponse schemas with depth, breadth, and instruction support
5. MapRequest/MapResponse schemas for sitemap generation
6. Field validators for URL formats and enum constraints (topic, search_depth)
7. Proper Optional/Required field definitions with sensible defaults

### Scope Summary
- **In Scope (MVP)**: All Pydantic schemas for Tavily operations, field validators, enums, shared base schemas, field documentation
- **Out of Scope**: API route implementation, error response schemas, testing

---

## Technical Considerations

### Technologies/Patterns
- Pydantic v2 with `BaseModel` and `ConfigDict`
- `Field()` for defaults, descriptions, and validation
- `Annotated` types for reusable validators
- `StrEnum` for topic and search_depth enumerations
- `HttpUrl` or custom validators for URL fields
- Optional fields with `None` defaults where appropriate

### Potential Challenges
- **SDK parameter mapping**: Ensuring all tavily-python parameters are exposed (query, search_depth, topic, max_results, include_domains, exclude_domains, etc.)
- **Response structure alignment**: Matching schema fields exactly to SDK return types
- **URL validation flexibility**: Supporting both single URLs and URL lists for batch operations
- **Default values**: Choosing sensible defaults that match SDK behavior

---

## Alternative Sessions

If this session is blocked:
1. **None available** - Session 03 is a hard dependency for Sessions 04-06
2. **Phase 01 prep** - Could sketch frontend component structure, but backend must complete first

---

## Next Steps

Run `/sessionspec` to generate the formal specification with detailed task breakdown.
