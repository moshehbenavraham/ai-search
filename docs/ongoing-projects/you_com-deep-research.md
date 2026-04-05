# You.com Deep Research Integration Plan

## Objective

Add You.com's Research API as a fourth research platform in the app, alongside Tavily, Perplexity, and Gemini, with a first-class UI tab, backend proxy endpoint, save-to-Items support, generated client updates, and test coverage.

This plan is based on:

- `docs/ongoing-projects/new-tabs.md` for the existing integration pattern
- the current Perplexity and Gemini implementations already in the repo
- the You.com Research API details currently captured in this document before replacement

## Implementation Status

Last updated: 2026-04-05

- Implemented: backend You.com settings, schemas, exception handling, service, route wiring, and item typing
- Implemented: OpenAPI/client refresh, frontend route/components/hook, sidebar integration, route tree regeneration, and save-to-Items mapper
- Implemented: backend-focused test files for the new service and route
- Verified: `cd backend && uv run python -m ruff check ...` passes for the touched backend files
- Verified: `cd backend && uv run python -m pytest tests/services/test_youcom.py tests/api/routes/test_youcom.py -q` passes once PostgreSQL is available on `localhost:5439` and Alembic migrations are applied
- Verified: `cd frontend && npm run build` passes
- Remaining: manual end-to-end verification against a real `YOUCOM_API_KEY`

### Session Notes

- This doc is being updated during implementation so a later session can resume from repo state instead of reconstructing intent from chat history.
- The backend will follow the synchronous Perplexity-style integration path, not the Gemini polling flow.
- `frontend` build is passing after the new route and route-tree updates.
- The backend test fixture uses `backend/.env`, so local test runs target PostgreSQL at `localhost:5439`.
- In this session, backend verification used a temporary local PostgreSQL container bound to `5439`, followed by `cd backend && uv run python -m alembic upgrade head`.
- After that DB bootstrap, `uv run python -m pytest tests/services/test_youcom.py tests/api/routes/test_youcom.py -q` passed.
- The temporary verification database was removed after the test run, and `localhost:5439` is no longer occupied by this session.

## Recommended Naming Convention

Use `youcom` as the internal integration key everywhere code needs a stable identifier.

| Surface | Recommended name |
|---|---|
| User-facing label | `You.com Research` |
| Backend module prefix | `youcom` |
| API route prefix | `/api/v1/youcom` |
| Frontend route | `/youcom-research` |
| Item `content_type` | `youcom` |
| Env var prefix | `YOUCOM_` |

This avoids punctuation drift between `you.com`, `you-com`, `you_com`, and `you`.

## API Shape To Implement

Treat You.com as a synchronous deep research provider, similar to Perplexity rather than Gemini.

### External API contract

- Method: `POST`
- URL: `https://api.you.com/v1/research`
- Auth: `X-API-Key: <key>`
- Request body:
  - `input: string`
  - `research_effort: "lite" | "standard" | "deep" | "exhaustive"`
- Response body:
  - `output.content`
  - `output.content_type`
  - `output.sources[]`

### Internal app contract

Keep the frontend/backend form contract consistent with the existing app by using `query` internally, then mapping it to `input` inside the service layer.

Recommended internal request model:

```json
{
  "query": "string",
  "research_effort": "standard"
}
```

## Scope

### In scope

- Backend settings, schemas, exceptions, service, dependency wiring, routes, and exception handler
- Frontend schema, hook, route, form, result view, sidebar entry, and Items save flow
- OpenAPI regeneration and frontend generated client refresh
- Docs and env example updates
- Automated tests for backend service/route behavior and frontend validation/mapping coverage where practical

### Out of scope for first pass

- Streaming support
- Multi-turn You.com continuation workflows
- provider-specific advanced options beyond `research_effort`
- visual redesign of the research pages

## Architecture Decision

Implement You.com using the Perplexity pattern with a thinner request surface.

Why:

- The API is synchronous
- The response is already markdown-oriented
- The app already has a proven sync deep-research path with loading state and save-to-Items
- Gemini's polling state machine would add unnecessary complexity

## Implementation Workstreams

## 1. Backend

### 1.1 Configuration

Update [backend/app/core/config.py](/home/aiwithapex/projects/ai-search/backend/app/core/config.py) with a new `YouComSettings` class.

Recommended fields:

- `api_key: str | None = None`
- `timeout: int = 300`
- `default_research_effort: YouComResearchEffort = STANDARD`

