"""You.com Research API service layer."""

from typing import Any

import httpx

from app.core.config import settings
from app.exceptions.youcom import YouComAPIError
from app.schemas.youcom import YouComDeepResearchRequest, YouComDeepResearchResponse


class YouComService:
    """Service layer for synchronous You.com research queries."""

    BASE_URL: str = "https://api.you.com/v1/research"

    def __init__(self) -> None:
        youcom_settings = settings.youcom

        if not youcom_settings.api_key:
            raise YouComAPIError.invalid_api_key(
                message="You.com API key is not configured."
            )

        self._api_key: str = youcom_settings.api_key
        self._timeout: int = youcom_settings.timeout

    def _build_headers(self) -> dict[str, str]:
        return {
            "X-API-Key": self._api_key,
            "Content-Type": "application/json",
        }

    def _build_payload(
        self,
        request: YouComDeepResearchRequest,
    ) -> dict[str, Any]:
        return {
            "input": request.query,
            "research_effort": request.research_effort.value,
        }

    def _parse_response(
        self,
        response_data: dict[str, Any],
    ) -> YouComDeepResearchResponse:
        try:
            return YouComDeepResearchResponse.model_validate(response_data)
        except Exception as exc:
            raise YouComAPIError.api_error(
                message="Failed to parse You.com API response.",
                details={"original_error": str(exc)},
            ) from exc

    def _handle_error(
        self,
        status_code: int,
        response_body: str | None = None,
    ) -> YouComAPIError:
        details: dict[str, Any] | None = None
        if response_body:
            details = {"response_body": response_body}

        if status_code == 401:
            return YouComAPIError.invalid_api_key(details=details)
        if status_code == 429:
            return YouComAPIError.rate_limit_exceeded(details=details)
        if status_code == 400:
            return YouComAPIError.invalid_request(
                message=f"Invalid request: {response_body or 'Bad Request'}",
                details=details,
            )

        return YouComAPIError.api_error(
            message=f"You.com API error (HTTP {status_code})",
            details=details,
        )

    async def deep_research(
        self,
        request: YouComDeepResearchRequest,
    ) -> YouComDeepResearchResponse:
        headers = self._build_headers()
        payload = self._build_payload(request)

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(self._timeout)) as client:
                response = await client.post(
                    self.BASE_URL,
                    headers=headers,
                    json=payload,
                )

                if response.status_code != 200:
                    raise self._handle_error(
                        status_code=response.status_code,
                        response_body=response.text,
                    )

                return self._parse_response(response.json())

        except YouComAPIError:
            raise
        except httpx.TimeoutException as exc:
            raise YouComAPIError.request_timeout(
                message=f"Request timed out after {self._timeout} seconds.",
                details={"original_error": str(exc)},
            ) from exc
        except httpx.HTTPError as exc:
            raise YouComAPIError.api_error(
                message="HTTP error occurred while communicating with You.com API.",
                details={"original_error": str(exc)},
            ) from exc
        except Exception as exc:
            raise YouComAPIError.api_error(
                message="Unexpected error occurred.",
                details={"original_error": str(exc)},
            ) from exc
