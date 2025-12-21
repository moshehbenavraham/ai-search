# Session Specification

**Session ID**: `phase00-session03-pydantic-schemas`
**Phase**: 00 - Core Setup
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session implements comprehensive Pydantic v2 schemas for all Tavily API request and response types. These schemas serve as the typed contract between the FastAPI routes (Sessions 04-05) and the TavilyService class (Session 02), enabling proper request validation, response serialization, and OpenAPI documentation generation.

The Tavily integration exposes four core operations: web search, URL content extraction, site crawling, and sitemap generation. Each operation requires a request schema capturing all SDK parameters with appropriate validation, and a response schema matching the SDK's return structure. This session establishes the foundation that all subsequent API route development depends upon.

By creating well-documented schemas with field validators, enums for constrained values, and sensible defaults, we ensure type safety throughout the application and generate accurate OpenAPI specs for frontend client generation in Phase 01.

---

## 2. Objectives

1. Create Pydantic v2 request schemas covering all TavilyService method parameters
2. Create corresponding response schemas matching Tavily SDK return structures
3. Implement field validators for URL formats, domain lists, and numeric constraints
4. Define enums for `SearchDepth` (basic/advanced) and `SearchTopic` (general/news)

---

## 3. Prerequisites

### Required Sessions
- [x] `phase00-session01-dependency-and-configuration` - tavily-python SDK installed
- [x] `phase00-session02-service-layer-implementation` - TavilyService class exists with method signatures

### Required Tools/Knowledge
- Pydantic v2 patterns (BaseModel, Field, ConfigDict)
- Understanding of Tavily SDK parameters from TavilyService docstrings
- FastAPI schema integration patterns

### Environment Requirements
- Python 3.11+ with Pydantic v2
- Access to backend/app/ directory structure

---

## 4. Scope

### In Scope (MVP)
- SearchRequest schema with all 10 search parameters
- SearchResponse schema with results, answer, and images
- ExtractRequest schema for single/batch URL extraction
- ExtractResponse schema with extraction results
- CrawlRequest schema with depth, breadth, limit, instructions, paths
- CrawlResponse schema with crawled page results
- MapRequest schema for sitemap generation
- MapResponse schema with discovered URLs
- SearchDepth enum (basic, advanced)
- SearchTopic enum (general, news)
- URL validators for url and urls fields
- Domain list validators for include_domains/exclude_domains
- Nested schemas for individual results (SearchResult, ExtractResult, CrawlResult)

### Out of Scope (Deferred)
- Error response schemas - *Reason: Session 05 covers error handling*
- API route implementation - *Reason: Sessions 04-05*
- Unit tests for schemas - *Reason: Session 06*
- SearchHistory model - *Reason: Deferred requirement*

---

## 5. Technical Approach

### Architecture
Create a single `backend/app/schemas/tavily.py` module containing all Tavily-related Pydantic models. The module will be organized in sections:

1. **Enums** - SearchDepth, SearchTopic
2. **Nested Result Models** - SearchResult, ExtractResult, CrawlResult
3. **Request Models** - SearchRequest, ExtractRequest, CrawlRequest, MapRequest
4. **Response Models** - SearchResponse, ExtractResponse, CrawlResponse, MapResponse

### Design Patterns
- **BaseModel inheritance**: All schemas inherit from Pydantic BaseModel
- **Field() descriptors**: Use for defaults, descriptions, constraints (ge, le, max_length)
- **StrEnum**: For SearchDepth and SearchTopic with string values
- **Annotated types**: For reusable URL and domain validators
- **Optional with defaults**: For optional parameters with SDK-matching defaults

### Technology Stack
- Pydantic v2.x (already in project dependencies)
- Python 3.11+ (for StrEnum and modern type hints)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `backend/app/schemas/__init__.py` | Package init, exports all schemas | ~15 |
| `backend/app/schemas/tavily.py` | All Tavily request/response schemas | ~250 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| None | No modifications required | 0 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] SearchRequest exposes all 10 SDK parameters: query, search_depth, topic, max_results, include_images, include_image_descriptions, include_answer, include_raw_content, include_domains, exclude_domains
- [ ] ExtractRequest supports both single URL string and list of URLs
- [ ] CrawlRequest exposes: url, max_depth, max_breadth, limit, instructions, select_paths, select_domains
- [ ] MapRequest exposes: url, max_depth, max_breadth, limit, instructions, select_paths, select_domains
- [ ] All response schemas match TavilyService return type structures
- [ ] SearchDepth enum has values: basic, advanced
- [ ] SearchTopic enum has values: general, news
- [ ] URL fields validate proper URL format
- [ ] max_results constrained to 1-20 range
- [ ] max_depth, max_breadth, limit have appropriate >= 1 constraints

