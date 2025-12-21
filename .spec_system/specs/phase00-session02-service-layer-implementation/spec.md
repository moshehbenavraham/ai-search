# Session Specification

**Session ID**: `phase00-session02-service-layer-implementation`
**Phase**: 00 - Core Setup
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session creates the TavilyService class that serves as the central integration point between the FastAPI application and the Tavily Python SDK. The service layer encapsulates all SDK interactions, manages client lifecycle, and provides a clean interface for the API routes to consume.

The TavilyService class will manage both synchronous (TavilyClient) and asynchronous (AsyncTavilyClient) clients from the tavily-python SDK. Since FastAPI is async-first, the primary implementation will use AsyncTavilyClient for all operations. The service methods will mirror the four core Tavily operations: search, extract, crawl, and map.

This session is critical because it establishes the foundation for all subsequent work. Sessions 03-06 depend on having a functional service layer: Pydantic schemas will model the service method inputs/outputs, API routes will inject the service via TavilyDep, and tests will verify the service behavior. Without this service layer, no further progress is possible.

---

## 2. Objectives

1. Create TavilyService class with async client initialization using TavilySettings configuration
2. Implement four core async service methods: search, extract, crawl, and map_urls
3. Create TavilyDep annotated dependency for FastAPI route injection following existing deps.py patterns
4. Ensure all methods have proper type hints compatible with mypy strict mode

---

## 3. Prerequisites

### Required Sessions
- [x] `phase00-session01-dependency-and-configuration` - Provides TavilySettings with api_key, timeout, and proxy configuration

### Required Tools/Knowledge
- Understanding of FastAPI dependency injection (Annotated, Depends)
- Familiarity with Python async/await patterns
- Knowledge of tavily-python SDK API (TavilyClient, AsyncTavilyClient)

### Environment Requirements
- tavily-python >= 0.5.0 installed (verified in Session 01)
- Valid TAVILY_API_KEY in environment (for manual testing)

---

## 4. Scope

### In Scope (MVP)
- Create `backend/app/services/` directory structure
- Create TavilyService class in `backend/app/services/tavily.py`
- Initialize AsyncTavilyClient using settings.tavily configuration
- Implement async search method with full parameter passthrough
- Implement async extract method for single and batch URL extraction
- Implement async crawl method with depth, breadth, and instruction support
- Implement async map_urls method for sitemap generation
- Create TavilyDep annotated dependency for FastAPI injection
- Register TavilyDep in `backend/app/api/deps.py`
- Add type hints for all public methods (use dict for SDK return types)
- Add docstrings documenting method parameters

### Out of Scope (Deferred)
- Pydantic request/response schemas - *Reason: Session 03*
- API route handlers - *Reason: Sessions 04-05*
- Comprehensive error handling with custom exceptions - *Reason: Session 05*
- Unit and integration tests - *Reason: Session 06*
- Sync client methods - *Reason: FastAPI is async-first, sync not needed*

---

## 5. Technical Approach

### Architecture

```
backend/app/
  services/
    __init__.py          # Export TavilyService
    tavily.py            # TavilyService class
  api/
    deps.py              # Add TavilyDep dependency
```

The TavilyService follows a singleton-like pattern via FastAPI dependency injection:

```
TavilySettings (config.py)
       |
       v
TavilyService (services/tavily.py)
       |
       v
TavilyDep (deps.py) --> Route Handlers
```

### Design Patterns
- **Service Layer Pattern**: Encapsulates SDK interactions, provides clean interface
- **Dependency Injection**: FastAPI Annotated[TavilyService, Depends(get_tavily_service)]
- **Async-First**: All methods are async, using AsyncTavilyClient
- **Configuration Injection**: Service reads from settings.tavily at initialization

### Technology Stack
- tavily-python 0.7.17 (AsyncTavilyClient)
- FastAPI dependency injection
- Python 3.10+ async/await
- Type hints with dict[str, Any] for SDK responses

---

## 6. Deliverables

### Files to Create

| File | Purpose | Est. Lines |
|------|---------|------------|
| `backend/app/services/__init__.py` | Package init, export TavilyService | ~5 |
| `backend/app/services/tavily.py` | TavilyService class with all methods | ~150 |

### Files to Modify

