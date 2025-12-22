# 1. Tavily SDK Integration

**Status:** Accepted
**Date:** 2025-12-21

## Context

The application requires AI-powered web search, content extraction, website crawling, and sitemap generation capabilities. Multiple approaches were considered:

1. Direct HTTP calls to Tavily API
2. Official tavily-python SDK
3. Alternative search APIs (Serper, SerpAPI)

## Decision

Use the official `tavily-python` SDK (>=0.5.0) for all Tavily API interactions.

Key implementation choices:
- AsyncTavilyClient for non-blocking operations
- Dependency injection via TavilyDep for testability
- Pydantic schemas for request/response validation
- Structured error handling with TavilyAPIError

## Consequences

**Enables:**
- Type-safe API interactions with official SDK types
- Automatic handling of authentication and retries
- Easy mocking in tests via dependency injection
- Consistent error handling across all operations

**Trade-offs:**
- Coupled to SDK version updates
- Must regenerate frontend client on schema changes

**Prevents:**
- Direct HTTP call flexibility
- Custom retry/backoff strategies (SDK handles internally)
