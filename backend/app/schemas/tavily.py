"""Pydantic schemas for Tavily API request and response types.

This module defines all request and response schemas for the Tavily integration,
including schemas for web search, URL extraction, site crawling, and URL mapping
operations. These schemas provide request validation, response serialization,
and OpenAPI documentation generation for the FastAPI routes.

Schema Organization:
    1. Enums - SearchDepth, SearchTopic
    2. Nested Result Models - SearchResult, ExtractResult, CrawlResult
    3. Request Models - SearchRequest, ExtractRequest, CrawlRequest, MapRequest
    4. Response Models - SearchResponse, ExtractResponse, CrawlResponse, MapResponse
"""

from enum import StrEnum
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

# =============================================================================
# Enums
# =============================================================================


class SearchDepth(StrEnum):
    """Search depth options for Tavily web search.

    Attributes:
        BASIC: Standard search, faster response time.
        ADVANCED: Comprehensive search with more detailed results.
    """

    BASIC = "basic"
    ADVANCED = "advanced"


class SearchTopic(StrEnum):
    """Search topic categories for Tavily web search.

    Attributes:
        GENERAL: General web content search.
        NEWS: News-focused search for recent articles and updates.
    """

    GENERAL = "general"
    NEWS = "news"


# =============================================================================
# Nested Result Models
# =============================================================================


class SearchResult(BaseModel):
    """Individual search result from Tavily web search.

    Represents a single search result with URL, title, content snippet,
    and optional additional fields based on search parameters.
    """

    model_config = ConfigDict(extra="allow")

    url: str = Field(description="URL of the search result page")
    title: str = Field(description="Title of the search result page")
    content: str = Field(description="Snippet or summary of the page content")
    score: float = Field(description="Relevance score for this result")
    raw_content: str | None = Field(
        default=None,
        description="Raw HTML content of the page (if include_raw_content=True)",
    )


class SearchImage(BaseModel):
    """Image result from Tavily search.

    Represents an image found during search with URL and optional description.
    """

    model_config = ConfigDict(extra="allow")

    url: str = Field(description="URL of the image")
    description: str | None = Field(
        default=None,
        description="Description of the image (if include_image_descriptions=True)",
    )


class ExtractResult(BaseModel):
    """Extraction result for a single URL.

    Contains the extracted content from a URL including text and images.
    """

    model_config = ConfigDict(extra="allow")

    url: str = Field(description="Source URL that was extracted")
    raw_content: str = Field(description="Extracted text content from the page")
    images: list[str] = Field(
        default_factory=list,
        description="List of image URLs found on the page",
    )


class CrawlResult(BaseModel):
    """Individual page result from site crawling.

    Represents a single crawled page with its URL and extracted content.
    """

    model_config = ConfigDict(extra="allow")

    url: str = Field(description="URL of the crawled page")
    raw_content: str = Field(description="Extracted text content from the page")
    metadata: dict[str, Any] | None = Field(
        default=None,
        description="Additional metadata about the crawled page",
    )


# =============================================================================
# Request Schemas
# =============================================================================


class SearchRequest(BaseModel):
    """Request schema for Tavily web search.

    Contains all parameters for performing a web search including query,
    depth settings, result filtering, and content inclusion options.
    """

    model_config = ConfigDict(extra="forbid")

    query: str = Field(
        min_length=1,
        max_length=1000,
        description="Search query string",
    )
    search_depth: SearchDepth = Field(
        default=SearchDepth.BASIC,
        description="Search depth - basic for faster results, advanced for comprehensive",
    )
    topic: SearchTopic = Field(
        default=SearchTopic.GENERAL,
        description="Topic category - general for web content, news for recent articles",
    )
    max_results: Annotated[int, Field(ge=1, le=20)] = Field(
        default=5,
        description="Maximum number of results to return (1-20)",
    )
    include_images: bool = Field(
        default=False,
        description="Include relevant images in search results",
    )
    include_image_descriptions: bool = Field(
        default=False,
        description="Include descriptions for images (requires include_images=True)",
    )
    include_answer: bool = Field(
        default=False,
        description="Include AI-generated answer summary",
    )
    include_raw_content: bool = Field(
        default=False,
        description="Include raw HTML content of result pages",
    )
    include_domains: list[str] | None = Field(
        default=None,
        description="List of domains to restrict search to (e.g., ['example.com'])",
    )
    exclude_domains: list[str] | None = Field(
        default=None,
        description="List of domains to exclude from search (e.g., ['pinterest.com'])",
    )

    @field_validator("include_domains", "exclude_domains", mode="before")
    @classmethod
    def validate_domain_list(cls, v: list[str] | None) -> list[str] | None:
        """Validate and normalize domain lists."""
        if v is None:
            return None
        if not isinstance(v, list):
            return None
        # Filter out empty strings and strip whitespace
        return [d.strip().lower() for d in v if d and d.strip()]


class ExtractRequest(BaseModel):
    """Request schema for Tavily URL content extraction.

    Supports both single URL and batch URL extraction. The urls field
    accepts either a single URL string or a list of URL strings.
    """

    model_config = ConfigDict(extra="forbid")

    urls: str | list[str] = Field(
        description="Single URL or list of URLs to extract content from",
    )

    @field_validator("urls", mode="before")
    @classmethod
    def validate_urls(cls, v: str | list[str]) -> str | list[str]:
        """Validate and normalize URL input."""
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("URL cannot be empty")
            if not v.startswith(("http://", "https://")):
                raise ValueError("URL must start with http:// or https://")
            return v
        if isinstance(v, list):
            if not v:
                raise ValueError("URL list cannot be empty")
            validated = []
            for url in v:
                if not isinstance(url, str):
                    raise ValueError("All URLs must be strings")
                url = url.strip()
                if not url:
                    raise ValueError("URLs cannot be empty strings")
                if not url.startswith(("http://", "https://")):
                    raise ValueError(f"URL must start with http:// or https://: {url}")
                validated.append(url)
            return validated
        raise ValueError("urls must be a string or list of strings")


