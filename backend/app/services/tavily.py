"""Tavily API service layer.

This module provides the TavilyService class which encapsulates all interactions
with the Tavily Python SDK. It manages the AsyncTavilyClient lifecycle and
provides async methods for search, extract, crawl, and URL mapping operations.

Usage:
    from app.services.tavily import TavilyService

    service = TavilyService()
    results = await service.search("python web scraping")
"""

from typing import Any

from tavily import AsyncTavilyClient  # type: ignore[import-untyped]

from app.core.config import settings


class TavilyService:
    """Service layer for Tavily API operations.

    This class provides async methods for interacting with the Tavily API:
    - search: Web search with advanced filtering options
    - extract: Content extraction from URLs
    - crawl: Site crawling with depth control
    - map_urls: Sitemap generation for domains

    The service initializes an AsyncTavilyClient using configuration from
    TavilySettings (api_key, timeout, proxy).

    Attributes:
        _client: The underlying AsyncTavilyClient instance.
        _timeout: Default timeout for API requests in seconds.
    """

    def __init__(self) -> None:
        """Initialize TavilyService with configured AsyncTavilyClient.

        Reads configuration from settings.tavily:
        - api_key: Required Tavily API key
        - timeout: Request timeout in seconds (default: 60)
        - proxy: Optional HTTP proxy URL

        The proxy string is converted to the dict format expected by
        AsyncTavilyClient ({"http": url, "https": url}).
        """
        tavily_settings = settings.tavily

        # Convert proxy string to dict format if provided
        proxies: dict[str, str] | None = None
        if tavily_settings.proxy:
            proxies = {
                "http": tavily_settings.proxy,
                "https": tavily_settings.proxy,
            }

        # Store timeout for use in service methods
        self._timeout: int = tavily_settings.timeout

        # Initialize the async client
        self._client: AsyncTavilyClient = AsyncTavilyClient(
            api_key=tavily_settings.api_key,
            proxies=proxies,
        )

    async def search(
        self,
        query: str,
        *,
        search_depth: str = "basic",
        topic: str = "general",
        max_results: int = 5,
        include_images: bool = False,
        include_image_descriptions: bool = False,
        include_answer: bool = False,
        include_raw_content: bool = False,
        include_domains: list[str] | None = None,
        exclude_domains: list[str] | None = None,
        timeout: int | None = None,
    ) -> dict[str, Any]:
        """Perform a web search using the Tavily API.

        Args:
            query: The search query string.
            search_depth: Search depth - "basic" or "advanced". Advanced provides
                more comprehensive results but takes longer. Default: "basic".
            topic: Search topic category - "general" or "news". Default: "general".
            max_results: Maximum number of results to return (1-20). Default: 5.
            include_images: Include relevant images in results. Default: False.
            include_image_descriptions: Include descriptions for images.
                Only applies if include_images is True. Default: False.
            include_answer: Include an AI-generated answer summary. Default: False.
            include_raw_content: Include raw HTML content of pages. Default: False.
            include_domains: List of domains to restrict search to.
                Example: ["example.com", "docs.python.org"]. Default: None.
            exclude_domains: List of domains to exclude from search.
                Example: ["pinterest.com", "facebook.com"]. Default: None.
            timeout: Request timeout in seconds. Uses configured default if None.

        Returns:
            dict containing search results with keys:
            - query: The original search query
            - results: List of search result objects
            - answer: AI-generated answer (if include_answer=True)
            - images: List of image objects (if include_images=True)
        """
        effective_timeout = timeout if timeout is not None else self._timeout

        result: dict[str, Any] = await self._client.search(
            query=query,
            search_depth=search_depth,
            topic=topic,
            max_results=max_results,
            include_images=include_images,
            include_image_descriptions=include_image_descriptions,
            include_answer=include_answer,
            include_raw_content=include_raw_content,
            include_domains=include_domains,
            exclude_domains=exclude_domains,
            timeout=effective_timeout,
        )
        return result

    async def extract(
        self,
        urls: str | list[str],
        *,
        timeout: int | None = None,
    ) -> dict[str, Any]:
        """Extract content from one or more URLs.

        Uses Tavily's extraction API to retrieve clean, structured content
        from web pages. Handles both single URLs and batch extraction.

        Args:
            urls: Single URL string or list of URLs to extract content from.
                Example: "https://example.com" or ["https://a.com", "https://b.com"]
            timeout: Request timeout in seconds. Uses configured default if None.

        Returns:
            dict containing extraction results with keys:
            - results: List of extraction result objects, each containing:
                - url: The source URL
                - raw_content: Extracted text content
                - images: List of image URLs found (if any)
        """
        effective_timeout = timeout if timeout is not None else self._timeout

        result: dict[str, Any] = await self._client.extract(
            urls=urls,
            timeout=effective_timeout,
        )
        return result

    async def crawl(
        self,
        url: str,
        *,
        max_depth: int = 1,
        max_breadth: int = 20,
        limit: int = 50,
        instructions: str | None = None,
        select_paths: list[str] | None = None,
        select_domains: list[str] | None = None,
        timeout: int | None = None,
    ) -> dict[str, Any]:
        """Crawl a website starting from the given URL.

        Performs recursive crawling of a website, extracting content from
        discovered pages up to the specified depth and breadth limits.

        Args:
            url: Starting URL for the crawl.
                Example: "https://docs.python.org/3/"
            max_depth: Maximum link depth to crawl from starting URL.
                0 = starting page only, 1 = starting page + linked pages, etc.
                Default: 1.
            max_breadth: Maximum number of links to follow per page.
                Default: 20.
            limit: Maximum total number of pages to crawl. Default: 50.
            instructions: Natural language instructions for content selection.
                Example: "Focus on API documentation and code examples."
                Default: None.
            select_paths: URL path patterns to include in crawl.
                Example: ["/docs/", "/api/"]. Default: None (crawl all paths).
            select_domains: Additional domains to include in crawl.
                Example: ["api.example.com"]. Default: None (stay on initial domain).
            timeout: Request timeout in seconds. Uses configured default if None.

        Returns:
            dict containing crawl results with keys:
            - base_url: The starting URL
            - results: List of crawled page objects with content
            - total_pages: Number of pages crawled
        """
        effective_timeout = timeout if timeout is not None else self._timeout

        result: dict[str, Any] = await self._client.crawl(
            url=url,
            max_depth=max_depth,
            max_breadth=max_breadth,
            limit=limit,
            instructions=instructions,
            select_paths=select_paths,
            select_domains=select_domains,
            timeout=effective_timeout,
        )
        return result

    async def map_urls(
        self,
        url: str,
        *,
        max_depth: int = 1,
        max_breadth: int = 20,
        limit: int = 100,
        instructions: str | None = None,
        select_paths: list[str] | None = None,
        select_domains: list[str] | None = None,
        timeout: int | None = None,
    ) -> dict[str, Any]:
        """Generate a sitemap of URLs from a website.

        Discovers and returns URLs from a website without extracting content.
        Useful for understanding site structure before targeted extraction.

        Note: This method is named map_urls instead of map to avoid shadowing
        Python's built-in map function.

        Args:
            url: Starting URL for mapping.
                Example: "https://example.com"
            max_depth: Maximum link depth to discover from starting URL.
                Default: 1.
            max_breadth: Maximum number of links to follow per page.
                Default: 20.
            limit: Maximum total number of URLs to discover. Default: 100.
            instructions: Natural language instructions for URL selection.
                Example: "Focus on product pages and documentation."
                Default: None.
            select_paths: URL path patterns to include.
                Example: ["/products/", "/docs/"]. Default: None.
            select_domains: Additional domains to include in mapping.
                Default: None (stay on initial domain).
            timeout: Request timeout in seconds. Uses configured default if None.

        Returns:
            dict containing mapping results with keys:
            - base_url: The starting URL
            - urls: List of discovered URL strings
            - total_urls: Number of URLs discovered
        """
        effective_timeout = timeout if timeout is not None else self._timeout

        result: dict[str, Any] = await self._client.map(
            url=url,
            max_depth=max_depth,
            max_breadth=max_breadth,
            limit=limit,
            instructions=instructions,
            select_paths=select_paths,
            select_domains=select_domains,
            timeout=effective_timeout,
        )
        return result
