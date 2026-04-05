# Deep Research API Integration Requirements

## Executive Summary

This document defines the requirements for integrating two deep research APIs into the existing Tavily application:

1. **Perplexity Sonar Deep Research** - Synchronous expert-level research API (with optional streaming)
2. **Google Gemini Deep Research** - Asynchronous agentic research system with polling/streaming

Both integrations follow the established architectural patterns documented in `new-tabs.md`.

> **Note:** This document was validated against the API examples in `EXAMPLE/gemini-perplexity-deepresearch-api/docs/` and aligned with existing codebase patterns in `backend/app/`.

---

## API Specifications Summary

### Perplexity Sonar Deep Research

| Attribute | Value |
|-----------|-------|
| Endpoint | `POST https://api.perplexity.ai/chat/completions` |
| Model | `sonar-deep-research` |
| Auth | Bearer token (`Authorization: Bearer <key>`) |
| Pattern | **Synchronous** - immediate response |
| Context Window | 128K tokens |

### Google Gemini Deep Research

| Attribute | Value |
|-----------|-------|
| Endpoint | `POST https://generativelanguage.googleapis.com/v1beta/interactions` |
| Agent | `deep-research-pro-preview-12-2025` |
| Auth | API key header (`x-goog-api-key: <key>`) |
| Pattern | **Asynchronous** - background job with polling |
| Max Duration | 60 minutes (typical ~20 min) |

---

## Backend Requirements

### 1. Configuration (`backend/app/core/config.py`)

#### 1.1 PerplexitySettings

```python
class PerplexitySettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        env_prefix="PERPLEXITY_",
    )

    api_key: str
    timeout: int = 300  # Deep research can take longer
    default_model: str = "sonar-deep-research"
    default_search_mode: str = "web"
    default_reasoning_effort: str = "high"
```

**Environment Variables:**
- `PERPLEXITY_API_KEY` (required)
- `PERPLEXITY_TIMEOUT` (optional, default: 300)
- `PERPLEXITY_DEFAULT_MODEL` (optional)
- `PERPLEXITY_DEFAULT_SEARCH_MODE` (optional)
- `PERPLEXITY_DEFAULT_REASONING_EFFORT` (optional)

#### 1.2 GeminiSettings

```python
class GeminiSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        env_prefix="GEMINI_",
    )

    api_key: str
    timeout: int = 120  # Per-poll timeout
    poll_interval: int = 10  # Seconds between status checks
    max_poll_attempts: int = 360  # ~60 min max wait
    agent: str = "deep-research-pro-preview-12-2025"
```

**Environment Variables:**
- `GEMINI_API_KEY` (required)
- `GEMINI_TIMEOUT` (optional, default: 120)
- `GEMINI_POLL_INTERVAL` (optional, default: 10)
- `GEMINI_MAX_POLL_ATTEMPTS` (optional, default: 360)
- `GEMINI_AGENT` (optional)

---

### 2. Schemas

#### 2.1 Perplexity Schemas (`backend/app/schemas/perplexity.py`)

**Enums (use StrEnum to match existing codebase pattern):**
```python
from enum import StrEnum

class PerplexitySearchMode(StrEnum):
    """Search mode options for Perplexity deep research."""
    WEB = "web"
    ACADEMIC = "academic"
    SEC = "sec"

class PerplexityReasoningEffort(StrEnum):
    """Reasoning effort levels for deep research."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class PerplexitySearchContextSize(StrEnum):
    """Search context size options."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class PerplexityRecencyFilter(StrEnum):
    """Time-based recency filter options."""
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"
```

**Request Schema:**
```python
class PerplexityDeepResearchRequest(BaseModel):
    """Request schema for Perplexity deep research.

    Uses ConfigDict(extra="forbid") to match existing Tavily schema pattern.
    """
    model_config = ConfigDict(extra="forbid")

    # Required
    query: str = Field(..., min_length=1, max_length=10000, description="Research query")

    # Optional: System prompt
    system_prompt: str | None = Field(
        default=None,
        max_length=2000,
        description="System prompt for research context"
    )

    # Search configuration
    search_mode: PerplexitySearchMode = Field(
        default=PerplexitySearchMode.WEB,
        description="Search mode: web, academic, or sec"
    )
    reasoning_effort: PerplexityReasoningEffort = Field(
        default=PerplexityReasoningEffort.HIGH,
        description="Reasoning depth for research"
    )
    search_context_size: PerplexitySearchContextSize = Field(
        default=PerplexitySearchContextSize.HIGH,
        description="Amount of search context to gather (mapped to web_search_options.search_context_size)"
    )
    user_location: str | None = Field(
        default=None,
        description="User location for localized results (mapped to web_search_options.user_location)"
    )

    # Response generation parameters
    max_tokens: int | None = Field(default=4000, ge=1, le=128000)
    temperature: float = Field(default=0.2, ge=0, le=2)
    top_p: float | None = Field(default=None, ge=0, le=1, description="Nucleus sampling")
    top_k: int | None = Field(default=None, ge=0, description="Top-k filtering")
    presence_penalty: float | None = Field(default=None, ge=0, le=2, description="Topic diversity")
    frequency_penalty: float | None = Field(default=None, ge=0, le=2, description="Reduce repetition")

    # Content options
    return_images: bool = Field(default=False, description="Include images in response")
    return_related_questions: bool = Field(default=False, description="Include related questions")

    # Advanced options
    stream: bool = Field(default=False, description="Enable streaming response")
    disable_search: bool = Field(default=False, description="Use only training data, no web search")
    enable_search_classifier: bool = Field(default=False, description="Auto-detect if search is needed")
    response_format: dict | None = Field(default=None, description="Structured JSON output format")

    # Search filtering
    search_recency_filter: PerplexityRecencyFilter | None = Field(
        default=None,
        description="Time-based recency filter"
    )
    search_domain_filter: list[str] | None = Field(
        default=None,
        max_length=20,
        description="Domains to include/exclude (prefix with - to exclude)"
    )
    search_after_date_filter: str | None = Field(
        default=None,
        pattern=r"^\d{2}/\d{2}/\d{4}$",
        description="Only include results after this date (MM/DD/YYYY)"
    )
    search_before_date_filter: str | None = Field(
        default=None,
        pattern=r"^\d{2}/\d{2}/\d{4}$",
        description="Only include results before this date (MM/DD/YYYY)"
    )
```

