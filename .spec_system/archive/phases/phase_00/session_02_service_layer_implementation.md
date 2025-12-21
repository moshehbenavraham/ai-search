# Session 02: Service Layer Implementation

**Session ID**: `phase00-session02-service-layer-implementation`
**Status**: Not Started
**Estimated Tasks**: ~25
**Estimated Duration**: 3-4 hours

---

## Objective

Create the TavilyService class that manages sync and async Tavily client instances, implements dependency injection, and provides the foundation for all Tavily operations.

---

## Scope

### In Scope (MVP)
- Create TavilyService class in backend/app/services/tavily.py
- Initialize TavilyClient and AsyncTavilyClient from SDK
- Implement service methods: search, extract, crawl, map_urls
- Add proper client lifecycle management (init/cleanup)
- Create TavilyDep dependency for FastAPI injection
- Register dependency in backend/app/api/deps.py
- Implement basic error wrapping for SDK exceptions
- Add type hints for all methods

### Out of Scope
- Pydantic request/response schemas (Session 03)
- API route handlers (Sessions 04-05)
- Comprehensive error handling (Session 05)
- Testing (Session 06)

---

## Prerequisites

- [ ] Session 01 completed (dependency and configuration)
- [ ] TavilySettings accessible from app configuration
- [ ] Understanding of existing dependency injection patterns

---

## Deliverables

1. TavilyService class with sync and async client initialization
2. Service methods for search, extract, crawl, and map operations
3. TavilyDep annotated dependency for route injection
4. Updated deps.py with Tavily dependency
5. Type-safe method signatures matching SDK patterns

---

## Success Criteria

- [ ] TavilyService initializes without errors
- [ ] Service can be injected into route handlers via TavilyDep
- [ ] All four core methods implemented: search, extract, crawl, map_urls
- [ ] Clients properly use configured API key and timeout
- [ ] Type hints pass mypy/pyright validation
- [ ] No lint errors
