import asyncio
from typing import Any

import pytest

from app.core.config import settings
from app.exceptions.gemini import GeminiErrorCode
from app.schemas.gemini import GeminiDeepResearchRequest
from app.services.gemini import GeminiService


class MockResponse:
    def __init__(
        self,
        status_code: int,
        json_data: dict[str, Any] | None = None,
        text: str = "",
    ) -> None:
        self.status_code = status_code
        self._json_data = json_data or {}
        self.text = text

    def json(self) -> dict[str, Any]:
        return self._json_data


class MockAsyncClient:
    def __init__(
        self,
        response: MockResponse | None = None,
        exception: Exception | None = None,
    ) -> None:
        self.response = response
        self.exception = exception
        self.request: dict[str, Any] | None = None
        self.timeout: Any = None

    async def __aenter__(self) -> "MockAsyncClient":
        return self

    async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> bool:
        return False

    async def post(
        self,
        url: str,
        headers: dict[str, str],
        json: dict[str, Any] | None = None,
    ) -> MockResponse:
        self.request = {"method": "POST", "url": url, "headers": headers, "json": json}
        if self.exception is not None:
            raise self.exception
        if self.response is None:
            raise AssertionError("Mock response must be provided")
        return self.response


@pytest.fixture
def configured_gemini() -> GeminiService:
    original_api_key = settings.gemini.api_key
    original_timeout = settings.gemini.timeout
    original_poll_interval = settings.gemini.poll_interval
    original_max_poll_attempts = settings.gemini.max_poll_attempts

    settings.gemini.api_key = "test-gemini-key"
    settings.gemini.timeout = 123
    settings.gemini.poll_interval = 7
    settings.gemini.max_poll_attempts = 99

    try:
        yield GeminiService()
    finally:
        settings.gemini.api_key = original_api_key
        settings.gemini.timeout = original_timeout
        settings.gemini.poll_interval = original_poll_interval
        settings.gemini.max_poll_attempts = original_max_poll_attempts


def test_request_schema_trims_query() -> None:
    request = GeminiDeepResearchRequest.model_validate({"query": "  market map  "})

    assert request.query == "market map"


def test_service_builds_headers_and_payload(
    configured_gemini: GeminiService,
) -> None:
    request = GeminiDeepResearchRequest(
        query="Find recent AI coding benchmarks",
        enable_thinking_summaries=True,
        file_search_store_names=["fileSearchStores/team-research"],
        previous_interaction_id="prev-123",
    )

    assert configured_gemini._build_headers() == {
        "x-goog-api-key": "test-gemini-key",
        "Content-Type": "application/json",
    }
    assert configured_gemini._build_payload(request) == {
        "input": "Find recent AI coding benchmarks",
        "agent": "deep-research-pro-preview-12-2025",
        "background": True,
        "store": True,
        "agent_config": {
            "type": "deep-research",
            "thinking_summaries": "auto",
        },
        "tools": [
            {
                "type": "file_search",
                "file_search_store_names": ["fileSearchStores/team-research"],
            }
        ],
        "previous_interaction_id": "prev-123",
    }


def test_service_start_research_success(
    configured_gemini: GeminiService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    mock_client = MockAsyncClient(
        response=MockResponse(
            status_code=200,
            json_data={
                "id": "interaction-123",
                "status": "pending",
                "created": "2026-04-05T18:00:00Z",
            },
        )
    )

    def async_client_factory(*_: Any, **kwargs: Any) -> MockAsyncClient:
        mock_client.timeout = kwargs.get("timeout")
        return mock_client

    monkeypatch.setattr("app.services.gemini.httpx.AsyncClient", async_client_factory)

    response = asyncio.run(
        configured_gemini.start_research(
            GeminiDeepResearchRequest(
                query="State of browser agents",
                enable_thinking_summaries=True,
                file_search_store_names=["fileSearchStores/shared-store"],
            )
        )
    )

    assert response.interaction_id == "interaction-123"
    assert response.status == "pending"
    assert mock_client.request == {
        "method": "POST",
        "url": "https://generativelanguage.googleapis.com/v1beta/interactions",
        "headers": {
            "x-goog-api-key": "test-gemini-key",
            "Content-Type": "application/json",
        },
        "json": {
            "input": "State of browser agents",
            "agent": "deep-research-pro-preview-12-2025",
            "background": True,
            "store": True,
            "agent_config": {
                "type": "deep-research",
                "thinking_summaries": "auto",
            },
            "tools": [
                {
                    "type": "file_search",
                    "file_search_store_names": ["fileSearchStores/shared-store"],
                }
            ],
        },
    }


def test_service_maps_expired_api_key_from_400_body(
    configured_gemini: GeminiService,
) -> None:
    error = configured_gemini._handle_error(
        400,
        """[{
          "error": {
            "code": 400,
            "message": "API key expired. Please renew the API key.",
            "status": "INVALID_ARGUMENT",
            "details": [
              {
                "@type": "type.googleapis.com/google.rpc.ErrorInfo",
                "reason": "API_KEY_INVALID",
                "domain": "googleapis.com"
              }
            ]
          }
        }]""",
    )

    assert error.error_code == GeminiErrorCode.INVALID_API_KEY
    assert error.status_code == 401
    assert error.message == "API key expired. Please renew the API key."


def test_service_cancel_research_posts_cancel_endpoint(
    configured_gemini: GeminiService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    mock_client = MockAsyncClient(response=MockResponse(status_code=200, json_data={}))

    monkeypatch.setattr(
        "app.services.gemini.httpx.AsyncClient",
        lambda *args, **kwargs: mock_client,
    )

    asyncio.run(configured_gemini.cancel_research("interaction-456"))

    assert mock_client.request == {
        "method": "POST",
        "url": "https://generativelanguage.googleapis.com/v1beta/interactions/interaction-456/cancel",
        "headers": {
            "x-goog-api-key": "test-gemini-key",
            "Content-Type": "application/json",
        },
        "json": None,
    }