**Response Schemas:**
```python
class PerplexitySearchResult(BaseModel):
    """Individual citation/source from research."""
    model_config = ConfigDict(extra="allow")

    title: str = Field(description="Source title")
    url: str = Field(description="Source URL")
    date: str | None = Field(default=None, description="Publication date if available")

class PerplexityVideo(BaseModel):
    """Video result from research."""
    model_config = ConfigDict(extra="allow")

    url: str = Field(description="Video URL")
    thumbnail_url: str | None = None
    thumbnail_width: int | None = None
    thumbnail_height: int | None = None
    duration: int | None = Field(default=None, description="Duration in seconds")

class PerplexityUsage(BaseModel):
    """Token usage breakdown for billing/monitoring."""
    model_config = ConfigDict(extra="allow")

    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    citation_tokens: int | None = Field(default=None, description="Tokens from citations")
    num_search_queries: int | None = Field(default=None, description="Number of searches executed")
    reasoning_tokens: int | None = Field(default=None, description="Tokens used for reasoning")
    search_context_size: str | None = Field(default=None, description="Context size used")

class PerplexityChoice(BaseModel):
    """Individual choice from completion (typically one for deep research)."""
    model_config = ConfigDict(extra="allow")

    index: int = 0
    message: dict[str, str]  # {"role": "assistant", "content": "..."}
    finish_reason: str = Field(default="stop", description="Reason for completion")

class PerplexityDeepResearchResponse(BaseModel):
    """Full response from Perplexity deep research.

    Uses ConfigDict(extra="allow") to handle any additional API fields.
    """
    model_config = ConfigDict(extra="allow")

    id: str = Field(description="Unique completion identifier")
    object: str = Field(default="chat.completion", description="Object type")
    model: str = Field(description="Model used")
    created: int = Field(description="Unix timestamp of creation")
    content: str = Field(description="Main research report (extracted from choices)")
    search_results: list[PerplexitySearchResult] = Field(
        default_factory=list,
        description="List of cited sources"
    )
    videos: list[PerplexityVideo] | None = Field(default=None, description="Related videos")
    related_questions: list[str] | None = Field(default=None, description="Follow-up questions")
    images: list[str] | None = Field(default=None, description="Related images")
    usage: PerplexityUsage = Field(description="Token usage breakdown")
```

#### 2.2 Gemini Schemas (`backend/app/schemas/gemini.py`)

**Enums (use StrEnum to match existing codebase pattern):**
```python
from enum import StrEnum

class GeminiInteractionStatus(StrEnum):
    """Status values for Gemini research interactions."""
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class GeminiStreamEventType(StrEnum):
    """Event types for streaming responses."""
    INTERACTION_START = "interaction.start"
    CONTENT_DELTA = "content.delta"
    INTERACTION_COMPLETE = "interaction.complete"
    ERROR = "error"

class GeminiDeltaType(StrEnum):
    """Delta content types in streaming."""
    TEXT = "text"
    THOUGHT_SUMMARY = "thought_summary"
```

**Request Schemas:**
```python
class GeminiDeepResearchRequest(BaseModel):
    """Request to start a deep research job.

    Uses ConfigDict(extra="forbid") to match existing Tavily schema pattern.
    """
    model_config = ConfigDict(extra="forbid")

    query: str = Field(
        ...,
        min_length=1,
        max_length=32000,
        description="Research query/prompt"
    )
    enable_thinking_summaries: bool = Field(
        default=True,
        description="Enable visibility into agent's thinking process"
    )
    file_search_store_names: list[str] | None = Field(
        default=None,
        description="Private document store names for file search (e.g., ['fileSearchStores/my-docs'])"
    )
    previous_interaction_id: str | None = Field(
        default=None,
        description="Link to prior interaction for follow-up questions"
    )

class GeminiDeepResearchPollRequest(BaseModel):
    """Request to poll an existing research job."""
    model_config = ConfigDict(extra="forbid")

    interaction_id: str = Field(description="The interaction ID to poll")
    last_event_id: str | None = Field(
        default=None,
        description="Last received event ID for reconnection/resumption"
    )
```

