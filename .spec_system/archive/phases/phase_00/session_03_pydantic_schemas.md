# Session 03: Pydantic Schemas

**Session ID**: `phase00-session03-pydantic-schemas`
**Status**: Not Started
**Estimated Tasks**: ~25
**Estimated Duration**: 3-4 hours

---

## Objective

Implement comprehensive Pydantic v2 schemas for all Tavily API request and response types, ensuring full parameter support and proper validation.

---

## Scope

### In Scope (MVP)
- Create SearchRequest schema with all SDK parameters
- Create SearchResponse schema with result structure
- Create ExtractRequest schema (single and batch URLs)
- Create ExtractResponse schema with extracted content
- Create CrawlRequest schema with depth, breadth, instructions
- Create CrawlResponse schema with crawl results
- Create MapRequest schema for sitemap generation
- Create MapResponse schema with URL list
- Add field validators for URL formats, enum constraints
- Create shared base schemas for common patterns
- Document all fields with descriptions

### Out of Scope
- API route implementation (Sessions 04-05)
- Error response schemas (Session 05)
- Testing (Session 06)

---

## Prerequisites

- [ ] Session 02 completed (service layer exists)
- [ ] tavily-python SDK documentation reviewed
- [ ] Understanding of Pydantic v2 patterns

---

## Deliverables

1. backend/app/schemas/tavily.py with all request/response models
2. SearchRequest with: query, search_depth, topic, max_results, include_domains, exclude_domains, include_answer, include_raw_content, include_images
3. ExtractRequest with: urls (single or list), include_images
4. CrawlRequest with: url, max_depth, max_breadth, limit, instructions, include_paths, exclude_paths
5. MapRequest with: url, max_depth, max_breadth, limit
6. Corresponding response schemas matching SDK return types
7. Proper Optional/Required field definitions

---

## Success Criteria

- [ ] All request schemas cover full SDK parameter set
- [ ] Response schemas match SDK return structures
- [ ] Field validators enforce URL format where needed
- [ ] Enums used for topic (general/news/finance) and search_depth (basic/advanced)
- [ ] Optional fields have sensible defaults
- [ ] Schemas serialize to valid JSON for OpenAPI spec
- [ ] No lint errors or type check failures
