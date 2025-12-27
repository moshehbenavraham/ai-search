"""Pydantic schemas for Perplexity Sonar API request and response types.

This module defines all request and response schemas for the Perplexity Sonar
integration, including schemas for deep research queries. These schemas provide
request validation, response serialization, and OpenAPI documentation generation
for the FastAPI routes.

Schema Organization:
    1. Enums - SearchMode, ReasoningEffort, SearchContextSize, RecencyFilter
    2. Nested Result Models - SearchResult, Video, Usage, Choice, Message
    3. Request Models - PerplexityDeepResearchRequest
    4. Response Models - PerplexityDeepResearchResponse
"""

import re
from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

# =============================================================================
# Enums
# =============================================================================


class PerplexitySearchMode(StrEnum):
    """Search mode options for Perplexity Sonar API.

    Controls the type of search performed for the query.

    Attributes:
        AUTO: Automatic mode selection based on query content.
        NEWS: Focus on recent news articles and updates.
        ACADEMIC: Prioritize scholarly sources like peer-reviewed papers.
        SOCIAL: Include social media and community discussions.
    """

    AUTO = "auto"
    NEWS = "news"
    ACADEMIC = "academic"
    SOCIAL = "social"


class PerplexityReasoningEffort(StrEnum):
    """Reasoning effort levels for Perplexity reasoning models.

    Controls the depth of reasoning applied to complex queries.

    Attributes:
        LOW: Quick responses with minimal reasoning.
        MEDIUM: Balanced reasoning for general queries.
        HIGH: Deep reasoning for complex analytical tasks.
    """

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class PerplexitySearchContextSize(StrEnum):
    """Search context size options for Perplexity Sonar API.

    Controls the amount of search context included in the response.

    Attributes:
        LOW: Minimal context for faster responses.
        MEDIUM: Balanced context size.
        HIGH: Maximum context for comprehensive answers.
    """

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class PerplexityRecencyFilter(StrEnum):
    """Recency filter options for search results.

    Filters search results to content published within the specified timeframe.

    Attributes:
        HOUR: Content from the last hour.
        DAY: Content from the last 24 hours.
        WEEK: Content from the last 7 days.
        MONTH: Content from the last 30 days.
    """

    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"


# =============================================================================
# Nested Result Models
# =============================================================================


class PerplexitySearchResult(BaseModel):
    """Individual search result citation from Perplexity response.

    Represents a single source citation with URL, title, and content snippet.
    """

    model_config = ConfigDict(extra="allow")

    url: str = Field(description="URL of the source page")
    title: str | None = Field(
        default=None,
        description="Title of the source page",
    )
    snippet: str | None = Field(
        default=None,
        description="Content snippet from the source",
    )


class PerplexityVideo(BaseModel):
    """Video result from Perplexity search.

    Represents a video found during search with URL and metadata.
    """

    model_config = ConfigDict(extra="allow")

    url: str = Field(description="URL of the video")
    title: str | None = Field(
        default=None,
        description="Title of the video",
    )
    thumbnail: str | None = Field(
        default=None,
        description="URL of the video thumbnail",
    )


class PerplexityUsage(BaseModel):
    """Token usage information from Perplexity API response.

    Contains token counts for monitoring API usage and costs.
    """

    model_config = ConfigDict(extra="allow")

    prompt_tokens: int = Field(
        default=0,
        description="Number of tokens in the prompt",
    )
    completion_tokens: int = Field(
        default=0,
        description="Number of tokens in the completion",
    )
    total_tokens: int = Field(
        default=0,
        description="Total tokens used in the request",
    )
    search_context_size: str | None = Field(
        default=None,
        description="Search context size used for the request",
    )


class PerplexityMessage(BaseModel):
    """Message content from Perplexity response.

    Contains the role and content of a message in the conversation.
    """

    model_config = ConfigDict(extra="allow")

    role: str = Field(
        default="assistant",
        description="Role of the message author (assistant, user, system)",
    )
    content: str = Field(
        default="",
        description="Text content of the message",
    )


class PerplexityChoice(BaseModel):
    """Individual choice from Perplexity response.

    Represents one possible response from the model.
    """

    model_config = ConfigDict(extra="allow")

    index: int = Field(
        default=0,
        description="Index of this choice in the list",
    )
    message: PerplexityMessage = Field(
        description="The message content for this choice",
    )
    finish_reason: str | None = Field(
        default=None,
        description="Reason the model stopped generating (stop, length, etc.)",
    )


# =============================================================================
# Request Schemas
# =============================================================================