**Response Schemas:**
```python
class GeminiUsage(BaseModel):
    """Token usage for a Gemini interaction."""
    model_config = ConfigDict(extra="allow")

    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None

class GeminiOutput(BaseModel):
    """Single output from a completed interaction."""
    model_config = ConfigDict(extra="allow")

    text: str = Field(description="Output text content")
    type: str = Field(default="text", description="Output type")

class GeminiDeepResearchJobResponse(BaseModel):
    """Returned when starting a research job."""
    model_config = ConfigDict(extra="allow")

    interaction_id: str = Field(description="Unique interaction identifier")
    status: GeminiInteractionStatus = Field(description="Current job status")
    message: str = Field(default="Research job started", description="Status message")

class GeminiDeepResearchResultResponse(BaseModel):
    """Returned when polling or when job completes."""
    model_config = ConfigDict(extra="allow")

    interaction_id: str = Field(description="Unique interaction identifier")
    status: GeminiInteractionStatus = Field(description="Current job status")
    content: str | None = Field(default=None, description="Research report when completed")
    outputs: list[GeminiOutput] | None = Field(default=None, description="Raw outputs list")
    usage: GeminiUsage | None = Field(default=None, description="Token usage")
    error: str | None = Field(default=None, description="Error message if failed")
```

---

### 3. Exceptions (`backend/app/core/exceptions.py`)

> **Pattern Note:** Follow the existing `TavilyAPIError` pattern which uses `StrEnum` for error codes and provides factory methods for common error scenarios.

#### 3.1 Perplexity Exceptions

```python
from enum import StrEnum

class PerplexityErrorCode(StrEnum):
    """Error codes for Perplexity API errors.

    Uses lowercase with underscores to match existing TavilyErrorCode pattern.
    """
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    INVALID_API_KEY = "invalid_api_key"
    REQUEST_TIMEOUT = "request_timeout"
    INVALID_REQUEST = "invalid_request"
    CONTENT_FILTER = "content_filter"
    API_ERROR = "perplexity_api_error"


class PerplexityAPIError(Exception):
    """Custom exception for Perplexity API errors.

    Follows same pattern as TavilyAPIError for consistency.
    """

    def __init__(
        self,
        status_code: int,
        error_code: PerplexityErrorCode,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details or {}

    @classmethod
    def rate_limit_exceeded(cls, message: str = "Perplexity API rate limit exceeded.", details: dict | None = None):
        return cls(429, PerplexityErrorCode.RATE_LIMIT_EXCEEDED, message, details)

    @classmethod
    def invalid_api_key(cls, message: str = "Invalid Perplexity API key.", details: dict | None = None):
        return cls(401, PerplexityErrorCode.INVALID_API_KEY, message, details)

    @classmethod
    def request_timeout(cls, message: str = "Perplexity request timed out.", details: dict | None = None):
        return cls(504, PerplexityErrorCode.REQUEST_TIMEOUT, message, details)

    @classmethod
    def invalid_request(cls, message: str = "Invalid request parameters.", details: dict | None = None):
        return cls(400, PerplexityErrorCode.INVALID_REQUEST, message, details)

    @classmethod
    def content_filter(cls, message: str = "Content filtered by Perplexity safety systems.", details: dict | None = None):
        return cls(400, PerplexityErrorCode.CONTENT_FILTER, message, details)

    @classmethod
    def api_error(cls, message: str = "Perplexity API error.", details: dict | None = None):
        return cls(500, PerplexityErrorCode.API_ERROR, message, details)
```

#### 3.2 Gemini Exceptions

```python
class GeminiErrorCode(StrEnum):
    """Error codes for Gemini API errors."""
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    INVALID_API_KEY = "invalid_api_key"
    REQUEST_TIMEOUT = "request_timeout"
    INVALID_REQUEST = "invalid_request"
    RESEARCH_FAILED = "research_failed"
    INTERACTION_NOT_FOUND = "interaction_not_found"
    MAX_POLLS_EXCEEDED = "max_polls_exceeded"
    POLLING_TIMEOUT = "polling_timeout"
    API_ERROR = "gemini_api_error"


class GeminiAPIError(Exception):
    """Custom exception for Gemini API errors.

    Follows same pattern as TavilyAPIError for consistency.
    """

    def __init__(
        self,
        status_code: int,
        error_code: GeminiErrorCode,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details or {}

    @classmethod
    def rate_limit_exceeded(cls, message: str = "Gemini API rate limit exceeded.", details: dict | None = None):
        return cls(429, GeminiErrorCode.RATE_LIMIT_EXCEEDED, message, details)

    @classmethod
    def invalid_api_key(cls, message: str = "Invalid Gemini API key.", details: dict | None = None):
        return cls(401, GeminiErrorCode.INVALID_API_KEY, message, details)

    @classmethod
    def request_timeout(cls, message: str = "Gemini request timed out.", details: dict | None = None):
        return cls(504, GeminiErrorCode.REQUEST_TIMEOUT, message, details)

    @classmethod
    def research_failed(cls, message: str = "Research job failed.", details: dict | None = None):
        return cls(500, GeminiErrorCode.RESEARCH_FAILED, message, details)

    @classmethod
    def interaction_not_found(cls, interaction_id: str, details: dict | None = None):
        return cls(404, GeminiErrorCode.INTERACTION_NOT_FOUND, f"Interaction not found: {interaction_id}", details)

    @classmethod
    def max_polls_exceeded(cls, interaction_id: str, max_polls: int, details: dict | None = None):
        return cls(
            504,
            GeminiErrorCode.MAX_POLLS_EXCEEDED,
            f"Max polling attempts ({max_polls}) exceeded for interaction: {interaction_id}",
            details
        )

    @classmethod
    def polling_timeout(cls, interaction_id: str, timeout_minutes: int, details: dict | None = None):
        return cls(
            504,
            GeminiErrorCode.POLLING_TIMEOUT,
            f"Research timed out after {timeout_minutes} minutes: {interaction_id}",
            details
        )

    @classmethod
    def api_error(cls, message: str = "Gemini API error.", details: dict | None = None):
        return cls(500, GeminiErrorCode.API_ERROR, message, details)
```

