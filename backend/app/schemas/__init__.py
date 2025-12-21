"""Pydantic schemas for API request/response models.

This package contains all Pydantic v2 schemas used by the FastAPI application
for request validation, response serialization, and OpenAPI documentation.
"""

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

__all__ = [
    # Enums
    "SearchDepth",
    "SearchTopic",
    # Nested Result Models
    "SearchResult",
    "SearchImage",
    "ExtractResult",
    "CrawlResult",
    # Request Schemas
    "SearchRequest",
    "ExtractRequest",
    "CrawlRequest",
    "MapRequest",
    # Response Schemas
    "SearchResponse",
    "ExtractResponse",
    "CrawlResponse",
    "MapResponse",
]