Recommended env vars:

- `YOUCOM_API_KEY`
- `YOUCOM_TIMEOUT`
- `YOUCOM_DEFAULT_RESEARCH_EFFORT`

Add a `YouComResearchEffort` `StrEnum` with:

- `lite`
- `standard`
- `deep`
- `exhaustive`

Also register `youcom` on the root `Settings` object, parallel to `tavily`, `perplexity`, and `gemini`.

### 1.2 Schemas

Create [backend/app/schemas/youcom.py](/home/aiwithapex/projects/ai-search/backend/app/schemas/youcom.py).

Recommended models:

- `YouComResearchEffort`
- `YouComDeepResearchRequest`
- `YouComSource`
- `YouComOutput`
- `YouComDeepResearchResponse`

Recommended request schema:

- `query: str`
- `research_effort: YouComResearchEffort = standard`

Recommended response schema:

- `output: YouComOutput`
- permissive `ConfigDict(extra="allow")` on response models so undocumented extra fields do not break parsing

Recommended nested output fields:

- `content: str`
- `content_type: str = "text"`
- `sources: list[YouComSource] = []`

Recommended source fields:

- `url: str`
- `title: str | None`
- `snippets: list[str] = []`

### 1.3 Exceptions

Create [backend/app/exceptions/youcom.py](/home/aiwithapex/projects/ai-search/backend/app/exceptions/youcom.py).

Mirror the Perplexity/Gemini exception pattern with:

- `YouComErrorCode`
- `YouComAPIError`
- classmethods for:
  - invalid API key
  - rate limit exceeded
  - invalid request
  - request timeout
  - generic API error

Then wire this into [backend/app/main.py](/home/aiwithapex/projects/ai-search/backend/app/main.py) with a dedicated exception handler returning the shared `ErrorResponse`.

### 1.4 Service Layer

Create [backend/app/services/youcom.py](/home/aiwithapex/projects/ai-search/backend/app/services/youcom.py).

Responsibilities:

- validate API key presence at initialization
- build `X-API-Key` auth header
- map internal request body to external payload:
  - `query -> input`
  - `research_effort -> research_effort`
- perform async `httpx` POST to `https://api.you.com/v1/research`
- parse and validate the response
- map HTTP errors into `YouComAPIError`

Implementation notes:

- follow the Perplexity service structure, not the Gemini polling structure
- keep payload minimal until real product needs require extra You.com options
- do not depend on undocumented top-level usage or job fields

### 1.5 Dependency Injection and Routes

Update [backend/app/api/deps.py](/home/aiwithapex/projects/ai-search/backend/app/api/deps.py):

- add `get_youcom_service()`
- add `YouComDep`

Create [backend/app/api/routes/youcom.py](/home/aiwithapex/projects/ai-search/backend/app/api/routes/youcom.py).

Recommended endpoint:

- `POST /api/v1/youcom/deep-research`

Route behavior:

- require JWT auth via `CurrentUser`
- accept `YouComDeepResearchRequest`
- return `YouComDeepResearchResponse`
- delegate directly to `YouComService.deep_research()`

Update [backend/app/api/main.py](/home/aiwithapex/projects/ai-search/backend/app/api/main.py) to include the new router.

### 1.6 Schema Exports

Update [backend/app/schemas/__init__.py](/home/aiwithapex/projects/ai-search/backend/app/schemas/__init__.py) and any exception export modules if the project is maintaining those public imports consistently.

## 2. Frontend

### 2.1 Generated Client Prerequisite

Once the backend route and schemas exist, regenerate the OpenAPI client.

Relevant flow:

- refresh backend OpenAPI
- run `./scripts/generate-client.sh`
- verify generated You.com types and service methods appear under `frontend/src/client-generated/`

Do not hand-edit generated files.

### 2.2 Form Validation Schema

Create [frontend/src/lib/schemas/youcom.ts](/home/aiwithapex/projects/ai-search/frontend/src/lib/schemas/youcom.ts).

Recommended contents:

- `researchEffortOptions = ["lite", "standard", "deep", "exhaustive"]`
- `youComDeepResearchSchema`
- `YouComFormData`
- `youComFormDefaults`

Recommended validation:

- `query` required, trimmed, bounded
- `research_effort` enum with default `standard`

### 2.3 Data Hook

Create [frontend/src/hooks/useYouComDeepResearch.ts](/home/aiwithapex/projects/ai-search/frontend/src/hooks/useYouComDeepResearch.ts).