---

### 4. Services

> **Pattern Note:** Follow the existing `TavilyService` pattern in `backend/app/services/tavily.py` which initializes from settings and uses async methods with httpx.

#### 4.1 Perplexity Service (`backend/app/services/perplexity.py`)

**Class: `PerplexityService`**

| Method | Description | Returns |
|--------|-------------|---------|
| `__init__()` | Initialize with settings | - |
| `async deep_research(...)` | Execute deep research query | `dict[str, Any]` |
| `_build_headers()` | Build auth headers | `dict` |
| `_build_payload(...)` | Construct API request payload | `dict` |
| `_parse_response(data)` | Parse API response to standard format | `dict` |
| `_handle_error(error)` | Convert HTTP errors to PerplexityAPIError | `PerplexityAPIError` |

**Key Implementation Details:**
```python
class PerplexityService:
    BASE_URL = "https://api.perplexity.ai"

    def __init__(self) -> None:
        perplexity_settings = settings.perplexity
        self._timeout = perplexity_settings.timeout
        self._api_key = perplexity_settings.api_key
        self._default_model = perplexity_settings.default_model

    def _build_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

    def _build_payload(
        self,
        query: str,
        search_context_size: str | None = None,
        user_location: str | None = None,
        **kwargs,
    ) -> dict[str, Any]:
        """Construct API request payload.

        Note: search_context_size and user_location are mapped into the
        web_search_options object as required by the Perplexity API.
        """
        payload = {
            "model": kwargs.get("model", self._default_model),
            "messages": [{"role": "user", "content": query}],
            **{k: v for k, v in kwargs.items() if v is not None},
        }

        # Build web_search_options from flattened fields
        web_search_options = {}
        if search_context_size:
            web_search_options["search_context_size"] = search_context_size
        if user_location:
            web_search_options["user_location"] = user_location
        if web_search_options:
            payload["web_search_options"] = web_search_options

        return payload

    def _parse_response(self, data: dict) -> dict[str, Any]:
        """Extract content from choices[0].message.content."""
        choice = data["choices"][0]
        return {
            "id": data["id"],
            "object": data.get("object", "chat.completion"),
            "model": data["model"],
            "created": data["created"],
            "content": choice["message"]["content"],
            "search_results": data.get("search_results", []),
            "videos": data.get("videos"),
            "images": data.get("images"),
            "related_questions": data.get("related_questions"),
            "usage": data.get("usage", {}),
        }
```

#### 4.2 Gemini Service (`backend/app/services/gemini.py`)

**Class: `GeminiService`**

| Method | Description | Returns |
|--------|-------------|---------|
| `__init__()` | Initialize with settings | - |
| `async start_research(...)` | Start background research job | `dict` with `interaction_id`, `status` |
| `async poll_research(interaction_id, last_event_id)` | Check status and get results | `dict` with status and optional results |
| `async wait_for_completion(interaction_id)` | Poll until complete or timeout | `dict` with final results |
| `async cancel_research(interaction_id)` | Delete/cancel a research job | `bool` |
| `_build_headers()` | Build auth headers | `dict` |
| `_handle_error(error)` | Convert errors to GeminiAPIError | `GeminiAPIError` |

**Key Implementation Details:**
```python
class GeminiService:
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

    def __init__(self) -> None:
        gemini_settings = settings.gemini
        self._timeout = gemini_settings.timeout
        self._api_key = gemini_settings.api_key
        self._agent = gemini_settings.agent
        self._poll_interval = gemini_settings.poll_interval
        self._max_poll_attempts = gemini_settings.max_poll_attempts

    def _build_headers(self) -> dict[str, str]:
        return {
            "x-goog-api-key": self._api_key,
            "Content-Type": "application/json",
        }

    async def start_research(
        self,
        query: str,
        enable_thinking_summaries: bool = True,
        file_search_store_names: list[str] | None = None,
        previous_interaction_id: str | None = None,
    ) -> dict[str, Any]:
        """Always set background=True, store=True per API requirements."""
        payload = {
            "agent": self._agent,
            "input": query,
            "background": True,
            "store": True,
            "agent_config": {
                "type": "deep-research",
                "thinking_summaries": "auto" if enable_thinking_summaries else "none",
            },
        }

        # Transform file_search_store_names to API tools format
        if file_search_store_names:
            payload["tools"] = [{
                "type": "file_search",
                "file_search_store_names": file_search_store_names
            }]

        if previous_interaction_id:
            payload["previous_interaction_id"] = previous_interaction_id

        # POST to /interactions, return interaction_id and status

    async def poll_research(self, interaction_id: str, last_event_id: str | None = None):
        """GET /interactions/{id} with optional last_event_id for resumption."""
        # Parse status and outputs from interaction object

    async def wait_for_completion(self, interaction_id: str) -> dict[str, Any]:
        """Poll with configurable interval until completed/failed/timeout."""
        # Use asyncio.sleep between polls
        # Raise GeminiAPIError.max_polls_exceeded if limit reached
```