class CrawlRequest(BaseModel):
    """Request schema for Tavily site crawling.

    Contains parameters for recursive website crawling including depth,
    breadth, limits, and path/domain filtering options.
    """

    model_config = ConfigDict(extra="forbid")

    url: str = Field(
        description="Starting URL for the crawl",
    )
    max_depth: Annotated[int, Field(ge=0)] = Field(
        default=1,
        description="Maximum link depth to crawl from starting URL (0 = starting page only)",
    )
    max_breadth: Annotated[int, Field(ge=1)] = Field(
        default=20,
        description="Maximum number of links to follow per page",
    )
    limit: Annotated[int, Field(ge=1)] = Field(
        default=50,
        description="Maximum total number of pages to crawl",
    )
    instructions: str | None = Field(
        default=None,
        max_length=1000,
        description="Natural language instructions for content selection",
    )
    select_paths: list[str] | None = Field(
        default=None,
        description="URL path patterns to include in crawl (e.g., ['/docs/', '/api/'])",
    )
    select_domains: list[str] | None = Field(
        default=None,
        description="Additional domains to include in crawl (e.g., ['api.example.com'])",
    )

    @field_validator("url", mode="before")
    @classmethod
    def validate_url(cls, v: str) -> str:
        """Validate the starting URL."""
        if not isinstance(v, str):
            raise ValueError("URL must be a string")
        v = v.strip()
        if not v:
            raise ValueError("URL cannot be empty")
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class MapRequest(BaseModel):
    """Request schema for Tavily URL mapping (sitemap generation).

    Contains parameters for discovering URLs from a website without
    extracting content. Useful for understanding site structure.
    """

    model_config = ConfigDict(extra="forbid")

    url: str = Field(
        description="Starting URL for mapping",
    )
    max_depth: Annotated[int, Field(ge=0)] = Field(
        default=1,
        description="Maximum link depth to discover from starting URL",
    )
    max_breadth: Annotated[int, Field(ge=1)] = Field(
        default=20,
        description="Maximum number of links to follow per page",
    )
    limit: Annotated[int, Field(ge=1)] = Field(
        default=100,
        description="Maximum total number of URLs to discover",
    )
    instructions: str | None = Field(
        default=None,
        max_length=1000,
        description="Natural language instructions for URL selection",
    )
    select_paths: list[str] | None = Field(
        default=None,
        description="URL path patterns to include (e.g., ['/products/', '/docs/'])",
    )
    select_domains: list[str] | None = Field(
        default=None,
        description="Additional domains to include in mapping",
    )

    @field_validator("url", mode="before")
    @classmethod
    def validate_url(cls, v: str) -> str:
        """Validate the starting URL."""
        if not isinstance(v, str):
            raise ValueError("URL must be a string")
        v = v.strip()
        if not v:
            raise ValueError("URL cannot be empty")
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


# =============================================================================
# Response Schemas
# =============================================================================


class SearchResponse(BaseModel):
    """Response schema for Tavily web search.

    Contains the original query, list of search results, and optional
    AI-generated answer and images based on request parameters.
    """

    model_config = ConfigDict(extra="allow")

    query: str = Field(description="The original search query")
    results: list[SearchResult] = Field(
        default_factory=list,
        description="List of search results",
    )
    answer: str | None = Field(
        default=None,
        description="AI-generated answer summary (if include_answer=True)",
    )
    images: list[SearchImage] = Field(
        default_factory=list,
        description="List of relevant images (if include_images=True)",
    )


class ExtractResponse(BaseModel):
    """Response schema for Tavily URL content extraction.

    Contains the extraction results for all requested URLs.
    """

    model_config = ConfigDict(extra="allow")

    results: list[ExtractResult] = Field(
        default_factory=list,
        description="List of extraction results for each URL",
    )
    failed_results: list[dict[str, Any]] = Field(
        default_factory=list,
        description="List of URLs that failed to extract with error details",
    )


class CrawlResponse(BaseModel):
    """Response schema for Tavily site crawling.

    Contains the base URL, list of crawled page results, and total count.
    """

    model_config = ConfigDict(extra="allow")

    base_url: str = Field(description="The starting URL for the crawl")
    results: list[CrawlResult] = Field(
        default_factory=list,
        description="List of crawled page results with content",
    )
    total_pages: int = Field(
        default=0,
        description="Total number of pages successfully crawled",
    )


class MapResponse(BaseModel):
    """Response schema for Tavily URL mapping.

    Contains the base URL, list of discovered URLs, and total count.
    """

    model_config = ConfigDict(extra="allow")

    base_url: str = Field(description="The starting URL for mapping")
    urls: list[str] = Field(
        default_factory=list,
        description="List of discovered URL strings",
    )
    total_urls: int = Field(
        default=0,
        description="Total number of URLs discovered",
    )


# =============================================================================
# Error Response Schema
# =============================================================================


class ErrorResponse(BaseModel):
    """Standard error response schema for Tavily API errors.

    Provides a consistent error format for all Tavily-related errors,
    enabling clients to handle errors in a uniform way.
    """

    model_config = ConfigDict(extra="forbid")

    error_code: str = Field(description="Machine-readable error code")
    message: str = Field(description="Human-readable error message")
    details: dict[str, Any] | None = Field(
        default=None,
        description="Additional error details",
    )
