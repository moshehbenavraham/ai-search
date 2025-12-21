# Session Specification

**Session ID**: `phase00-session01-dependency-and-configuration`
**Phase**: 00 - Core Setup
**Status**: Not Started
**Created**: 2025-12-21

---

## 1. Session Overview

This session establishes the foundational infrastructure for Tavily API integration in the tavily-app backend. It focuses exclusively on dependency management and configuration setup, ensuring the tavily-python SDK is properly installed and all required environment variables are validated through type-safe Pydantic settings.

The session is critical because all subsequent Phase 00 sessions depend on this foundation. Session 02 (Service Layer) requires the SDK to be importable; Sessions 03-05 (Schemas and Routes) require configuration to be accessible; Session 06 (Testing) requires everything to be in place.

By completing this session, we achieve a clean separation of concerns: configuration is centralized, environment variables are validated at startup, and the SDK is available throughout the application. This follows the existing FastAPI boilerplate patterns established in `backend/app/core/config.py`.

---

## 2. Objectives

1. Add tavily-python SDK (>=0.5.0) as a project dependency via pyproject.toml
2. Create TavilySettings Pydantic model with validated API key and optional timeout/proxy settings
3. Integrate TavilySettings into the existing Settings class in config.py
4. Verify SDK installation and configuration loading work correctly

---

## 3. Prerequisites

### Required Sessions
- None (this is the first session)

### Required Tools/Knowledge
- Python 3.10+ with uv package manager
- Understanding of Pydantic v2 settings management
- Familiarity with FastAPI configuration patterns

### Environment Requirements
- Valid Tavily API key (obtainable from tavily.com)
- Backend development environment configured

---

## 4. Scope

### In Scope (MVP)
- Add tavily-python>=0.5.0 to backend/pyproject.toml dependencies
- Create TavilySettings nested model with TAVILY_API_KEY (required)
- Add TAVILY_TIMEOUT optional setting (default: 60 seconds)
- Add TAVILY_PROXY optional setting (default: None)
- Integrate TavilySettings as `tavily` attribute on main Settings class
- Verify .env.example has correct Tavily variables (already present)
- Add inline documentation for configuration options
- Verify SDK imports correctly after installation

### Out of Scope (Deferred)
- TavilyService class implementation - *Reason: Session 02*
- Pydantic request/response schemas - *Reason: Session 03*
- API route implementations - *Reason: Sessions 04-05*
- Dependency injection setup (TavilyDep) - *Reason: Session 02*
- Unit/integration tests - *Reason: Session 06*

---

## 5. Technical Approach

### Architecture

The configuration follows a nested settings pattern:

```
Settings (main config)
  |-- tavily: TavilySettings
        |-- api_key: str (required, from TAVILY_API_KEY)
        |-- timeout: int (optional, default=60)
        |-- proxy: str | None (optional, default=None)
```

This approach:
- Keeps Tavily config isolated and testable
- Allows easy access via `settings.tavily.api_key`
- Follows existing patterns (SMTP, Postgres configs are similar)

### Design Patterns
- **Nested Settings Model**: Encapsulates related config in a sub-model
- **Environment Variable Prefix**: Uses `TAVILY_` prefix for all related vars
- **Fail-Fast Validation**: Missing API key raises error at startup

### Technology Stack
- tavily-python >= 0.5.0 (official SDK)
- pydantic-settings >= 2.2.1 (already installed)
- pydantic > 2.0 (already installed)

---

## 6. Deliverables

### Files to Modify

| File | Changes | Est. Lines |
|------|---------|------------|
| `backend/pyproject.toml` | Add tavily-python dependency | +1 |
| `backend/app/core/config.py` | Add TavilySettings class and integrate into Settings | +25 |
| `.env.example` | Add TAVILY_TIMEOUT and TAVILY_PROXY examples | +5 |

### Files to Create

None - all changes are modifications to existing files.

---

## 7. Success Criteria