**Critical Notes:**
- Always set `background=True` and `store=True` (API requirement)
- Include `agent_config.type: "deep-research"` for proper agent behavior
- Support `previous_interaction_id` for follow-up questions
- Support `last_event_id` for reconnection after network interruption

---

### 5. Dependencies (`backend/app/api/deps.py`)

```python
from app.services.perplexity import PerplexityService
from app.services.gemini import GeminiService

def get_perplexity_service() -> PerplexityService:
    return PerplexityService()

def get_gemini_service() -> GeminiService:
    return GeminiService()

PerplexityDep = Annotated[PerplexityService, Depends(get_perplexity_service)]
GeminiDep = Annotated[GeminiService, Depends(get_gemini_service)]
```

---

### 6. Routes

#### 6.1 Perplexity Routes (`backend/app/api/routes/perplexity.py`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/perplexity/deep-research` | Execute deep research query |

**Endpoint Details:**
```python
@router.post("/deep-research", response_model=PerplexityDeepResearchResponse)
async def deep_research(
    _current_user: CurrentUser,
    perplexity: PerplexityDep,
    request: PerplexityDeepResearchRequest,
) -> Any:
    """Execute a deep research query using Perplexity Sonar."""
```

#### 6.2 Gemini Routes (`backend/app/api/routes/gemini.py`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/gemini/deep-research` | Start research job |
| GET | `/api/v1/gemini/deep-research/{interaction_id}` | Poll job status |
| DELETE | `/api/v1/gemini/deep-research/{interaction_id}` | Cancel research job |
| POST | `/api/v1/gemini/deep-research/sync` | Start and wait for completion |

**Endpoint Details:**
```python
router = APIRouter(prefix="/gemini", tags=["gemini"])

@router.post("/deep-research", response_model=GeminiDeepResearchJobResponse)
async def start_deep_research(
    _current_user: CurrentUser,
    gemini: GeminiDep,
    request: GeminiDeepResearchRequest,
) -> Any:
    """Start a deep research job (async).

    Returns immediately with interaction_id for polling.
    """

@router.get("/deep-research/{interaction_id}", response_model=GeminiDeepResearchResultResponse)
async def poll_deep_research(
    _current_user: CurrentUser,
    gemini: GeminiDep,
    interaction_id: str,
    last_event_id: str | None = None,  # Query param for reconnection
) -> Any:
    """Poll research job status and get results.

    Supports last_event_id for reconnection after network interruption.
    """

@router.delete("/deep-research/{interaction_id}")
async def cancel_deep_research(
    _current_user: CurrentUser,
    gemini: GeminiDep,
    interaction_id: str,
) -> dict[str, bool]:
    """Cancel/delete a research job.

    Returns {"success": true} if cancelled successfully.
    """

@router.post("/deep-research/sync", response_model=GeminiDeepResearchResultResponse)
async def sync_deep_research(
    _current_user: CurrentUser,
    gemini: GeminiDep,
    request: GeminiDeepResearchRequest,
) -> Any:
    """Start research and wait for completion (blocking).

    Warning: Can take up to 60 minutes. Consider using async pattern instead.
    """
```

---

### 7. Router Registration (`backend/app/api/main.py`)

```python
from app.api.routes import perplexity, gemini

api_router.include_router(perplexity.router)
api_router.include_router(gemini.router)
```

---

### 8. Exception Handlers (`backend/app/main.py`)

> **Note:** Reuse the existing `ErrorResponse` from `backend/app/schemas/tavily.py` - no need to create a new one.

```python
from app.schemas.tavily import ErrorResponse  # Reuse existing schema

@app.exception_handler(PerplexityAPIError)
async def perplexity_exception_handler(_request: Request, exc: PerplexityAPIError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
        ).model_dump(),
    )

@app.exception_handler(GeminiAPIError)
async def gemini_exception_handler(_request: Request, exc: GeminiAPIError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
        ).model_dump(),
    )
```

---

## Frontend Requirements

### 1. SDK Regeneration

After backend implementation, regenerate the frontend SDK:

```bash
cd frontend
npm run generate-client
```

This generates:
- `PerplexityService` and `GeminiService` classes in `sdk.gen.ts`
- TypeScript types in `types.gen.ts`

---

### 2. React Query Hooks

#### 2.1 Perplexity Hook (`frontend/src/hooks/usePerplexityDeepResearch.ts`)

```typescript
interface UsePerplexityDeepResearchOptions {
  onSuccess?: (data: PerplexityDeepResearchResponse) => void
}

export function usePerplexityDeepResearch(options?: UsePerplexityDeepResearchOptions) {
  const { showErrorToast } = useCustomToast()

  return useMutation({
    mutationFn: (data: PerplexityDeepResearchRequest) =>
      PerplexityService.deepResearch({ requestBody: data }),
    onSuccess: options?.onSuccess,
    onError: showErrorToast,
  })
}
```

#### 2.2 Gemini Hooks (`frontend/src/hooks/useGeminiDeepResearch.ts`)