Pattern:

- use `useMutation`
- call generated `YouComService.deepResearch(...)`
- route errors through `useCustomToast`
- match the existing Perplexity hook style

### 2.4 UI Components

Create a new folder:

- [frontend/src/components/YouCom](/home/aiwithapex/projects/ai-search/frontend/src/components/YouCom)

Recommended components:

- `YouComDeepResearchForm.tsx`
- `YouComResultView.tsx`
- `YouComSourcesList.tsx`
- `index.ts`

Form responsibilities:

- collect query
- collect research effort
- disable during request
- stay visually aligned with Perplexity/Gemini pages

Result view responsibilities:

- render `response.output.content` as markdown
- render source list from `response.output.sources`
- expose Save action to Items
- show empty-state fallback if content is missing

### 2.5 Route Page

Create [frontend/src/routes/_layout/youcom-research.tsx](/home/aiwithapex/projects/ai-search/frontend/src/routes/_layout/youcom-research.tsx).

Pattern:

- copy the Perplexity page structure, then simplify to only the You.com fields
- local state for `result`, `lastQuery`, and `elapsedSeconds`
- loading card while the mutation is pending
- result card after success
- error card after failure

Header copy should make the synchronous behavior clear:

- comprehensive research with citations
- slower than standard Tavily search
- no background job or polling required

### 2.6 Navigation

Update [frontend/src/components/Sidebar/AppSidebar.tsx](/home/aiwithapex/projects/ai-search/frontend/src/components/Sidebar/AppSidebar.tsx).

Add a new entry under `deepResearchItems`:

- title: `You.com Research`
- path: `/youcom-research`
- icon: choose one that does not collide visually with the existing research items

### 2.7 Route Tree

Let TanStack Router regenerate [frontend/src/routeTree.gen.ts](/home/aiwithapex/projects/ai-search/frontend/src/routeTree.gen.ts) from the new route file. Do not edit that file directly.

## 3. Items Integration

You.com results should be savable exactly like Perplexity and Gemini research outputs.

### 3.1 Shared Data Mapping

Update [frontend/src/lib/deep-research-mappers.ts](/home/aiwithapex/projects/ai-search/frontend/src/lib/deep-research-mappers.ts).

Add:

- `mapYouComResultToItem(response, query): ItemCreate`

Recommended mapping:

- `title`: `You.com: ${query}`
- `description`: first 255 chars of the content
- `content`: `response.output.content`
- `content_type`: `youcom`
- `item_metadata`:
  - `query`
  - `research_effort` if available from the request context
  - `content_type`
  - `sources`

If the save action needs the selected effort later, pass it into the mapper explicitly from the route or result view.

### 3.2 Backend Item Typing

Update [backend/app/models.py](/home/aiwithapex/projects/ai-search/backend/app/models.py):

- extend `ContentType` with `youcom`

Update [backend/app/api/routes/items.py](/home/aiwithapex/projects/ai-search/backend/app/api/routes/items.py):

- extend `ContentTypeFilter` with `youcom`

Important:

- no database migration should be required for `content_type`
- the column is already stored as a plain `String(50)`, so this is an application-schema change, not a table-shape change

### 3.3 Frontend Item Typing

Update:

- [frontend/src/components/Items/ContentTypeFilter.tsx](/home/aiwithapex/projects/ai-search/frontend/src/components/Items/ContentTypeFilter.tsx)
- [frontend/src/components/Items/ContentTypeBadge.tsx](/home/aiwithapex/projects/ai-search/frontend/src/components/Items/ContentTypeBadge.tsx)

Add:

- display label `You.com`
- a distinct badge color
- filter option for `youcom`

Generated client types will also pick up the new `content_type` union after regeneration.

## 4. Documentation and Environment Updates

Update these docs so the integration is discoverable and configurable:

- [.env.example](/home/aiwithapex/projects/ai-search/.env.example)
- [README.md](/home/aiwithapex/projects/ai-search/README.md)
- [docs/environments.md](/home/aiwithapex/projects/ai-search/docs/environments.md)
- [backend/README_backend.md](/home/aiwithapex/projects/ai-search/backend/README_backend.md)
- [frontend/README_frontend.md](/home/aiwithapex/projects/ai-search/frontend/README_frontend.md)

Environment rollout status:

- local `.env` should contain `YOUCOM_API_KEY`
- `.env.example` should carry the placeholder and default You.com settings