### Functional Requirements
- [ ] tavily-python package installs without dependency conflicts
- [ ] `from tavily import TavilyClient` imports successfully
- [ ] TavilySettings validates that TAVILY_API_KEY is provided
- [ ] App fails to start with clear error if TAVILY_API_KEY is missing
- [ ] App starts successfully when TAVILY_API_KEY is set
- [ ] settings.tavily.api_key returns the configured API key
- [ ] settings.tavily.timeout defaults to 60 if not specified
- [ ] settings.tavily.proxy defaults to None if not specified

### Testing Requirements
- [ ] Manual verification: `uv sync` installs tavily-python
- [ ] Manual verification: Python REPL can import tavily
- [ ] Manual verification: App starts with valid .env
- [ ] Manual verification: App fails gracefully without TAVILY_API_KEY

### Quality Gates
- [ ] No mypy type errors (`uv run mypy app`)
- [ ] No ruff lint errors (`uv run ruff check app`)
- [ ] All files ASCII-encoded (0-127 characters only)
- [ ] Unix LF line endings
- [ ] Code follows existing config.py patterns

---

## 8. Implementation Notes

### Key Considerations

1. **Nested Model Pattern**: Use `model_config = SettingsConfigDict(env_prefix="TAVILY_")` in TavilySettings to automatically map TAVILY_API_KEY, TAVILY_TIMEOUT, etc.

2. **Required vs Optional Fields**:
   - `api_key: str` - Required, no default (must be provided)
   - `timeout: int = 60` - Optional with sensible default
   - `proxy: str | None = None` - Optional, disabled by default

3. **Integration Approach**: Add `tavily: TavilySettings` as an attribute on the main Settings class. This is initialized when Settings loads.

4. **Validation Timing**: Pydantic validates at instantiation. If TAVILY_API_KEY is missing, the app will fail to start with a clear validation error.

### Potential Challenges

- **Dependency Conflicts**: The tavily-python SDK may have dependencies that conflict with existing packages. Mitigation: Check uv sync output carefully.
- **API Key Format**: Tavily API keys have a specific format (tvly-...). We do NOT validate format here - leave that to the SDK. Just ensure it's a non-empty string.

### ASCII Reminder

All output files must use ASCII-only characters (0-127). No smart quotes, no em-dashes, no special Unicode characters.

---

## 9. Testing Strategy

### Unit Tests
- Not in scope for this session (deferred to Session 06)

### Integration Tests
- Not in scope for this session (deferred to Session 06)

### Manual Testing

1. **Dependency Installation**:
   ```bash
   cd backend && uv sync
   ```
   Verify no errors and tavily-python is installed.

2. **Import Verification**:
   ```bash
   cd backend && uv run python -c "from tavily import TavilyClient; print('OK')"
   ```
   Should print "OK".

3. **Config Loading (with key)**:
   ```bash
   cd backend && TAVILY_API_KEY=test-key uv run python -c "from app.core.config import settings; print(settings.tavily.api_key)"
   ```
   Should print "test-key".

4. **Config Loading (without key)**:
   ```bash
   cd backend && unset TAVILY_API_KEY && uv run python -c "from app.core.config import settings"
   ```
   Should fail with validation error about missing TAVILY_API_KEY.

### Edge Cases
- Empty string for TAVILY_API_KEY should fail validation
- Whitespace-only TAVILY_API_KEY should fail validation
- Non-integer TAVILY_TIMEOUT should fail validation

---

## 10. Dependencies

### External Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| tavily-python | >= 0.5.0 | Official Tavily SDK for API integration |

### Other Sessions
- **Depends on**: None (first session)
- **Depended by**:
  - Session 02: Service Layer Implementation (requires SDK)
  - Session 03: Pydantic Schemas (requires config access)
  - Session 04: Search and Extract Routes (requires everything)
  - Session 05: Crawl, Map and Error Handling (requires everything)
  - Session 06: Testing Suite (requires everything)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.