```typescript
import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GeminiService, GeminiDeepResearchRequest, GeminiDeepResearchResultResponse } from "@/client"
import { useCustomToast } from "@/hooks/useCustomToast"

interface UseGeminiStartResearchOptions {
  onSuccess?: (data: { interaction_id: string; status: string }) => void
}

interface UseGeminiPollOptions {
  onSuccess?: (data: GeminiDeepResearchResultResponse) => void
}

// Start async job
export function useGeminiStartResearch(options?: UseGeminiStartResearchOptions) {
  const { showErrorToast } = useCustomToast()

  return useMutation({
    mutationFn: (data: GeminiDeepResearchRequest) =>
      GeminiService.startDeepResearch({ requestBody: data }),
    onSuccess: options?.onSuccess,
    onError: showErrorToast,
  })
}

// Poll for results with automatic refetching
// Note: React Query v5 deprecated onSuccess/onError in useQuery.
// Use useEffect to handle success/error side effects instead.
export function useGeminiPollResearch(
  interactionId: string | null,
  options?: UseGeminiPollOptions
) {
  const { showErrorToast } = useCustomToast()

  const query = useQuery({
    queryKey: ["gemini-research", interactionId],
    queryFn: () => GeminiService.pollDeepResearch({ interactionId: interactionId! }),
    enabled: !!interactionId,
    refetchInterval: (query) => {
      // Stop polling when completed or failed
      const data = query.state.data
      if (data?.status === "completed" || data?.status === "failed") {
        return false
      }
      return 5000 // Poll every 5s while in progress
    },
  })

  // Handle success callback (React Query v5 compatible)
  useEffect(() => {
    if (query.data && options?.onSuccess) {
      options.onSuccess(query.data)
    }
  }, [query.data, options?.onSuccess])

  // Handle error callback (React Query v5 compatible)
  useEffect(() => {
    if (query.error) {
      showErrorToast(query.error)
    }
  }, [query.error, showErrorToast])

  return query
}

// Cancel research job
export function useGeminiCancelResearch() {
  const queryClient = useQueryClient()
  const { showErrorToast, showSuccessToast } = useCustomToast()

  return useMutation({
    mutationFn: (interactionId: string) =>
      GeminiService.cancelDeepResearch({ interactionId }),
    onSuccess: (_, interactionId) => {
      // Invalidate the query to stop polling
      queryClient.removeQueries({ queryKey: ["gemini-research", interactionId] })
      showSuccessToast("Research cancelled")
    },
    onError: showErrorToast,
  })
}

// Sync endpoint (blocking) - use with caution, can take 60+ minutes
export function useGeminiSyncResearch(options?: UseGeminiPollOptions) {
  const { showErrorToast } = useCustomToast()

  return useMutation({
    mutationFn: (data: GeminiDeepResearchRequest) =>
      GeminiService.syncDeepResearch({ requestBody: data }),
    onSuccess: options?.onSuccess,
    onError: showErrorToast,
  })
}
```

---

### 3. Zod Schemas (`frontend/src/lib/schemas/`)

#### 3.1 Perplexity Schema (`perplexity.ts`)

```typescript
export const perplexityDeepResearchSchema = z.object({
  query: z.string().min(1).max(10000),
  system_prompt: z.string().max(2000).optional(),
  search_mode: z.enum(["web", "academic", "sec"]).default("web"),
  reasoning_effort: z.enum(["low", "medium", "high"]).default("high"),
  max_tokens: z.number().min(1).max(128000).default(4000),
  temperature: z.number().min(0).max(2).default(0.2),
  return_images: z.boolean().default(false),
  return_related_questions: z.boolean().default(false),
  search_recency_filter: z.enum(["day", "week", "month", "year"]).optional(),
  search_domain_filter: z.array(z.string()).max(20).optional(),
  search_context_size: z.enum(["low", "medium", "high"]).default("high"),
})
```

#### 3.2 Gemini Schema (`gemini.ts`)

```typescript
export const geminiDeepResearchSchema = z.object({
  query: z.string().min(1).max(32000),
  enable_thinking_summaries: z.boolean().default(true),
  file_search_store_names: z.array(z.string()).optional(),
})
```

---

### 4. Components

#### 4.1 Perplexity Components (`frontend/src/components/Perplexity/`)

| Component | Purpose |
|-----------|---------|
| `PerplexityDeepResearchForm.tsx` | Form with all query options |
| `PerplexityResultView.tsx` | Display research report |
| `PerplexityCitationsList.tsx` | Render citations/sources |
| `PerplexityVideos.tsx` | Video results grid (optional) |
| `PerplexityUsageStats.tsx` | Token usage display |

#### 4.2 Gemini Components (`frontend/src/components/Gemini/`)

| Component | Purpose |
|-----------|---------|
| `GeminiDeepResearchForm.tsx` | Form with query options |
| `GeminiResultView.tsx` | Display research report with markdown rendering |
| `GeminiProgressIndicator.tsx` | Show polling status/progress with elapsed time |
| `GeminiCancelButton.tsx` | Cancel button for in-progress research |
| `GeminiUsageStats.tsx` | Token usage display |
| `GeminiErrorDisplay.tsx` | Display error state with retry option |

---

### 5. Routes

#### 5.1 Perplexity Page (`frontend/src/routes/_layout/perplexity-research.tsx`)

