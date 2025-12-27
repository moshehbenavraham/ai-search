"""Perplexity Sonar API service layer.

This module provides the PerplexityService class which encapsulates all interactions
with the Perplexity Sonar API for deep research queries. It uses httpx AsyncClient
for HTTP requests with Bearer token authentication.

Usage:
    from app.services.perplexity import PerplexityService

    service = PerplexityService()
    result = await service.deep_research(request)
"""

from typing import Any

import httpx

from app.core.config import settings
from app.exceptions.perplexity import PerplexityAPIError
from app.schemas.perplexity import (
    PerplexityDeepResearchRequest,
    PerplexityDeepResearchResponse,
)


class PerplexityService:
    """Service layer for Perplexity Sonar API operations.

    This class provides async methods for interacting with the Perplexity API
    for deep research queries. Unlike TavilyService which uses an SDK, this
    service uses raw httpx calls since no official Perplexity Python SDK exists.

    The service reads configuration from settings.perplexity and handles:
    - Bearer token authentication
    - Request payload formatting with web_search_options nesting
    - Response parsing and error mapping
    - 300-second timeout for deep research queries

    Attributes:
        BASE_URL: The Perplexity API base URL for chat completions.
        _api_key: The API key for authentication.
        _timeout: Request timeout in seconds.
        _default_model: Default model for requests.
    """

    BASE_URL: str = "https://api.perplexity.ai/chat/completions"

    def __init__(self) -> None:
        """Initialize PerplexityService with configuration from settings.

        Reads configuration from settings.perplexity:
        - api_key: Optional Perplexity API key
        - timeout: Request timeout in seconds (default: 300)
        - default_model: Default model for research queries

        Raises:
            PerplexityAPIError: If API key is not configured.
        """
        perplexity_settings = settings.perplexity

        if not perplexity_settings.api_key:
            raise PerplexityAPIError.invalid_api_key(
                message="Perplexity API key is not configured."
            )

        self._api_key: str = perplexity_settings.api_key
        self._timeout: int = perplexity_settings.timeout
        self._default_model: str = perplexity_settings.default_model.value

    def _build_headers(self) -> dict[str, str]:
        """Build HTTP headers for Perplexity API requests.

        Returns:
            Dictionary containing Authorization and Content-Type headers.
        """
        return {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

    def _build_payload(
        self,
        request: PerplexityDeepResearchRequest,
    ) -> dict[str, Any]:
        """Build API request payload from request schema.

        Converts the flat request schema to the nested format expected by
        the Perplexity API, including the messages array structure and
        web_search_options nesting for search parameters.

        Args:
            request: The deep research request with query and parameters.

        Returns:
            Dictionary formatted for the Perplexity API.
        """
        # Build messages array with user query
        messages: list[dict[str, str]] = [
            {"role": "user", "content": request.query}
        ]

        # Add system prompt if provided
        if request.system_prompt:
            messages.insert(0, {"role": "system", "content": request.system_prompt})

        # Start with required fields
        payload: dict[str, Any] = {
            "model": request.model or self._default_model,
            "messages": messages,
        }

        # Add optional generation parameters
        if request.max_tokens is not None:
            payload["max_tokens"] = request.max_tokens
        if request.temperature is not None:
            payload["temperature"] = request.temperature
        if request.top_p is not None:
            payload["top_p"] = request.top_p
        if request.top_k is not None:
            payload["top_k"] = request.top_k
        if request.presence_penalty is not None:
            payload["presence_penalty"] = request.presence_penalty
        if request.frequency_penalty is not None:
            payload["frequency_penalty"] = request.frequency_penalty

        # Add reasoning effort for reasoning models
        if request.reasoning_effort is not None:
            payload["reasoning_effort"] = request.reasoning_effort.value

        # Add search context size
        if request.search_context_size is not None:
            payload["search_context_size"] = request.search_context_size.value

        # Add output options
        if request.return_images:
            payload["return_images"] = request.return_images
        if request.return_related_questions:
            payload["return_related_questions"] = request.return_related_questions

        # Add stream option
        if request.stream:
            payload["stream"] = request.stream

        # Build web_search_options for search parameters
        web_search_options: dict[str, Any] = {}

        if request.search_mode is not None:
            web_search_options["search_mode"] = request.search_mode.value
        if request.search_recency_filter is not None:
            web_search_options["search_recency_filter"] = (
                request.search_recency_filter.value
            )
        if request.search_domain_filter is not None:
            web_search_options["search_domain_filter"] = request.search_domain_filter
        if request.search_after_date_filter is not None:
            web_search_options["search_after_date_filter"] = (
                request.search_after_date_filter
            )
        if request.search_before_date_filter is not None:
            web_search_options["search_before_date_filter"] = (
                request.search_before_date_filter
            )

        # Only add web_search_options if it has content
        if web_search_options:
            payload["web_search_options"] = web_search_options

        return payload

    def _parse_response(
        self,
        response_data: dict[str, Any],
    ) -> PerplexityDeepResearchResponse:
        """Parse API response into response schema.

        Extracts the response content from the API response structure
        and validates it against the response schema.

        Args:
            response_data: Raw response dictionary from the API.

        Returns:
            Validated PerplexityDeepResearchResponse.

        Raises:
            PerplexityAPIError: If response format is unexpected.
        """
        try:
            return PerplexityDeepResearchResponse.model_validate(response_data)
        except Exception as exc:
            raise PerplexityAPIError.api_error(
                message="Failed to parse Perplexity API response.",
                details={"original_error": str(exc)},
            ) from exc

    def _handle_error(
        self,
        status_code: int,
        response_body: str | None = None,
    ) -> PerplexityAPIError:
        """Map HTTP status codes to PerplexityAPIError subtypes.

        Args:
            status_code: HTTP status code from the response.
            response_body: Optional response body for error details.

        Returns:
            Appropriate PerplexityAPIError subtype.
        """
        details: dict[str, Any] | None = None
        if response_body:
            details = {"response_body": response_body}

        if status_code == 401:
            return PerplexityAPIError.invalid_api_key(details=details)
        elif status_code == 429:
            return PerplexityAPIError.rate_limit_exceeded(details=details)
        elif status_code == 403:
            return PerplexityAPIError.content_filter(details=details)
        elif status_code == 400:
            return PerplexityAPIError.invalid_request(
                message=f"Invalid request: {response_body or 'Bad Request'}",
                details=details,
            )
        else:
            return PerplexityAPIError.api_error(
                message=f"Perplexity API error (HTTP {status_code})",
                details=details,
            )

    async def deep_research(
        self,
        request: PerplexityDeepResearchRequest,
    ) -> PerplexityDeepResearchResponse:
        """Execute a deep research query against the Perplexity Sonar API.

        Makes a POST request to the Perplexity chat completions endpoint
        with the provided query and parameters. Handles authentication,
        timeout, and error mapping.

        Args:
            request: Deep research request with query and optional parameters.

        Returns:
            PerplexityDeepResearchResponse with model response and citations.

        Raises:
            PerplexityAPIError: If the API request fails for any reason.
        """
        headers = self._build_headers()
        payload = self._build_payload(request)

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(self._timeout)
            ) as client:
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

                response_data = response.json()
                return self._parse_response(response_data)

        except PerplexityAPIError:
            # Re-raise our own exceptions
            raise
        except httpx.TimeoutException as exc:
            raise PerplexityAPIError.request_timeout(
                message=f"Request timed out after {self._timeout} seconds.",
                details={"original_error": str(exc)},
            ) from exc
        except httpx.HTTPError as exc:
            raise PerplexityAPIError.api_error(
                message="HTTP error occurred while communicating with Perplexity API.",
                details={"original_error": str(exc)},
            ) from exc
        except Exception as exc:
            raise PerplexityAPIError.api_error(
                message="Unexpected error occurred.",
                details={"original_error": str(exc)},
            ) from exc
