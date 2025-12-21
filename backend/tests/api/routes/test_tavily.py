"""Unit tests for Tavily API route handlers.

This module contains comprehensive tests for all Tavily endpoints:
- POST /tavily/search - Web search functionality
- POST /tavily/extract - URL content extraction
- POST /tavily/crawl - Website crawling
- POST /tavily/map - URL mapping/sitemap generation

Tests use mocked TavilyService to ensure fast, deterministic execution.
Integration tests with real API calls are marked with @pytest.mark.integration.
"""

from collections.abc import Generator
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_tavily_service
from app.core.config import settings
from app.main import app

# =============================================================================
# Mock Response Factories
# =============================================================================


def create_mock_search_response(
    query: str = "test query",
    num_results: int = 2,
    include_answer: bool = False,
    include_images: bool = False,
) -> dict[str, Any]:
    """Create a mock search response matching Tavily API structure."""
    results = [
        {
            "url": f"https://example{i}.com/page",
            "title": f"Example Result {i}",
            "content": f"This is the content snippet for result {i}.",
            "score": 0.95 - (i * 0.1),
            "raw_content": None,
        }
        for i in range(1, num_results + 1)
    ]
    response = {
        "query": query,
        "results": results,
    }
    if include_answer:
        response["answer"] = "This is an AI-generated answer summary."
    if include_images:
        response["images"] = [
            {"url": "https://example.com/image1.jpg", "description": "Image 1"}
        ]
    return response


def create_mock_extract_response(urls: list[str] | str) -> dict[str, Any]:
    """Create a mock extract response matching Tavily API structure."""
    if isinstance(urls, str):
        urls = [urls]
    results = [
        {
            "url": url,
            "raw_content": f"Extracted content from {url}",
            "images": ["https://example.com/img1.jpg"],
        }
        for url in urls
    ]
    return {
        "results": results,
        "failed_results": [],
    }


def create_mock_crawl_response(
    url: str = "https://example.com",
    num_pages: int = 3,
) -> dict[str, Any]:
    """Create a mock crawl response matching Tavily API structure."""
    results = [
        {
            "url": f"{url}/page{i}",
            "raw_content": f"Crawled content from page {i}",
            "metadata": {"title": f"Page {i}"},
        }
        for i in range(1, num_pages + 1)
    ]
    return {
        "base_url": url,
        "results": results,
        "total_pages": num_pages,
    }


def create_mock_map_response(
    url: str = "https://example.com",
    num_urls: int = 5,
) -> dict[str, Any]:
    """Create a mock map response matching Tavily API structure."""
    urls = [f"{url}/page{i}" for i in range(1, num_urls + 1)]
    return {
        "base_url": url,
        "urls": urls,
        "total_urls": num_urls,
    }


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def mock_tavily_service() -> MagicMock:
    """Create a mock TavilyService with AsyncMock methods."""
    service = MagicMock()
    service.search = AsyncMock()
    service.extract = AsyncMock()
    service.crawl = AsyncMock()
    service.map_urls = AsyncMock()
    return service


@pytest.fixture
def client_with_mock_tavily(
    mock_tavily_service: MagicMock,
) -> Generator[TestClient, None, None]:
    """Create a test client with mocked TavilyService."""
    app.dependency_overrides[get_tavily_service] = lambda: mock_tavily_service
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


# =============================================================================
# Search Endpoint Tests
# =============================================================================