```typescript
export default function PerplexityResearchPage() {
  const [result, setResult] = useState<PerplexityDeepResearchResponse | null>(null)

  const mutation = usePerplexityDeepResearch({
    onSuccess: setResult,
  })

  return (
    <Container>
      <Heading>Perplexity Deep Research</Heading>
      <PerplexityDeepResearchForm mutation={mutation} />
      {result && <PerplexityResultView result={result} />}
    </Container>
  )
}
```

#### 5.2 Gemini Page (`frontend/src/routes/_layout/gemini-research.tsx`)

```typescript
import { useState } from "react"
import {
  useGeminiStartResearch,
  useGeminiPollResearch,
  useGeminiCancelResearch,
} from "@/hooks/useGeminiDeepResearch"

export default function GeminiResearchPage() {
  const [interactionId, setInteractionId] = useState<string | null>(null)

  const startMutation = useGeminiStartResearch({
    onSuccess: (data) => setInteractionId(data.interaction_id),
  })

  const { data: pollResult, isLoading: isPolling } = useGeminiPollResearch(interactionId)

  const cancelMutation = useGeminiCancelResearch()

  const handleCancel = () => {
    if (interactionId) {
      cancelMutation.mutate(interactionId)
      setInteractionId(null)
    }
  }

  const isInProgress = pollResult?.status === "in_progress"
  const isCompleted = pollResult?.status === "completed"
  const isFailed = pollResult?.status === "failed"

  return (
    <Container>
      <Heading>Google Gemini Deep Research</Heading>

      <GeminiDeepResearchForm
        mutation={startMutation}
        disabled={isInProgress}
      />

      {interactionId && isInProgress && (
        <Box>
          <GeminiProgressIndicator status={pollResult?.status} />
          <GeminiCancelButton
            onClick={handleCancel}
            isLoading={cancelMutation.isPending}
          />
        </Box>
      )}

      {isFailed && (
        <GeminiErrorDisplay
          error={pollResult?.error}
          onRetry={() => setInteractionId(null)}
        />
      )}

      {isCompleted && pollResult && (
        <>
          <GeminiResultView result={pollResult} />
          <GeminiUsageStats usage={pollResult.usage} />
        </>
      )}
    </Container>
  )
}
```

---

### 6. Navigation Updates

Add new navigation items to sidebar:

```typescript
// In navigation config
{
  name: "Perplexity Research",
  path: "/perplexity-research",
  icon: SearchIcon,  // or appropriate icon
},
{
  name: "Gemini Research",
  path: "/gemini-research",
  icon: SparklesIcon,  // or appropriate icon
}
```

---

## Environment Configuration

### `.env.example` Updates

```bash
# ===================
# Perplexity API Configuration
# ===================
# Sonar Deep Research model for comprehensive research reports
PERPLEXITY_API_KEY=your-perplexity-api-key-here
PERPLEXITY_TIMEOUT=300
PERPLEXITY_DEFAULT_MODEL=sonar-deep-research
PERPLEXITY_DEFAULT_SEARCH_MODE=web
PERPLEXITY_DEFAULT_REASONING_EFFORT=high

# ===================
# Google Gemini API Configuration
# ===================
# Deep Research agent for agentic multi-step research
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_TIMEOUT=120
GEMINI_POLL_INTERVAL=10
GEMINI_MAX_POLL_ATTEMPTS=360
GEMINI_AGENT=deep-research-pro-preview-12-2025
```

---

## Implementation Checklist

### Backend

- [ ] Add `PerplexitySettings` to `config.py`
- [ ] Add `GeminiSettings` to `config.py`
- [ ] Update `.env.example` with new variables
- [ ] Create `schemas/perplexity.py` with all models
- [ ] Create `schemas/gemini.py` with all models
- [ ] Export new schemas in `schemas/__init__.py`
- [ ] Add Perplexity exceptions to `exceptions.py`
- [ ] Add Gemini exceptions to `exceptions.py`
- [ ] Create `services/perplexity.py`
- [ ] Create `services/gemini.py`
- [ ] Add dependencies to `deps.py`
- [ ] Create `api/routes/perplexity.py`
- [ ] Create `api/routes/gemini.py`
- [ ] Register routers in `api/main.py`
- [ ] Add exception handlers in `main.py`

### Frontend

- [ ] Regenerate SDK client: `npm run generate-client`
- [ ] Create `hooks/usePerplexityDeepResearch.ts`
- [ ] Create `hooks/useGeminiDeepResearch.ts`
- [ ] Create `lib/schemas/perplexity.ts`
- [ ] Create `lib/schemas/gemini.ts`
- [ ] Create `components/Perplexity/` folder with components
- [ ] Create `components/Gemini/` folder with components
- [ ] Create `routes/_layout/perplexity-research.tsx`
- [ ] Create `routes/_layout/gemini-research.tsx`
- [ ] Update navigation with new routes

---

## Key Differences from Standard Tavily Pattern

### Perplexity Deep Research

1. **Longer timeouts** - Deep research can take 30-60 seconds
2. **Rich response parsing** - Handle citations, videos, images, usage stats
3. **More request options** - Search modes, filters, reasoning effort

### Gemini Deep Research

1. **Async pattern** - Start job, poll for results (not immediate response)
2. **Multiple endpoints** - Start, poll, cancel, and optional sync endpoints
3. **Status tracking** - Handle `in_progress`, `completed`, `failed` states
4. **Frontend polling** - Use React Query's `refetchInterval` for status updates
5. **Error recovery** - Handle interaction not found, max polls exceeded
6. **Cancellation support** - DELETE endpoint to cancel in-progress research
7. **Reconnection handling** - Support `last_event_id` for network resilience
8. **Follow-up questions** - Support `previous_interaction_id` for conversations

