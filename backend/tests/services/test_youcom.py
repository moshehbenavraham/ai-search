import asyncio
from typing import Any

import httpx
import pytest

from app.core.config import settings
from app.exceptions.youcom import YouComAPIError, YouComErrorCode
from app.schemas.youcom import YouComDeepResearchRequest
from app.services.youcom import YouComService


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
        json: dict[str, Any],
    ) -> MockResponse:
        self.request = {"url": url, "headers": headers, "json": json}
        if self.exception is not None:
            raise self.exception
        if self.response is None:
            raise AssertionError("Mock response must be provided")
        return self.response


@pytest.fixture
def configured_youcom() -> YouComService:
    original_api_key = settings.youcom.api_key
    original_timeout = settings.youcom.timeout

    settings.youcom.api_key = "test-youcom-key"
    settings.youcom.timeout = 123

    try:
        yield YouComService()
    finally:
        settings.youcom.api_key = original_api_key
        settings.youcom.timeout = original_timeout


def test_request_schema_trims_query_and_defaults_effort() -> None:
    request = YouComDeepResearchRequest.model_validate({"query": "  market map  "})

    assert request.query == "market map"
    assert request.research_effort == "standard"


def test_service_builds_headers_and_payload(
    configured_youcom: YouComService,
) -> None:
    request = YouComDeepResearchRequest(
        query="Find recent AI coding benchmarks",
        research_effort="deep",
    )

    assert configured_youcom._build_headers() == {
        "X-API-Key": "test-youcom-key",
        "Content-Type": "application/json",
    }
    assert configured_youcom._build_payload(request) == {
        "input": "Find recent AI coding benchmarks",
        "research_effort": "deep",
    }


def test_service_deep_research_success(
    configured_youcom: YouComService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    mock_client = MockAsyncClient(
        response=MockResponse(
            status_code=200,
            json_data={
                "output": {
                    "content": "# Report",
                    "content_type": "text",
                    "sources": [
                        {
                            "url": "https://example.com/source",
                            "title": "Example Source",
                            "snippets": ["Key citation"],
                        }
                    ],
                }
            },
        )
    )

    def async_client_factory(*_: Any, **kwargs: Any) -> MockAsyncClient:
        mock_client.timeout = kwargs.get("timeout")
        return mock_client

    monkeypatch.setattr("app.services.youcom.httpx.AsyncClient", async_client_factory)

    response = asyncio.run(
        configured_youcom.deep_research(
            YouComDeepResearchRequest(query="State of browser agents")
        )
    )

    assert response.output.content == "# Report"
    assert response.output.sources[0].url == "https://example.com/source"
    assert mock_client.request == {
        "url": "https://api.you.com/v1/research",
        "headers": {
            "X-API-Key": "test-youcom-key",
            "Content-Type": "application/json",
        },
        "json": {
            "input": "State of browser agents",
            "research_effort": "standard",
        },
    }


@pytest.mark.parametrize(
    ("status_code", "expected_code"),
    [
        (400, YouComErrorCode.INVALID_REQUEST),
        (401, YouComErrorCode.INVALID_API_KEY),
        (429, YouComErrorCode.RATE_LIMIT_EXCEEDED),
    ],
)
def test_service_maps_http_status_errors(
    configured_youcom: YouComService,
    monkeypatch: pytest.MonkeyPatch,
    status_code: int,
    expected_code: YouComErrorCode,
) -> None:
    mock_client = MockAsyncClient(
        response=MockResponse(status_code=status_code, text="upstream failure")
    )

    monkeypatch.setattr(
        "app.services.youcom.httpx.AsyncClient",
        lambda *args, **kwargs: mock_client,
    )

    with pytest.raises(YouComAPIError) as exc_info:
        asyncio.run(
            configured_youcom.deep_research(
                YouComDeepResearchRequest(query="Compare agent frameworks")
            )
        )

    assert exc_info.value.error_code == expected_code
    assert exc_info.value.details == {"response_body": "upstream failure"}


def test_service_maps_timeout_errors(
    configured_youcom: YouComService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    request = httpx.Request("POST", "https://api.you.com/v1/research")
    mock_client = MockAsyncClient(
        exception=httpx.ReadTimeout("timed out", request=request)
    )

    monkeypatch.setattr(
        "app.services.youcom.httpx.AsyncClient",
        lambda *args, **kwargs: mock_client,
    )

    with pytest.raises(YouComAPIError) as exc_info:
        asyncio.run(
            configured_youcom.deep_research(
                YouComDeepResearchRequest(query="Long-running research")
            )
        )

    assert exc_info.value.error_code == YouComErrorCode.REQUEST_TIMEOUT
    assert exc_info.value.status_code == 504


def test_service_maps_unexpected_http_errors(
    configured_youcom: YouComService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    request = httpx.Request("POST", "https://api.you.com/v1/research")
    mock_client = MockAsyncClient(
        exception=httpx.ConnectError("boom", request=request)
    )

    monkeypatch.setattr(
        "app.services.youcom.httpx.AsyncClient",
        lambda *args, **kwargs: mock_client,
    )

    with pytest.raises(YouComAPIError) as exc_info:
        asyncio.run(
            configured_youcom.deep_research(
                YouComDeepResearchRequest(query="Connectivity check")
            )
        )

    assert exc_info.value.error_code == YouComErrorCode.YOUCOM_API_ERROR
    assert exc_info.value.status_code == 500
