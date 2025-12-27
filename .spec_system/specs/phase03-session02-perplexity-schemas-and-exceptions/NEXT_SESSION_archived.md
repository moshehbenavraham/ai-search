# NEXT_SESSION.md

## Session Recommendation

**Generated**: 2025-12-27
**Project State**: Phase 03 - Deep Research Backend
**Completed Sessions**: 16

---

## Recommended Next Session

**Session ID**: `phase03-session02-perplexity-schemas-and-exceptions`
**Session Name**: Perplexity Schemas and Exceptions
**Estimated Duration**: 2-4 hours
**Estimated Tasks**: ~25

---

## Why This Session Next?

### Prerequisites Met
- [x] Session 01 complete (configuration and environment with PerplexitySettings)
- [x] Review of Perplexity API documentation for exact field names and types
- [x] Understanding of existing schema patterns in backend/app/schemas/

### Dependencies
- **Builds on**: phase03-session01-configuration-and-environment (PerplexitySettings)
- **Enables**: phase03-session03-gemini-schemas-and-exceptions (establishes schema pattern)
- **Required by**: phase03-session04-perplexity-service-and-route (needs schemas)

### Project Progression
This is the natural next step in the Deep Research Backend phase. With configuration complete, we need to define the data structures (schemas) before implementing the service layer. This session establishes the Pydantic schema patterns that will be reused for Gemini schemas in Session 03. The schemas are required by the Perplexity service implementation in Session 04.

---

## Session Overview

### Objective
Implement all Pydantic schemas and custom exception class for the Perplexity Sonar Deep Research API.

### Key Deliverables
1. `backend/app/schemas/perplexity.py` with all schemas and enums
2. `backend/app/exceptions/perplexity.py` with PerplexityAPIError class
3. Updated `backend/app/schemas/__init__.py` exports
4. Updated `backend/app/exceptions/__init__.py` exports

### Scope Summary
- **In Scope (MVP)**:
  - PerplexitySearchMode, PerplexityReasoningEffort, PerplexitySearchContextSize, PerplexityRecencyFilter enums
  - PerplexityDeepResearchRequest with all API parameters
  - PerplexitySearchResult, PerplexityVideo, PerplexityUsage, PerplexityChoice response schemas
  - PerplexityDeepResearchResponse schema
  - PerplexityErrorCode enum and PerplexityAPIError exception with factory methods
- **Out of Scope**: Gemini schemas, service implementation, route definitions

---

## Technical Considerations

### Technologies/Patterns
- Python StrEnum for type-safe enumeration values
- Pydantic v2 BaseModel for request/response validation
- Custom exception class with factory methods pattern
- Field validators for complex validation rules

### Potential Challenges
- Mapping all Perplexity API parameters correctly (web_search_options nesting)
- Ensuring enum values match exact API string values
- Handling optional vs required fields correctly

### API Parameter Categories
The request schema must handle these parameter groups:
- Core: query, system_prompt, model
- Reasoning: search_mode, reasoning_effort, search_context_size
- Generation: max_tokens, temperature, top_p, top_k, presence_penalty, frequency_penalty
- Search filters: search_recency_filter, search_domain_filter, search_after_date_filter, search_before_date_filter
- Output options: return_images, return_related_questions, response_format
- Control: stream, disable_search, enable_search_classifier

---

## Alternative Sessions

If this session is blocked:
1. **phase03-session03-gemini-schemas-and-exceptions** - Could be done in parallel if independent of Perplexity pattern, but Session 02 establishes the pattern to follow
2. No other sessions are viable - Session 04-06 all depend on Sessions 02-03

---

## Next Steps

Run `/sessionspec` to generate the formal specification.