class TestSearchEndpoint:
    """Tests for POST /tavily/search endpoint."""

    def test_search_success(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test successful search request returns SearchResponse."""
        query = "python programming"
        mock_response = create_mock_search_response(query=query, num_results=3)
        mock_tavily_service.search.return_value = mock_response

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/search",
            headers=superuser_token_headers,
            json={"query": query},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["query"] == query
        assert len(data["results"]) == 3
        assert data["results"][0]["url"] == "https://example1.com/page"
        mock_tavily_service.search.assert_called_once()

    def test_search_with_options(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test search with additional options returns correct response."""
        query = "AI news"
        mock_response = create_mock_search_response(
            query=query, num_results=5, include_answer=True
        )
        mock_response["answer"] = "AI is advancing rapidly."
        mock_tavily_service.search.return_value = mock_response

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/search",
            headers=superuser_token_headers,
            json={
                "query": query,
                "max_results": 5,
                "search_depth": "advanced",
                "topic": "news",
                "include_answer": True,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["query"] == query
        assert data["answer"] is not None

    def test_search_unauthenticated(
        self,
        client_with_mock_tavily: TestClient,
    ) -> None:
        """Test search without auth headers returns 401."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/search",
            json={"query": "test query"},
        )

        assert response.status_code == 401

    def test_search_invalid_query_empty(
        self,
        client_with_mock_tavily: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test search with empty query returns 422."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/search",
            headers=superuser_token_headers,
            json={"query": ""},
        )

        assert response.status_code == 422

    def test_search_invalid_max_results(
        self,
        client_with_mock_tavily: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test search with out-of-range max_results returns 422."""
        # max_results must be between 1 and 20
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/search",
            headers=superuser_token_headers,
            json={"query": "test", "max_results": 50},
        )

        assert response.status_code == 422

    def test_search_rate_limit_error(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test search with rate limit exception returns 429."""
        mock_tavily_service.search.side_effect = Exception("rate limit exceeded")

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/search",
            headers=superuser_token_headers,
            json={"query": "test query"},
        )

        assert response.status_code == 429
        data = response.json()
        assert data["error_code"] == "rate_limit_exceeded"

    def test_search_timeout_error(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test search with timeout exception returns 504."""
        import asyncio

        mock_tavily_service.search.side_effect = asyncio.TimeoutError()

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/search",
            headers=superuser_token_headers,
            json={"query": "test query"},
        )

        assert response.status_code == 504
        data = response.json()
        assert data["error_code"] == "request_timeout"

    def test_search_api_key_error(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test search with API key error returns 401."""
        mock_tavily_service.search.side_effect = Exception("invalid api key")

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/search",
            headers=superuser_token_headers,
            json={"query": "test query"},
        )

        assert response.status_code == 401
        data = response.json()
        assert data["error_code"] == "invalid_api_key"

    def test_search_generic_api_error(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test search with generic exception returns 500."""
        mock_tavily_service.search.side_effect = Exception("something went wrong")

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/search",
            headers=superuser_token_headers,
            json={"query": "test query"},
        )

        assert response.status_code == 500
        data = response.json()
        assert data["error_code"] == "tavily_api_error"


# =============================================================================
# Extract Endpoint Tests
# =============================================================================


class TestExtractEndpoint:
    """Tests for POST /tavily/extract endpoint."""

    def test_extract_single_url_success(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test successful single URL extraction."""
        url = "https://example.com/article"
        mock_response = create_mock_extract_response(url)
        mock_tavily_service.extract.return_value = mock_response

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/extract",
            headers=superuser_token_headers,
            json={"urls": url},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 1
        assert data["results"][0]["url"] == url
        assert "raw_content" in data["results"][0]
        mock_tavily_service.extract.assert_called_once()

    def test_extract_batch_urls_success(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test successful batch URL extraction."""
        urls = [
            "https://example1.com/page",
            "https://example2.com/page",
            "https://example3.com/page",
        ]
        mock_response = create_mock_extract_response(urls)
        mock_tavily_service.extract.return_value = mock_response

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/extract",
            headers=superuser_token_headers,
            json={"urls": urls},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 3
        assert data["failed_results"] == []

    def test_extract_unauthenticated(
        self,
        client_with_mock_tavily: TestClient,
    ) -> None:
        """Test extract without auth headers returns 401."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/extract",
            json={"urls": "https://example.com"},
        )

        assert response.status_code == 401

    def test_extract_invalid_url_format(
        self,
        client_with_mock_tavily: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test extract with invalid URL format returns 422."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/extract",
            headers=superuser_token_headers,
            json={"urls": "not-a-valid-url"},
        )

        assert response.status_code == 422

    def test_extract_empty_url(
        self,
        client_with_mock_tavily: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test extract with empty URL returns 422."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/extract",
            headers=superuser_token_headers,
            json={"urls": ""},
        )

        assert response.status_code == 422

    def test_extract_empty_url_list(
        self,
        client_with_mock_tavily: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test extract with empty URL list returns 422."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/extract",
            headers=superuser_token_headers,
            json={"urls": []},
        )

        assert response.status_code == 422

    def test_extract_invalid_url_in_list(
        self,
        client_with_mock_tavily: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test extract with invalid URL in list returns 422."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/extract",
            headers=superuser_token_headers,
            json={"urls": ["https://valid.com", "invalid-url"]},
        )

        assert response.status_code == 422

    def test_extract_api_error(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test extract with API error returns 500."""
        mock_tavily_service.extract.side_effect = Exception("extraction failed")

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/extract",
            headers=superuser_token_headers,
            json={"urls": "https://example.com"},
        )

        assert response.status_code == 500
        data = response.json()
        assert data["error_code"] == "tavily_api_error"


# =============================================================================
# Crawl Endpoint Tests
# =============================================================================


class TestCrawlEndpoint:
    """Tests for POST /tavily/crawl endpoint."""

    def test_crawl_success(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test successful crawl request returns CrawlResponse."""
        url = "https://example.com"
        mock_response = create_mock_crawl_response(url=url, num_pages=5)
        mock_tavily_service.crawl.return_value = mock_response

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/crawl",
            headers=superuser_token_headers,
            json={"url": url},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["base_url"] == url
        assert len(data["results"]) == 5
        assert data["total_pages"] == 5
        mock_tavily_service.crawl.assert_called_once()

    def test_crawl_with_options(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test crawl with additional options."""
        url = "https://docs.example.com"
        mock_response = create_mock_crawl_response(url=url, num_pages=10)
        mock_tavily_service.crawl.return_value = mock_response

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/crawl",
            headers=superuser_token_headers,
            json={
                "url": url,
                "max_depth": 3,
                "max_breadth": 50,
                "limit": 100,
                "instructions": "Focus on API documentation",
                "select_paths": ["/api/", "/docs/"],
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["base_url"] == url

    def test_crawl_unauthenticated(
        self,
        client_with_mock_tavily: TestClient,
    ) -> None:
        """Test crawl without auth headers returns 401."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/crawl",
            json={"url": "https://example.com"},
        )

        assert response.status_code == 401

    def test_crawl_invalid_url_format(
        self,
        client_with_mock_tavily: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test crawl with invalid URL format returns 422."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/crawl",
            headers=superuser_token_headers,
            json={"url": "not-a-valid-url"},
        )

        assert response.status_code == 422

    def test_crawl_empty_url(
        self,
        client_with_mock_tavily: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test crawl with empty URL returns 422."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/crawl",
            headers=superuser_token_headers,
            json={"url": ""},
        )

        assert response.status_code == 422

    def test_crawl_api_error(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test crawl with API error returns 500."""
        mock_tavily_service.crawl.side_effect = Exception("crawl failed")

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/crawl",
            headers=superuser_token_headers,
            json={"url": "https://example.com"},
        )

        assert response.status_code == 500
        data = response.json()
        assert data["error_code"] == "tavily_api_error"

    def test_crawl_rate_limit_error(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test crawl with rate limit error returns 429."""
        mock_tavily_service.crawl.side_effect = Exception("rate limit exceeded")

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/crawl",
            headers=superuser_token_headers,
            json={"url": "https://example.com"},
        )

        assert response.status_code == 429
        data = response.json()
        assert data["error_code"] == "rate_limit_exceeded"


# =============================================================================
# Map Endpoint Tests
# =============================================================================


class TestMapEndpoint:
    """Tests for POST /tavily/map endpoint."""

    def test_map_success(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test successful map request returns MapResponse."""
        url = "https://example.com"
        mock_response = create_mock_map_response(url=url, num_urls=10)
        mock_tavily_service.map_urls.return_value = mock_response

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/map",
            headers=superuser_token_headers,
            json={"url": url},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["base_url"] == url
        assert len(data["urls"]) == 10
        assert data["total_urls"] == 10
        mock_tavily_service.map_urls.assert_called_once()

    def test_map_with_options(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test map with additional options."""
        url = "https://docs.example.com"
        mock_response = create_mock_map_response(url=url, num_urls=50)
        mock_tavily_service.map_urls.return_value = mock_response

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/map",
            headers=superuser_token_headers,
            json={
                "url": url,
                "max_depth": 2,
                "max_breadth": 30,
                "limit": 200,
                "instructions": "Find all product pages",
                "select_paths": ["/products/"],
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["base_url"] == url

    def test_map_unauthenticated(
        self,
        client_with_mock_tavily: TestClient,
    ) -> None:
        """Test map without auth headers returns 401."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/map",
            json={"url": "https://example.com"},
        )

        assert response.status_code == 401

    def test_map_invalid_url_format(
        self,
        client_with_mock_tavily: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test map with invalid URL format returns 422."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/map",
            headers=superuser_token_headers,
            json={"url": "not-a-valid-url"},
        )

        assert response.status_code == 422

    def test_map_empty_url(
        self,
        client_with_mock_tavily: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test map with empty URL returns 422."""
        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/map",
            headers=superuser_token_headers,
            json={"url": ""},
        )

        assert response.status_code == 422

    def test_map_api_error(
        self,
        client_with_mock_tavily: TestClient,
        mock_tavily_service: MagicMock,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Test map with API error returns 500."""
        mock_tavily_service.map_urls.side_effect = Exception("mapping failed")

        response = client_with_mock_tavily.post(
            f"{settings.API_V1_STR}/tavily/map",
            headers=superuser_token_headers,
            json={"url": "https://example.com"},
        )

        assert response.status_code == 500
        data = response.json()
        assert data["error_code"] == "tavily_api_error"


# =============================================================================
# Integration Tests
# =============================================================================


class TestTavilyIntegration:
    """Integration tests with real Tavily API.

    These tests are marked with @pytest.mark.integration and require
    a valid TAVILY_API_KEY environment variable.
    Run with: pytest -m integration
    """

    @pytest.mark.integration
    def test_integration_search_real_api(
        self,
        client: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Integration test: Real search with simple query."""
        import os

        if not os.environ.get("TAVILY_API_KEY"):
            pytest.skip("TAVILY_API_KEY not set")

        response = client.post(
            f"{settings.API_V1_STR}/tavily/search",
            headers=superuser_token_headers,
            json={"query": "python programming language", "max_results": 3},
        )

        assert response.status_code == 200
        data = response.json()
        assert "query" in data
        assert "results" in data
        assert len(data["results"]) <= 3

    @pytest.mark.integration
    def test_integration_extract_real_api(
        self,
        client: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Integration test: Real extraction from known URL."""
        import os

        if not os.environ.get("TAVILY_API_KEY"):
            pytest.skip("TAVILY_API_KEY not set")

        response = client.post(
            f"{settings.API_V1_STR}/tavily/extract",
            headers=superuser_token_headers,
            json={"urls": "https://httpbin.org/html"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "results" in data

    @pytest.mark.integration
    def test_integration_crawl_real_api(
        self,
        client: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Integration test: Real crawl of a simple site."""
        import os

        if not os.environ.get("TAVILY_API_KEY"):
            pytest.skip("TAVILY_API_KEY not set")

        response = client.post(
            f"{settings.API_V1_STR}/tavily/crawl",
            headers=superuser_token_headers,
            json={"url": "https://httpbin.org", "max_depth": 1, "limit": 5},
        )

        assert response.status_code == 200
        data = response.json()
        assert "base_url" in data
        assert "results" in data

    @pytest.mark.integration
    def test_integration_map_real_api(
        self,
        client: TestClient,
        superuser_token_headers: dict[str, str],
    ) -> None:
        """Integration test: Real URL mapping of a simple site."""
        import os

        if not os.environ.get("TAVILY_API_KEY"):
            pytest.skip("TAVILY_API_KEY not set")

        response = client.post(
            f"{settings.API_V1_STR}/tavily/map",
            headers=superuser_token_headers,
            json={"url": "https://httpbin.org", "max_depth": 1, "limit": 10},
        )

        assert response.status_code == 200
        data = response.json()
        assert "base_url" in data
        assert "urls" in data