class PerplexityDeepResearchRequest(BaseModel):
    """Request schema for Perplexity Sonar deep research queries.

    Contains all parameters for performing a deep research query including
    core settings, reasoning options, generation parameters, and search filters.

    Parameter Groups:
        Core: query, model, system_prompt
        Reasoning: search_mode, reasoning_effort, search_context_size
        Generation: max_tokens, temperature, top_p, top_k, presence_penalty,
                   frequency_penalty
        Search Filters: search_recency_filter, search_domain_filter,
                       search_after_date_filter, search_before_date_filter
        Output Options: return_images, return_related_questions
        Control: stream
    """

    model_config = ConfigDict(extra="forbid")

    # -------------------------------------------------------------------------
    # Core Parameters
    # -------------------------------------------------------------------------

    query: str = Field(
        min_length=1,
        max_length=10000,
        description="The research query to answer",
    )
    model: str = Field(
        default="sonar-pro",
        description="Perplexity model to use (sonar, sonar-pro, sonar-reasoning)",
    )
    system_prompt: str | None = Field(
        default=None,
        max_length=5000,
        description="System prompt to guide the model behavior",
    )

    # -------------------------------------------------------------------------
    # Reasoning Parameters
    # -------------------------------------------------------------------------

    search_mode: PerplexitySearchMode | None = Field(
        default=None,
        description="Search mode (auto, news, academic, social)",
    )
    reasoning_effort: PerplexityReasoningEffort | None = Field(
        default=None,
        description="Reasoning effort level for reasoning models",
    )
    search_context_size: PerplexitySearchContextSize | None = Field(
        default=None,
        description="Amount of search context to include",
    )

    # -------------------------------------------------------------------------
    # Generation Parameters
    # -------------------------------------------------------------------------

    max_tokens: Annotated[int, Field(ge=1, le=16384)] | None = Field(
        default=None,
        description="Maximum tokens in the response (1-16384)",
    )
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] | None = Field(
        default=None,
        description="Sampling temperature (0.0-2.0)",
    )
    top_p: Annotated[float, Field(ge=0.0, le=1.0)] | None = Field(
        default=None,
        description="Nucleus sampling probability (0.0-1.0)",
    )
    top_k: Annotated[int, Field(ge=0)] | None = Field(
        default=None,
        description="Top-k sampling parameter",
    )
    presence_penalty: Annotated[float, Field(ge=-2.0, le=2.0)] | None = Field(
        default=None,
        description="Presence penalty (-2.0 to 2.0)",
    )
    frequency_penalty: Annotated[float, Field(ge=-2.0, le=2.0)] | None = Field(
        default=None,
        description="Frequency penalty (-2.0 to 2.0)",
    )

    # -------------------------------------------------------------------------
    # Search Filter Parameters
    # -------------------------------------------------------------------------

    search_recency_filter: PerplexityRecencyFilter | None = Field(
        default=None,
        description="Filter results by recency (hour, day, week, month)",
    )
    search_domain_filter: list[str] | None = Field(
        default=None,
        description="Domains to include/exclude (prefix with - to exclude)",
    )
    search_after_date_filter: str | None = Field(
        default=None,
        description="Only include content after this date (MM/DD/YYYY format)",
    )
    search_before_date_filter: str | None = Field(
        default=None,
        description="Only include content before this date (MM/DD/YYYY format)",
    )

    # -------------------------------------------------------------------------
    # Output Options
    # -------------------------------------------------------------------------

    return_images: bool = Field(
        default=False,
        description="Include images in the response (Tier-2+ only)",
    )
    return_related_questions: bool = Field(
        default=False,
        description="Include related follow-up questions",
    )

    # -------------------------------------------------------------------------
    # Control Parameters
    # -------------------------------------------------------------------------

    stream: bool = Field(
        default=False,
        description="Enable streaming response",
    )

    # -------------------------------------------------------------------------
    # Validators
    # -------------------------------------------------------------------------

    @field_validator("search_domain_filter", mode="before")
    @classmethod
    def validate_domain_filter(cls, v: list[str] | None) -> list[str] | None:
        """Validate and normalize domain filter list."""
        if v is None:
            return None
        if not isinstance(v, list):
            return None
        # Filter out empty strings and strip whitespace
        return [d.strip().lower() for d in v if d and d.strip()]

    @field_validator("search_after_date_filter", "search_before_date_filter")
    @classmethod
    def validate_date_filter(cls, v: str | None) -> str | None:
        """Validate date filter format (MM/DD/YYYY)."""
        if v is None:
            return None
        v = v.strip()
        if not v:
            return None
        # Validate MM/DD/YYYY format
        date_pattern = r"^\d{1,2}/\d{1,2}/\d{4}$"
        if not re.match(date_pattern, v):
            raise ValueError("Date must be in MM/DD/YYYY format")
        return v


# =============================================================================
# Response Schemas
# =============================================================================


class PerplexityDeepResearchResponse(BaseModel):
    """Response schema for Perplexity Sonar deep research queries.

    Contains the model response with choices, citations, usage information,
    and optional images and related questions.
    """

    model_config = ConfigDict(extra="allow")

    id: str = Field(
        description="Unique identifier for this response",
    )
    model: str = Field(
        description="Model used for the response",
    )
    created: int = Field(
        default=0,
        description="Unix timestamp of response creation",
    )
    object: str = Field(
        default="chat.completion",
        description="Object type (chat.completion)",
    )
    choices: list[PerplexityChoice] = Field(
        default_factory=list,
        description="List of response choices",
    )
    citations: list[str] = Field(
        default_factory=list,
        description="List of citation URLs referenced in the response",
    )
    search_results: list[PerplexitySearchResult] = Field(
        default_factory=list,
        description="Detailed search results with snippets",
    )
    images: list[str] = Field(
        default_factory=list,
        description="Image URLs included in the response",
    )
    videos: list[PerplexityVideo] = Field(
        default_factory=list,
        description="Video results included in the response",
    )
    related_questions: list[str] = Field(
        default_factory=list,
        description="Related follow-up questions",
    )
    usage: PerplexityUsage | None = Field(
        default=None,
        description="Token usage information",
    )