| File | Changes | Est. Lines |
|------|---------|------------|
| `backend/app/api/deps.py` | Add get_tavily_service function and TavilyDep | ~15 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] TavilyService class can be instantiated without errors
- [ ] Service initializes AsyncTavilyClient with configured API key
- [ ] Service respects timeout setting from TavilySettings
- [ ] Service respects proxy setting from TavilySettings (when set)
- [ ] search() method accepts query and returns dict
- [ ] extract() method accepts URLs and returns dict
- [ ] crawl() method accepts URL and returns dict
- [ ] map_urls() method accepts URL and returns dict
- [ ] TavilyDep can be used in route handler signatures
- [ ] Dependency injection provides TavilyService instance

### Testing Requirements
- [ ] Manual verification: import TavilyService succeeds
- [ ] Manual verification: TavilyDep import succeeds
- [ ] Manual verification: service methods are callable (no runtime errors)

### Quality Gates
- [ ] No mypy type errors (`uv run mypy app`)
- [ ] No ruff lint errors (`uv run ruff check app`)
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] Code follows existing deps.py patterns

---

## 8. Implementation Notes

### Key Considerations

1. **Client Initialization**: AsyncTavilyClient takes `api_key` and optional `proxies` dict. The proxy from TavilySettings needs to be converted to the expected format.

2. **Method Signatures**: Each service method should accept the full set of SDK parameters as keyword arguments. Use `**kwargs` sparingly - prefer explicit parameters for type safety.

3. **Return Types**: The SDK returns `dict` from all methods. Type hint as `dict[str, Any]` for now; Pydantic schemas (Session 03) will provide structured types later.

4. **Timeout Handling**: The SDK methods accept their own timeout parameter. The service should use settings.tavily.timeout as the default but allow override per-call.

5. **Dependency Pattern**: Follow the existing SessionDep pattern:
   ```python
   def get_tavily_service() -> TavilyService:
       return TavilyService()

   TavilyDep = Annotated[TavilyService, Depends(get_tavily_service)]
   ```

### Potential Challenges

- **Type Stubs**: tavily-python may lack complete type stubs. May need `# type: ignore` on some SDK calls or create stub definitions.
- **Proxy Format**: TavilySettings.proxy is `str | None`, but AsyncTavilyClient expects `dict[str, str] | None`. Need conversion logic.
- **Async Context**: Ensure service methods properly await SDK calls.

### ASCII Reminder

All output files must use ASCII-only characters (0-127). No smart quotes, em-dashes, or Unicode characters in docstrings or comments.

---

## 9. Testing Strategy

### Unit Tests
- Not in scope for this session (deferred to Session 06)

### Integration Tests
- Not in scope for this session (deferred to Session 06)

### Manual Testing

1. **Import Verification**:
   ```bash
   cd backend && uv run python -c "from app.services.tavily import TavilyService; print('OK')"
   ```

2. **Dependency Import**:
   ```bash
   cd backend && uv run python -c "from app.api.deps import TavilyDep; print('OK')"
   ```

3. **Service Instantiation**:
   ```bash
   cd backend && TAVILY_API_KEY=test-key uv run python -c "
   from app.services.tavily import TavilyService
   svc = TavilyService()
   print(f'Client initialized: {svc._client is not None}')
   "
   ```

4. **Type Checking**:
   ```bash
   cd backend && uv run mypy app/services app/api/deps.py
   ```

5. **Lint Check**:
   ```bash
   cd backend && uv run ruff check app/services app/api/deps.py
   ```

### Edge Cases
- Service should handle missing proxy gracefully (None -> no proxy)
- Service should fail clearly if api_key is empty (SDK should raise)

---

## 10. Dependencies

### External Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| tavily-python | >= 0.5.0 | AsyncTavilyClient for Tavily API integration |
| fastapi | >= 0.114.2 | Dependency injection (Depends, Annotated) |

### Other Sessions
- **Depends on**: Session 01 (TavilySettings configuration)
- **Depended by**:
  - Session 03: Pydantic Schemas (uses service method signatures as reference)
  - Session 04: Search and Extract Routes (injects TavilyDep)
  - Session 05: Crawl, Map and Error Handling (injects TavilyDep)
  - Session 06: Testing Suite (tests service methods)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