---

## File Summary

### New Backend Files (9 files)

| Path | Purpose |
|------|---------|
| `backend/app/schemas/perplexity.py` | Pydantic models for Perplexity |
| `backend/app/schemas/gemini.py` | Pydantic models for Gemini |
| `backend/app/services/perplexity.py` | Perplexity API client service |
| `backend/app/services/gemini.py` | Gemini API client service |
| `backend/app/api/routes/perplexity.py` | Perplexity route handlers |
| `backend/app/api/routes/gemini.py` | Gemini route handlers |

### Modified Backend Files (4 files)

| Path | Changes |
|------|---------|
| `backend/app/core/config.py` | Add settings classes |
| `backend/app/core/exceptions.py` | Add exception classes |
| `backend/app/api/deps.py` | Add dependency factories |
| `backend/app/api/main.py` | Register routers |
| `backend/app/main.py` | Add exception handlers |

### New Frontend Files (8+ files)

| Path | Purpose |
|------|---------|
| `frontend/src/hooks/usePerplexityDeepResearch.ts` | Perplexity mutation hook |
| `frontend/src/hooks/useGeminiDeepResearch.ts` | Gemini hooks (start, poll, sync) |
| `frontend/src/lib/schemas/perplexity.ts` | Zod validation |
| `frontend/src/lib/schemas/gemini.ts` | Zod validation |
| `frontend/src/components/Perplexity/*.tsx` | UI components |
| `frontend/src/components/Gemini/*.tsx` | UI components |
| `frontend/src/routes/_layout/perplexity-research.tsx` | Page route |
| `frontend/src/routes/_layout/gemini-research.tsx` | Page route |

---

## Changelog

### v1.1 (December 2025) - Validated & Improved

Changes based on validation against API examples in `EXAMPLE/` and codebase patterns:

**Schema Improvements:**
- Changed from `str, Enum` to `StrEnum` to match existing `TavilyErrorCode` pattern
- Added `ConfigDict(extra="forbid")` for requests, `extra="allow"` for responses
- Added `PerplexityRecencyFilter` enum for type-safe recency filtering
- Added `GeminiStreamEventType` and `GeminiDeltaType` enums for streaming support
- Added missing Perplexity parameters: `top_p`, `top_k`, `presence_penalty`, `frequency_penalty`
- Added `PerplexityChoice` model to handle raw API response structure
- Added `GeminiOutput` model with `outputs` field in response
- Added `previous_interaction_id` for Gemini follow-up questions
- Added `last_event_id` for Gemini reconnection handling

**Exception Improvements:**
- Changed error code values to lowercase with underscores (e.g., `rate_limit_exceeded`)
- Added `POLLING_TIMEOUT` error code for Gemini timeout scenarios
- Added detailed factory methods with descriptive messages

**Service Improvements:**
- Added `_build_headers()` method to both services
- Added `cancel_research()` method to GeminiService
- Added `agent_config.type: "deep-research"` to Gemini payloads
- Added detailed implementation examples

**Route Improvements:**
- Added DELETE endpoint for Gemini research cancellation
- Added `last_event_id` query param for poll endpoint

**Frontend Improvements:**
- Added `useGeminiCancelResearch` hook
- Added `GeminiCancelButton` and `GeminiErrorDisplay` components
- Improved polling logic with proper query state handling
- Added cancel and error handling to Gemini page component

### v1.2 (December 2025) - Final Validation Pass

Changes based on deep validation against API docs and codebase infrastructure:

**Perplexity Schema Additions:**
- Added `stream: bool` for optional streaming responses
- Added `disable_search: bool` to use only training data
- Added `response_format: dict | None` for structured JSON output

**Service Layer Clarifications:**
- Added full method signature for `GeminiService.start_research()` with parameter transformations
- Clarified `file_search_store_names` → `tools` array transformation logic
- Added `enable_thinking_summaries` parameter handling

**React Query v5 Compatibility:**
- Fixed `useGeminiPollResearch` hook to use `useEffect` for success/error callbacks
- Added note about deprecated `onSuccess`/`onError` in `useQuery`
- Added `useEffect` import to hook imports

**Code Reuse:**
- Added note to reuse existing `ErrorResponse` from `schemas/tavily.py`
- Added import statement showing `ErrorResponse` reuse in exception handlers

**Implementation Checklist:**
- Added `schemas/__init__.py` exports step

### v1.3 (December 2025) - API Completeness Pass

Changes based on cross-validation against actual API documentation:

**Perplexity Schema Additions:**
- Added `user_location: str | None` for localized search results
- Added `enable_search_classifier: bool` for auto-detecting search necessity
- Updated `search_context_size` description to clarify `web_search_options` mapping

**Service Layer Documentation:**
- Added explicit `_build_payload()` method implementation
- Documented `web_search_options` object transformation (API requires nested structure, schema exposes flat fields for UX simplicity)
- Shows mapping of `search_context_size` and `user_location` into `web_search_options`

---

*Document Version: 1.3*
*Last Updated: December 2025*
*Validated Against: EXAMPLE/gemini-perplexity-deepresearch-api/docs/, backend/app/*
