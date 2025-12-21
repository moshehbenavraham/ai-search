# Session 01: Dependency and Configuration

**Session ID**: `phase00-session01-dependency-and-configuration`
**Status**: Not Started
**Estimated Tasks**: ~20
**Estimated Duration**: 2-3 hours

---

## Objective

Add the tavily-python SDK dependency and establish all configuration settings required for Tavily API integration, including environment variables, settings schema, and validation.

---

## Scope

### In Scope (MVP)
- Add tavily-python >= 0.5.0 to project dependencies
- Create TAVILY_API_KEY environment variable configuration
- Add optional TAVILY_TIMEOUT configuration (default 60s)
- Add optional TAVILY_PROXY configuration
- Create TavilySettings Pydantic model for config validation
- Integrate settings into existing app config structure
- Update .env.example with Tavily-related variables
- Verify SDK installation and basic import

### Out of Scope
- TavilyService implementation (Session 02)
- API routes (Sessions 04-05)
- Actual API calls (deferred to service layer)

---

## Prerequisites

- [ ] Python environment with pip/Poetry configured
- [ ] Existing FastAPI app config structure understood
- [ ] Valid Tavily API key obtained from tavily.com

---

## Deliverables

1. Updated pyproject.toml/requirements.txt with tavily-python dependency
2. TavilySettings class in backend/app/core/config.py or new module
3. Updated Settings class with Tavily configuration
4. Updated .env.example with TAVILY_API_KEY and optional settings
5. Verification script or test confirming SDK import works

---

## Success Criteria

- [ ] tavily-python package installs without errors
- [ ] TavilySettings validates required TAVILY_API_KEY
- [ ] Optional settings have sensible defaults (timeout=60, proxy=None)
- [ ] App starts without errors when TAVILY_API_KEY is set
- [ ] No lint errors or type check failures
- [ ] Configuration is accessible from app settings
