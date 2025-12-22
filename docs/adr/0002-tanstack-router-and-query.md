# 2. TanStack Router and Query for Frontend

**Status:** Accepted
**Date:** 2025-12-21

## Context

The frontend requires routing and data fetching capabilities. Options considered:

1. React Router + SWR
2. React Router + React Query
3. TanStack Router + TanStack Query
4. Next.js App Router

## Decision

Use TanStack Router and TanStack Query for routing and data management.

Key reasons:
- Type-safe routing with file-based route generation
- Integrated data loading with loaders
- Powerful caching and background refetch
- Consistent API with the existing boilerplate

## Consequences

**Enables:**
- Type-safe route parameters and search params
- Automatic route code splitting
- Built-in loading and error states
- Optimistic updates for mutations

**Trade-offs:**
- Learning curve for TanStack-specific patterns
- Route tree regeneration on route file changes

**Prevents:**
- Server-side rendering (would need Next.js)
- Using other router libraries without migration