Recommended env example entries:

```env
YOUCOM_API_KEY=
YOUCOM_TIMEOUT=300
YOUCOM_DEFAULT_RESEARCH_EFFORT=standard
```

## 5. Test Plan

## Backend tests

Add focused tests for:

- request validation on `YouComDeepResearchRequest`
- service payload mapping from `query` to `input`
- auth header formatting
- success response parsing
- HTTP error mapping for 400, 401, 429, timeout, and unexpected errors
- route auth requirement and happy-path response shape

Likely files:

- `backend/tests/services/test_youcom.py`
- `backend/tests/api/routes/test_youcom.py`

Mock `httpx.AsyncClient` responses rather than calling the real You.com API in normal test runs.

## Frontend tests

At minimum, add unit-level coverage for:

- `youcom` zod schema defaults and validation
- `mapYouComResultToItem`

If the repo already has a testing setup for frontend components, add coverage for:

- form submission payload
- result rendering for markdown and sources
- save button behavior

## Manual verification

Run through:

1. Open `/youcom-research`
2. Submit a valid query with each effort tier at least once
3. Confirm loading state behaves like Perplexity
4. Confirm markdown answer renders correctly
5. Confirm sources render correctly
6. Save result to Items
7. Confirm the saved item shows `You.com` badge and can be filtered by type
8. Confirm unauthorized requests still fail correctly if JWT is missing

## 6. Suggested Delivery Order

Implement in this order to keep feedback loops short:

1. Backend config, schemas, exception, service, route
2. OpenAPI regeneration and generated client refresh
3. Frontend schema, hook, route, form, result view
4. Sidebar integration
5. Items integration and `content_type` updates
6. Docs and env updates
7. Backend and frontend tests
8. Manual verification

## 7. Concrete File Checklist

### Create

- `backend/app/schemas/youcom.py`
- `backend/app/exceptions/youcom.py`
- `backend/app/services/youcom.py`
- `backend/app/api/routes/youcom.py`
- `frontend/src/lib/schemas/youcom.ts`
- `frontend/src/hooks/useYouComDeepResearch.ts`
- `frontend/src/components/YouCom/index.ts`
- `frontend/src/components/YouCom/YouComDeepResearchForm.tsx`
- `frontend/src/components/YouCom/YouComResultView.tsx`
- `frontend/src/components/YouCom/YouComSourcesList.tsx`
- `frontend/src/routes/_layout/youcom-research.tsx`
- `backend/tests/services/test_youcom.py`
- `backend/tests/api/routes/test_youcom.py`

### Update

- `backend/app/core/config.py`
- `backend/app/api/deps.py`
- `backend/app/api/main.py`
- `backend/app/main.py`
- `backend/app/models.py`
- `backend/app/api/routes/items.py`
- `backend/app/schemas/__init__.py`
- `frontend/src/lib/deep-research-mappers.ts`
- `frontend/src/components/Sidebar/AppSidebar.tsx`
- `frontend/src/components/Items/ContentTypeFilter.tsx`
- `frontend/src/components/Items/ContentTypeBadge.tsx`
- `frontend/src/routeTree.gen.ts`
- `frontend/src/client-generated/*`
- `frontend/src/client/*`
- `.env.example`
- `README.md`
- `docs/environments.md`
- `backend/README_backend.md`
- `frontend/README_frontend.md`

## 8. Risks and Decisions To Keep Explicit

### Minimal request surface first

Do not import every possible You.com capability into v1 of this tab. Start with `query` plus `research_effort`. That matches the documented API and keeps the UI coherent.

### Preserve internal consistency

Use `query` in app-level forms and schemas even though the upstream API uses `input`. The service layer should absorb that mismatch.

### Avoid generated-file drift

The route, item union, and response models will change the OpenAPI schema. Regenerate the client once the backend contract is stable, and avoid hand-fixing generated code.

### No migration unless model shape changes

Adding `youcom` to the content-type literal should not require a new Alembic revision because the DB column already exists and is not constrained to a DB enum.

## 9. Definition of Done

The You.com integration is complete when:

- authenticated users can open `/youcom-research`
- users can submit a query and choose effort
- the backend successfully proxies to You.com with `X-API-Key`
- the frontend renders markdown results and sources
- results can be saved to Items with `content_type = "youcom"`
- Items can filter and badge You.com content
- docs and env examples mention You.com
- backend tests pass for the new service/route
- generated client code is updated and committed