### Testing Requirements
- [ ] Schemas can be instantiated with valid data
- [ ] Schemas reject invalid data with ValidationError
- [ ] Schemas serialize to JSON for OpenAPI spec

### Quality Gates
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] Code follows project conventions (SQLModel/Pydantic style from models.py)
- [ ] No lint errors (ruff check)
- [ ] No type check failures (mypy/pyright)
- [ ] All fields have description strings for OpenAPI

---

## 8. Implementation Notes

### Key Considerations
- **SDK Parameter Alignment**: Reference TavilyService method signatures in `backend/app/services/tavily.py` for exact parameter names and defaults
- **Default Values**: Match SDK defaults exactly (e.g., max_results=5, max_depth=1, max_breadth=20)
- **URL Validation**: Use Pydantic's AnyHttpUrl or custom regex for flexible URL validation
- **Batch URLs**: ExtractRequest.urls should accept Union[str, list[str]] with a validator

### Potential Challenges
- **Response Structure Discovery**: SDK returns dict[str, Any]; need to infer structure from docstrings and SDK source
- **Union Types for URLs**: Handling both single URL and URL list in ExtractRequest requires careful validator design
- **Image Response Format**: Images in search results may have varying structures

### ASCII Reminder
All output files must use ASCII-only characters (0-127). Avoid curly quotes, em-dashes, or other Unicode characters in docstrings and comments.

---

## 9. Testing Strategy

### Unit Tests (Deferred to Session 06)
- Valid request schema instantiation
- Invalid data rejection (missing required fields, constraint violations)
- Enum value validation
- URL format validation

### Integration Tests (Deferred to Session 06)
- Schema compatibility with TavilyService return types
- OpenAPI spec generation verification

### Manual Testing
- Import schemas in Python REPL and instantiate with sample data
- Run `ruff check backend/app/schemas/`
- Run type checker on schemas module

### Edge Cases
- Empty domain lists vs None
- Single URL string vs single-item URL list
- Maximum values for constraints (max_results=20, etc.)

---

## 10. Dependencies

### External Libraries
- pydantic: >=2.0 (already installed)

### Other Sessions
- **Depends on**: phase00-session01 (SDK installed), phase00-session02 (service layer for reference)
- **Depended by**: phase00-session04 (search/extract routes), phase00-session05 (crawl/map routes), phase00-session06 (testing)

---

## Appendix: Schema Field Reference

### SearchRequest Fields
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| query | str | Yes | - | Search query string |
| search_depth | SearchDepth | No | basic | Search depth (basic/advanced) |
| topic | SearchTopic | No | general | Topic category (general/news) |
| max_results | int | No | 5 | Max results (1-20) |
| include_images | bool | No | False | Include images in results |
| include_image_descriptions | bool | No | False | Include image descriptions |
| include_answer | bool | No | False | Include AI answer summary |
| include_raw_content | bool | No | False | Include raw HTML content |
| include_domains | list[str] | No | None | Domains to include |
| exclude_domains | list[str] | No | None | Domains to exclude |

### ExtractRequest Fields
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| urls | str or list[str] | Yes | - | URL(s) to extract content from |

### CrawlRequest Fields
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| url | str | Yes | - | Starting URL for crawl |
| max_depth | int | No | 1 | Max link depth |
| max_breadth | int | No | 20 | Max links per page |
| limit | int | No | 50 | Max total pages |
| instructions | str | No | None | NL instructions for content |
| select_paths | list[str] | No | None | Path patterns to include |
| select_domains | list[str] | No | None | Additional domains |

### MapRequest Fields
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| url | str | Yes | - | Starting URL for mapping |
| max_depth | int | No | 1 | Max link depth |
| max_breadth | int | No | 20 | Max links per page |
| limit | int | No | 100 | Max total URLs |
| instructions | str | No | None | NL instructions for selection |
| select_paths | list[str] | No | None | Path patterns to include |
| select_domains | list[str] | No | None | Additional domains |

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
