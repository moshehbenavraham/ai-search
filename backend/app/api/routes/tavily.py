"""Tavily API route handlers.

This module provides FastAPI route handlers for Tavily search, extract, crawl,
and map operations. Routes require JWT authentication via CurrentUser dependency
and use TavilyDep for service injection.

Endpoints:
    POST /tavily/search - Perform web search using Tavily API
    POST /tavily/extract - Extract content from URLs
    POST /tavily/crawl - Crawl a website starting from a URL
    POST /tavily/map - Generate a sitemap of URLs from a website
"""

import asyncio
from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUser, TavilyDep
from app.core.exceptions import TavilyAPIError
from app.schemas.tavily import (
    CrawlRequest,
    CrawlResponse,
    ExtractRequest,
    ExtractResponse,
    MapRequest,
    MapResponse,
    SearchRequest,
    SearchResponse,
)

router = APIRouter(prefix="/tavily", tags=["tavily"])


def _handle_tavily_exception(exc: Exception) -> TavilyAPIError:
    """Map Tavily SDK exceptions to TavilyAPIError.

    Args:
        exc: The exception raised by the Tavily SDK.

    Returns:
        TavilyAPIError with appropriate status code and error code.
    """
    exc_message = str(exc).lower()

    # Check for rate limit errors
    if "rate limit" in exc_message or "usage limit" in exc_message:
        return TavilyAPIError.rate_limit_exceeded(details={"original_error": str(exc)})

    # Check for authentication errors
    if (
        "api key" in exc_message
        or "authentication" in exc_message
        or "unauthorized" in exc_message
        or "invalid key" in exc_message
    ):
        return TavilyAPIError.invalid_api_key(details={"original_error": str(exc)})

    # Check for timeout errors
    if isinstance(exc, asyncio.TimeoutError) or "timeout" in exc_message:
        return TavilyAPIError.request_timeout(details={"original_error": str(exc)})

    # Check for validation errors
    if "invalid" in exc_message or "validation" in exc_message:
        return TavilyAPIError.invalid_request(
            message=str(exc), details={"original_error": str(exc)}
        )

    # Generic API error for anything else
    return TavilyAPIError.api_error(
        message=f"Tavily API error: {exc}", details={"original_error": str(exc)}
    )


@router.post("/search", response_model=SearchResponse)
async def search(
    _current_user: CurrentUser,
    tavily: TavilyDep,
    request: SearchRequest,
) -> Any:
    """Perform a web search using Tavily API.

    Executes a web search with the provided query and parameters, returning
    relevant search results and optionally an AI-generated answer.

    Args:
        current_user: Authenticated user (required for authorization).
        tavily: Injected TavilyService instance.
        request: Search request with query and optional parameters.

    Returns:
        SearchResponse with query, results, and optional answer/images.

    Raises:
        TavilyAPIError: If the Tavily API request fails.
    """
    try:
        result = await tavily.search(
            query=request.query,
            search_depth=request.search_depth.value,
            topic=request.topic.value,
            max_results=request.max_results,
            include_images=request.include_images,
            include_image_descriptions=request.include_image_descriptions,
            include_answer=request.include_answer,
            include_raw_content=request.include_raw_content,
            include_domains=request.include_domains,
            exclude_domains=request.exclude_domains,
        )
        return SearchResponse.model_validate(result)
    except TavilyAPIError:
        raise
    except Exception as exc:
        raise _handle_tavily_exception(exc) from exc


@router.post("/extract", response_model=ExtractResponse)
async def extract(
    _current_user: CurrentUser,
    tavily: TavilyDep,
    request: ExtractRequest,
) -> Any:
    """Extract content from one or more URLs.

    Uses Tavily extraction API to retrieve clean, structured content from
    web pages. Supports both single URL and batch URL extraction.

    Args:
        current_user: Authenticated user (required for authorization).
        tavily: Injected TavilyService instance.
        request: Extract request with URL or list of URLs.

    Returns:
        ExtractResponse with extraction results for each URL.

    Raises:
        TavilyAPIError: If the Tavily API request fails.
    """
    try:
        result = await tavily.extract(urls=request.urls)
        return ExtractResponse.model_validate(result)
    except TavilyAPIError:
        raise
    except Exception as exc:
        raise _handle_tavily_exception(exc) from exc


@router.post("/crawl", response_model=CrawlResponse)
async def crawl(
    _current_user: CurrentUser,
    tavily: TavilyDep,
    request: CrawlRequest,
) -> Any:
    """Crawl a website starting from a given URL.

    Performs recursive crawling of a website, extracting content from
    discovered pages up to the specified depth and breadth limits.

    Args:
        current_user: Authenticated user (required for authorization).
        tavily: Injected TavilyService instance.
        request: Crawl request with URL and crawl parameters.

    Returns:
        CrawlResponse with base URL, crawled page results, and total count.

    Raises:
        TavilyAPIError: If the Tavily API request fails.
    """
    try:
        result = await tavily.crawl(
            url=request.url,
            max_depth=request.max_depth,
            max_breadth=request.max_breadth,
            limit=request.limit,
            instructions=request.instructions,
            select_paths=request.select_paths,
            select_domains=request.select_domains,
        )
        return CrawlResponse.model_validate(result)
    except TavilyAPIError:
        raise
    except Exception as exc:
        raise _handle_tavily_exception(exc) from exc


@router.post("/map", response_model=MapResponse)
async def map_urls(
    _current_user: CurrentUser,
    tavily: TavilyDep,
    request: MapRequest,
) -> Any:
    """Generate a sitemap of URLs from a website.

    Discovers and returns URLs from a website without extracting content.
    Useful for understanding site structure before targeted extraction.

    Args:
        current_user: Authenticated user (required for authorization).
        tavily: Injected TavilyService instance.
        request: Map request with URL and mapping parameters.

    Returns:
        MapResponse with base URL, discovered URLs, and total count.

    Raises:
        TavilyAPIError: If the Tavily API request fails.
    """
    try:
        result = await tavily.map_urls(
            url=request.url,
            max_depth=request.max_depth,
            max_breadth=request.max_breadth,
            limit=request.limit,
            instructions=request.instructions,
            select_paths=request.select_paths,
            select_domains=request.select_domains,
        )
        return MapResponse.model_validate(result)
    except TavilyAPIError:
        raise
    except Exception as exc:
        raise _handle_tavily_exception(exc) from exc
