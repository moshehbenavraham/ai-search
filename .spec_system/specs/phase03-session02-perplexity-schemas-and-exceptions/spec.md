# Session Specification

**Session ID**: `phase03-session02-perplexity-schemas-and-exceptions`
**Phase**: 03 - Deep Research Backend
**Status**: Not Started
**Created**: 2025-12-27

---

## 1. Session Overview

This session implements all Pydantic schemas and a custom exception class for the Perplexity Sonar Deep Research API. These data structures form the foundation for request validation, response parsing, and error handling in the Perplexity service integration.

The schemas define the contract between our backend and the Perplexity API, ensuring type safety and proper validation of all request parameters and response fields. By establishing a robust schema pattern here, we create a reusable template for the Gemini schemas in Session 03.

This work is critical because the Perplexity service implementation (Session 04) cannot proceed without properly defined request/response schemas. The exception class provides structured error handling that integrates with FastAPI's exception handler system, following the established pattern from TavilyAPIError.

---

## 2. Objectives

1. Implement all Perplexity-specific enums (SearchMode, ReasoningEffort, SearchContextSize, RecencyFilter, ErrorCode)
2. Create comprehensive PerplexityDeepResearchRequest schema covering all API parameters with proper validation
3. Create PerplexityDeepResearchResponse schema with nested result models (SearchResult, Video, Usage, Choice)
4. Implement PerplexityAPIError exception class with factory methods following TavilyAPIError pattern

---

## 3. Prerequisites

### Required Sessions
- [x] `phase03-session01-configuration-and-environment` - Provides PerplexitySettings configuration class

### Required Tools/Knowledge
- Understanding of Perplexity Sonar Deep Research API parameters and response structure
- Familiarity with Pydantic v2 BaseModel, Field, validators, and ConfigDict
- Python StrEnum for type-safe enumeration values

### Environment Requirements
- Python 3.11+ runtime
- Pydantic v2 installed (already in requirements.txt)

---

## 4. Scope

### In Scope (MVP)
- PerplexitySearchMode enum (web, scholar, news, code)
- PerplexityReasoningEffort enum (low, medium, high)
- PerplexitySearchContextSize enum (low, medium, high)
- PerplexityRecencyFilter enum (day, week, month, year)
- PerplexityDeepResearchRequest schema with all API parameters
- PerplexitySearchResult, PerplexityVideo, PerplexityUsage, PerplexityChoice response schemas
- PerplexityDeepResearchResponse schema
- PerplexityErrorCode enum and PerplexityAPIError exception with factory methods
- Updated __init__.py exports for schemas and exceptions

### Out of Scope (Deferred)
- Gemini schemas - *Reason: Session 03 scope*
- Service layer implementation - *Reason: Session 04 scope*
- Route definitions - *Reason: Session 04 scope*
- Unit tests for schemas - *Reason: Optional, can be added later*

---

## 5. Technical Approach

### Architecture
The schemas follow the established pattern from `backend/app/schemas/tavily.py`:
- Enums section at top using StrEnum
- Nested result models in middle section
- Request schemas with `extra="forbid"` for strict validation
- Response schemas with `extra="allow"` for flexible parsing
- Clear section separators with comments

Exception class follows `backend/app/core/exceptions.py` TavilyAPIError pattern:
- StrEnum for error codes
- Exception class with status_code, error_code, message, details
- Factory classmethods for common error types

### Design Patterns
- **StrEnum**: Type-safe string enums that serialize correctly to API values
- **Factory Methods**: Create standardized exceptions with correct HTTP status codes
- **ConfigDict**: Control Pydantic validation strictness per schema type
- **Field Validators**: Complex validation for date filters and domain lists

### Technology Stack
- Python 3.11+
- Pydantic v2 (BaseModel, Field, ConfigDict, field_validator)
- enum.StrEnum for enumeration types

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `backend/app/schemas/perplexity.py` | All Perplexity schemas and enums | ~250 |
| `backend/app/exceptions/perplexity.py` | PerplexityAPIError and error codes | ~120 |

### Files to Modify
| File | Changes | Est. Lines |
|------|---------|------------|
| `backend/app/schemas/__init__.py` | Add Perplexity schema exports | ~15 |
| `backend/app/exceptions/__init__.py` | Create file and add exports | ~15 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] All 4 enums defined with correct string values matching Perplexity API
- [ ] PerplexityDeepResearchRequest validates all 20+ optional/required fields
- [ ] Response schemas properly parse sample Perplexity API responses
- [ ] PerplexityAPIError has factory methods: rate_limit_exceeded, invalid_api_key, request_timeout, invalid_request, content_filter, api_error

### Testing Requirements
- [ ] Schemas instantiate correctly with valid data
- [ ] Request schema rejects invalid enum values
- [ ] Response schema parses with extra fields without error
- [ ] Manual validation with sample API response structure

### Quality Gates
- [ ] All files ASCII-encoded
- [ ] Unix LF line endings
- [ ] Code follows project conventions (CONVENTIONS.md)
- [ ] No type errors (mypy compatible)
- [ ] No lint warnings (ruff compatible)
- [ ] Docstrings for all public classes and methods

---

## 8. Implementation Notes

### Key Considerations
- Perplexity API uses `web_search_options` nesting for some parameters - need to decide if we flatten or preserve structure
- Date filters (search_after_date_filter, search_before_date_filter) may need ISO format validation
- Model parameter should default to "sonar-deep-research" for deep research requests
- Optional parameters with None defaults vs omitting from request need handling

### Potential Challenges
- **Nested web_search_options**: Perplexity API may expect certain params nested - review API docs carefully
- **Enum value accuracy**: Must match exact API string values (case-sensitive)
- **Optional field handling**: Pydantic v2 handles Optional differently - use `| None` syntax

### Request Parameter Categories
The request schema must organize these parameter groups:
1. **Core**: query (required), system_prompt, model
2. **Reasoning**: search_mode, reasoning_effort, search_context_size
3. **Generation**: max_tokens, temperature, top_p, top_k, presence_penalty, frequency_penalty
4. **Search Filters**: search_recency_filter, search_domain_filter, search_after_date_filter, search_before_date_filter
5. **Output Options**: return_images, return_related_questions, response_format
6. **Control**: stream, disable_search, enable_search_classifier

### ASCII Reminder
All output files must use ASCII-only characters (0-127).

---

## 9. Testing Strategy

### Unit Tests
- Schema instantiation with valid minimal data
- Schema instantiation with all optional fields populated
- Enum value serialization to correct strings
- Request schema rejection of invalid enum values
- Response schema parsing with extra unknown fields

### Integration Tests
- N/A for this session (schemas only, no external calls)

### Manual Testing
- Create sample PerplexityDeepResearchRequest with various parameter combinations
- Parse sample Perplexity API response JSON into PerplexityDeepResearchResponse
- Instantiate PerplexityAPIError using each factory method

### Edge Cases
- Empty query string (should fail validation)
- Date filter format validation (YYYY-MM-DD expected)
- Domain filter list with empty strings
- Response with missing optional fields
- Response with extra unexpected fields (should pass with extra="allow")

---

## 10. Dependencies

### External Libraries
- pydantic: v2.x (BaseModel, Field, ConfigDict, field_validator, model_validator)

### Other Sessions
- **Depends on**: phase03-session01-configuration-and-environment (PerplexitySettings)
- **Depended by**:
  - phase03-session03-gemini-schemas-and-exceptions (follows pattern established here)
  - phase03-session04-perplexity-service-and-route (requires schemas for service implementation)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
