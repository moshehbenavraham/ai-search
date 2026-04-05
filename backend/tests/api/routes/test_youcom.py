from collections.abc import Generator
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_youcom_service
from app.core.config import settings
from app.main import app


@pytest.fixture
def mock_youcom_service() -> MagicMock:
    service = MagicMock()
    service.deep_research = AsyncMock()
    return service


@pytest.fixture
def client_with_mock_youcom(
    mock_youcom_service: MagicMock,
) -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_youcom_service] = lambda: mock_youcom_service
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def test_youcom_deep_research_requires_auth(
    client_with_mock_youcom: TestClient,
) -> None:
    response = client_with_mock_youcom.post(
        f"{settings.API_V1_STR}/youcom/deep-research",
        json={"query": "test query"},
    )

    assert response.status_code == 401


def test_youcom_deep_research_success(
    client_with_mock_youcom: TestClient,
    mock_youcom_service: MagicMock,
    superuser_token_headers: dict[str, str],
) -> None:
    mock_youcom_service.deep_research.return_value = {
        "output": {
            "content": "## Research Summary",
            "content_type": "text",
            "sources": [
                {
                    "url": "https://example.com/source",
                    "title": "Example Source",
                    "snippets": ["Evidence excerpt"],
                }
            ],
        }
    }

    response = client_with_mock_youcom.post(
        f"{settings.API_V1_STR}/youcom/deep-research",
        headers=superuser_token_headers,
        json={
            "query": "Compare open-source agent platforms",
            "research_effort": "deep",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["output"]["content"] == "## Research Summary"
    assert data["output"]["sources"][0]["url"] == "https://example.com/source"

    called_request = mock_youcom_service.deep_research.await_args.args[0]
    assert called_request.query == "Compare open-source agent platforms"
    assert called_request.research_effort == "deep"
