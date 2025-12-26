# Project Conventions

This document defines coding conventions for the tavily-app project. All AI-assisted code generation must follow these standards.

## Language and Runtime

- **Backend**: Python 3.11+, FastAPI, async/await patterns
- **Frontend**: TypeScript (strict mode), React 19, Vite
- **Package managers**: pip/poetry (backend), npm (frontend)

## Naming Conventions

### Python (Backend)
- Classes: `PascalCase` (e.g., `PerplexityService`, `GeminiAPIError`)
- Functions/methods: `snake_case` (e.g., `deep_research`, `_build_headers`)
- Variables: `snake_case` (e.g., `api_key`, `poll_interval`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `BASE_URL`, `DEFAULT_TIMEOUT`)
- Private members: prefix with underscore (e.g., `_api_key`, `_handle_error`)
- Enums: `PascalCase` class, `UPPER_SNAKE_CASE` values using `StrEnum`

### TypeScript (Frontend)
- Components: `PascalCase` (e.g., `PerplexityResultView`, `GeminiProgressIndicator`)
- Functions/hooks: `camelCase` (e.g., `usePerplexityDeepResearch`, `handleSubmit`)
- Variables: `camelCase` (e.g., `interactionId`, `pollResult`)
- Constants: `UPPER_SNAKE_CASE` or `camelCase` depending on scope
- Types/Interfaces: `PascalCase` (e.g., `PerplexityDeepResearchRequest`)
- Files: `kebab-case` for routes, `PascalCase` for components

## File Structure

### Backend (`backend/app/`)
- `core/` - Configuration, exceptions, shared utilities
- `schemas/` - Pydantic models (one file per domain: `perplexity.py`, `gemini.py`)
- `services/` - Business logic and API clients (one file per service)
- `api/routes/` - FastAPI route handlers (one file per domain)
- `api/deps.py` - Dependency injection factories
- `api/main.py` - Router registration

### Frontend (`frontend/src/`)
- `components/` - Reusable UI components (grouped by domain: `Perplexity/`, `Gemini/`)
- `hooks/` - Custom React hooks (one file per feature)
- `lib/schemas/` - Zod validation schemas
- `routes/_layout/` - Page components (TanStack Router)
- `client/` - Generated SDK (do not edit manually)

## Functions and Methods

### Python
- Use type hints for all parameters and return types
- Use `async def` for I/O-bound operations (API calls, database)
- Keep functions under 50 lines; extract helpers for complex logic
- Use `@classmethod` factory methods for exception creation
- Prefer returning data over raising exceptions for expected failures

### TypeScript/React
- Use arrow functions for components: `const Component = () => {}`
- Use named exports, not default exports
- Hooks must start with `use` prefix
- Keep components under 150 lines; extract subcomponents
- Use early returns to reduce nesting

## Error Handling

### Python
- Create domain-specific exception classes (e.g., `PerplexityAPIError`, `GeminiAPIError`)
- Use factory methods: `PerplexityAPIError.rate_limit_exceeded()`
- Include `status_code`, `error_code`, `message`, `details` fields
- Map HTTP errors to typed exceptions in service `_handle_error()` methods
- Register exception handlers in `main.py`

### TypeScript
- Use `try/catch` with typed error handling
- Display errors via toast notifications (`useCustomToast`)
- Provide retry options for transient failures
- Log errors to console in development

## Pydantic Schemas (Backend)

- Use `ConfigDict(extra="forbid")` for request schemas (strict validation)
- Use `ConfigDict(extra="allow")` for response schemas (flexible parsing)
- Use `Field()` with descriptions for all fields
- Use `StrEnum` for string-based enums (not `str, Enum`)
- Group related schemas in same file with clear section comments

## React Components

- Use functional components exclusively
- Prefer composition over inheritance
- Use `shadcn/ui` components as base (Button, Input, Card, etc.)
- Apply Tailwind CSS for styling (no CSS modules)
- Handle loading states with skeletons or spinners
- Show error states with clear messaging and retry options

## React Query (TanStack Query v5)

- Use `useMutation` for POST/PUT/DELETE operations
- Use `useQuery` for GET operations with caching
- Use `refetchInterval` for polling (Gemini status checks)
- Handle callbacks with `useEffect`, not deprecated `onSuccess`/`onError`
- Invalidate queries after mutations when data changes

## Forms (React Hook Form + Zod)

- Define Zod schema in `lib/schemas/` directory
- Use `useForm` with `zodResolver`
- Validate on blur and submit
- Display field errors inline
- Disable submit button while loading

## Testing

### Python (pytest)
- Test files: `test_*.py` in `tests/` directory
- Use `pytest-asyncio` for async tests
- Mock external APIs with `pytest-mock` or `respx`
- One test file per module being tested
- Use fixtures for common setup

### Frontend
- Component tests with React Testing Library
- Mock API calls in tests
- Test user interactions, not implementation details

## API Design

- RESTful endpoints under `/api/v1/` prefix
- Use HTTP verbs correctly: GET (read), POST (create/action), DELETE (remove)
- Return structured error responses with `ErrorResponse` schema
- Require JWT authentication on all endpoints (`CurrentUser` dependency)
- Document endpoints via OpenAPI (auto-generated by FastAPI)

## Imports

### Python
- Standard library first, then third-party, then local
- Use absolute imports from `app.` package
- Group imports with blank lines between sections

### TypeScript
- React imports first
- Third-party libraries second
- Local imports last (use `@/` alias)
- Group imports with blank lines between sections

## Dependencies

### Backend
- Pin exact versions in `requirements.txt`
- Use `httpx` for async HTTP clients
- Use `pydantic-settings` for configuration

### Frontend
- Lock versions in `package-lock.json`
- Regenerate SDK after backend schema changes: `npm run generate-client`
- Do not edit files in `client/` directory

## Git and Version Control

- Commit messages: imperative mood, max 72 characters
- Branch naming: `feature/`, `fix/`, `refactor/` prefixes
- Do not commit `.env` files or API keys
- Run linters before committing

## Code Quality

### Python
- Run `ruff` for linting and formatting
- No type errors from `mypy`
- Docstrings for public functions and classes

### TypeScript
- Run `eslint` and `prettier`
- No TypeScript errors in strict mode
- JSDoc comments for complex functions
