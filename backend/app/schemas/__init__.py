"""Pydantic schemas for API request/response models.

This package contains all Pydantic v2 schemas used by the FastAPI application
for request validation, response serialization, and OpenAPI documentation.
"""

from app.schemas.gemini import (
    # Response Schemas
    GeminiDeepResearchJobResponse,
    # Request Schemas
    GeminiDeepResearchPollRequest,
    GeminiDeepResearchRequest,
    GeminiDeepResearchResultResponse,
    # Enums
    GeminiDeltaType,
    GeminiInteractionStatus,
    # Nested Models
    GeminiOutput,
    GeminiStreamEventType,
    GeminiUsage,
)
from app.schemas.perplexity import (
    # Nested Result Models
    PerplexityChoice,
    # Request Schemas
    PerplexityDeepResearchRequest,
    # Response Schemas
    PerplexityDeepResearchResponse,
    PerplexityMessage,
    # Enums
    PerplexityReasoningEffort,
    PerplexityRecencyFilter,
    PerplexitySearchContextSize,
    PerplexitySearchMode,
    PerplexitySearchResult,
    PerplexityUsage,
    PerplexityVideo,
)
from app.schemas.tavily import (
    # Request Schemas
    CrawlRequest,
    # Response Schemas
    CrawlResponse,
    # Nested Result Models
    CrawlResult,
    ExtractRequest,
    ExtractResponse,
    ExtractResult,
    MapRequest,
    MapResponse,
    # Enums
    SearchDepth,
    SearchImage,
    SearchRequest,
    SearchResponse,
    SearchResult,
    SearchTopic,
)
from app.schemas.youcom import (
    YouComDeepResearchRequest,
    YouComDeepResearchResponse,
    YouComOutput,
    YouComResearchEffort,
    YouComSource,
)

__all__ = [
    # Tavily Enums
    "SearchDepth",
    "SearchTopic",
    # Tavily Nested Result Models
    "SearchResult",
    "SearchImage",
    "ExtractResult",
    "CrawlResult",
    # Tavily Request Schemas
    "SearchRequest",
    "ExtractRequest",
    "CrawlRequest",
    "MapRequest",
    # Tavily Response Schemas
    "SearchResponse",
    "ExtractResponse",
    "CrawlResponse",
    "MapResponse",
    # Perplexity Enums
    "PerplexitySearchMode",
    "PerplexityReasoningEffort",
    "PerplexitySearchContextSize",
    "PerplexityRecencyFilter",
    # Perplexity Nested Result Models
    "PerplexitySearchResult",
    "PerplexityVideo",
    "PerplexityUsage",
    "PerplexityMessage",
    "PerplexityChoice",
    # Perplexity Request Schemas
    "PerplexityDeepResearchRequest",
    # Perplexity Response Schemas
    "PerplexityDeepResearchResponse",
    # Gemini Enums
    "GeminiInteractionStatus",
    "GeminiStreamEventType",
    "GeminiDeltaType",
    # Gemini Nested Models
    "GeminiUsage",
    "GeminiOutput",
    # Gemini Request Schemas
    "GeminiDeepResearchRequest",
    "GeminiDeepResearchPollRequest",
    # Gemini Response Schemas
    "GeminiDeepResearchJobResponse",
    "GeminiDeepResearchResultResponse",
    # You.com Enums
    "YouComResearchEffort",
    # You.com Nested Models
    "YouComSource",
    "YouComOutput",
    # You.com Request Schemas
    "YouComDeepResearchRequest",
    # You.com Response Schemas
    "YouComDeepResearchResponse",
]
