"""Google Gemini Deep Research API service layer.

This module provides the GeminiService class which encapsulates all interactions
with the Google Gemini Deep Research API. Unlike Perplexity's synchronous model,
Gemini uses an asynchronous polling workflow where clients submit a research job,
receive an interaction ID, and then poll for status updates until completion.

Research jobs can run for extended periods (typically 20 minutes, up to 60 minutes).
The service handles authentication via x-goog-api-key headers, request payload
construction with agent configuration, and error mapping to typed exceptions.

Usage:
    from app.services.gemini import GeminiService

    service = GeminiService()
    job = await service.start_research(request)
    result = await service.wait_for_completion(job.interaction_id)
"""

import asyncio
from typing import Any

import httpx

from app.core.config import settings
from app.exceptions.gemini import GeminiAPIError
from app.schemas.gemini import (
    GeminiDeepResearchJobResponse,
    GeminiDeepResearchRequest,
    GeminiDeepResearchResultResponse,
    GeminiInteractionStatus,
)


class GeminiService:
    """Service layer for Google Gemini Deep Research API operations.

    This class provides async methods for interacting with the Gemini API
    for deep research queries. Unlike PerplexityService which is synchronous,
    this service uses a polling workflow for long-running research jobs.

    The service reads configuration from settings.gemini and handles:
    - x-goog-api-key header authentication
    - Request payload formatting with agent_config structure
    - Response parsing for job creation and polling
    - Polling loop with configurable interval and max attempts
    - Error mapping from HTTP status codes to typed exceptions

    Attributes:
        BASE_URL: The Gemini API v1beta base URL.
        _api_key: The API key for authentication.
        _timeout: Request timeout in seconds.
        _poll_interval: Polling interval in seconds.
        _max_poll_attempts: Maximum number of polling attempts.
    """

    BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta"

    def __init__(self) -> None:
        """Initialize GeminiService with configuration from settings.

        Reads configuration from settings.gemini:
        - api_key: Optional Gemini API key
        - timeout: Request timeout in seconds (default: 120)
        - poll_interval: Polling interval in seconds (default: 10)
        - max_poll_attempts: Maximum polling attempts (default: 360)

        Raises:
            GeminiAPIError: If API key is not configured.
        """
        gemini_settings = settings.gemini

        if not gemini_settings.api_key:
            raise GeminiAPIError.invalid_api_key(
                message="Gemini API key is not configured."
            )

        self._api_key: str = gemini_settings.api_key
        self._timeout: int = gemini_settings.timeout
        self._poll_interval: int = gemini_settings.poll_interval
        self._max_poll_attempts: int = gemini_settings.max_poll_attempts

    def _build_headers(self) -> dict[str, str]:
        """Build HTTP headers for Gemini API requests.

        Gemini uses x-goog-api-key header for authentication instead of
        Bearer token like Perplexity.

        Returns:
            Dictionary containing x-goog-api-key and Content-Type headers.
        """
        return {
            "x-goog-api-key": self._api_key,
            "Content-Type": "application/json",
        }

    def _handle_error(
        self,
        status_code: int,
        response_body: str | None = None,
    ) -> GeminiAPIError:
        """Map HTTP status codes to GeminiAPIError subtypes.

        Args:
            status_code: HTTP status code from the response.
            response_body: Optional response body for error details.

        Returns:
            Appropriate GeminiAPIError subtype.
        """
        details: dict[str, Any] | None = None
        if response_body:
            details = {"response_body": response_body}

        if status_code == 401:
            return GeminiAPIError.invalid_api_key(details=details)
        elif status_code == 404:
            return GeminiAPIError.interaction_not_found(details=details)
        elif status_code == 429:
            return GeminiAPIError.rate_limit_exceeded(details=details)
        elif status_code == 400:
            return GeminiAPIError.invalid_request(
                message=f"Invalid request: {response_body or 'Bad Request'}",
                details=details,
            )
        else:
            return GeminiAPIError.api_error(
                message=f"Gemini API error (HTTP {status_code})",
                details=details,
            )

    def _build_payload(
        self,
        request: GeminiDeepResearchRequest,
    ) -> dict[str, Any]:
        """Build API request payload from request schema.

        Constructs the payload structure required by Gemini API including
        the agent_config with type and agent specification for deep research.

        Args:
            request: The deep research request with query and parameters.

        Returns:
            Dictionary formatted for the Gemini API interactions endpoint.
        """
        payload: dict[str, Any] = {
            "query": request.query,
            "agent_config": {
                "type": "deep-research",
                "agent": "deep-research-pro-preview-12-2025",
            },
            "background": True,
            "store": True,
        }

        # Add optional parameters
        if request.enable_thinking_summaries:
            payload["enable_thinking_summaries"] = request.enable_thinking_summaries

        if request.file_search_store_names:
            payload["file_search_store_names"] = request.file_search_store_names

        if request.previous_interaction_id:
            payload["previous_interaction_id"] = request.previous_interaction_id

        return payload

    def _parse_job_response(
        self,
        response_data: dict[str, Any],
    ) -> GeminiDeepResearchJobResponse:
        """Parse API response into job creation response schema.

        Validates the response from the interactions POST endpoint
        against the job response schema.

        Args:
            response_data: Raw response dictionary from the API.

        Returns:
            Validated GeminiDeepResearchJobResponse.

        Raises:
            GeminiAPIError: If response format is unexpected.
        """
        try:
            return GeminiDeepResearchJobResponse.model_validate(response_data)
        except Exception as exc:
            raise GeminiAPIError.api_error(
                message="Failed to parse Gemini job creation response.",
                details={"original_error": str(exc)},
            ) from exc

    def _parse_poll_response(
        self,
        response_data: dict[str, Any],
    ) -> GeminiDeepResearchResultResponse:
        """Parse API response into poll result response schema.

        Validates the response from the interactions GET endpoint
        against the result response schema.

        Args:
            response_data: Raw response dictionary from the API.

        Returns:
            Validated GeminiDeepResearchResultResponse.

        Raises:
            GeminiAPIError: If response format is unexpected.
        """
        try:
            return GeminiDeepResearchResultResponse.model_validate(response_data)
        except Exception as exc:
            raise GeminiAPIError.api_error(
                message="Failed to parse Gemini poll response.",
                details={"original_error": str(exc)},
            ) from exc

    def _is_terminal_status(self, status: GeminiInteractionStatus) -> bool:
        """Check if the interaction status is terminal.

        Terminal statuses indicate the job has finished processing
        and no further polling is needed.

        Args:
            status: The current interaction status.

        Returns:
            True if status is completed, failed, or cancelled.
        """
        return status in (
            GeminiInteractionStatus.COMPLETED,
            GeminiInteractionStatus.FAILED,
            GeminiInteractionStatus.CANCELLED,
        )

    async def start_research(
        self,
        request: GeminiDeepResearchRequest,
    ) -> GeminiDeepResearchJobResponse:
        """Start a new deep research job.

        Makes a POST request to the Gemini interactions endpoint to create
        a new background research job. Returns immediately with an interaction
        ID that can be used for polling.

        Args:
            request: Deep research request with query and optional parameters.

        Returns:
            GeminiDeepResearchJobResponse with interaction_id and initial status.

        Raises:
            GeminiAPIError: If the API request fails for any reason.
        """
        headers = self._build_headers()
        payload = self._build_payload(request)
        url = f"{self.BASE_URL}/interactions"

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(self._timeout)
            ) as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json=payload,
                )

                if response.status_code != 200:
                    raise self._handle_error(
                        status_code=response.status_code,
                        response_body=response.text,
                    )

                response_data = response.json()
                return self._parse_job_response(response_data)

        except GeminiAPIError:
            # Re-raise our own exceptions
            raise
        except httpx.TimeoutException as exc:
            raise GeminiAPIError.request_timeout(
                message=f"Request timed out after {self._timeout} seconds.",
                details={"original_error": str(exc)},
            ) from exc
        except httpx.HTTPError as exc:
            raise GeminiAPIError.api_error(
                message="HTTP error occurred while communicating with Gemini API.",
                details={"original_error": str(exc)},
            ) from exc
        except Exception as exc:
            raise GeminiAPIError.api_error(
                message="Unexpected error occurred.",
                details={"original_error": str(exc)},
            ) from exc

    async def poll_research(
        self,
        interaction_id: str,
        last_event_id: str | None = None,
    ) -> GeminiDeepResearchResultResponse:
        """Poll for deep research job status and results.

        Makes a GET request to retrieve the current status and any available
        outputs from a running research job. The last_event_id parameter
        enables reconnection after network interruption.

        Args:
            interaction_id: The interaction ID from job creation.
            last_event_id: Optional ID of last received event for reconnection.

        Returns:
            GeminiDeepResearchResultResponse with current status and outputs.

        Raises:
            GeminiAPIError: If the API request fails for any reason.
        """
        headers = self._build_headers()
        url = f"{self.BASE_URL}/interactions/{interaction_id}"

        # Add last_event_id as query parameter if provided
        params: dict[str, str] = {}
        if last_event_id:
            params["last_event_id"] = last_event_id

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(self._timeout)
            ) as client:
                response = await client.get(
                    url,
                    headers=headers,
                    params=params if params else None,
                )

                if response.status_code != 200:
                    raise self._handle_error(
                        status_code=response.status_code,
                        response_body=response.text,
                    )

                response_data = response.json()
                return self._parse_poll_response(response_data)

        except GeminiAPIError:
            # Re-raise our own exceptions
            raise
        except httpx.TimeoutException as exc:
            raise GeminiAPIError.request_timeout(
                message=f"Poll request timed out after {self._timeout} seconds.",
                details={"original_error": str(exc)},
            ) from exc
        except httpx.HTTPError as exc:
            raise GeminiAPIError.api_error(
                message="HTTP error occurred while polling Gemini API.",
                details={"original_error": str(exc)},
            ) from exc
        except Exception as exc:
            raise GeminiAPIError.api_error(
                message="Unexpected error occurred during polling.",
                details={"original_error": str(exc)},
            ) from exc

    async def wait_for_completion(
        self,
        interaction_id: str,
        poll_interval: int | None = None,
        max_attempts: int | None = None,
    ) -> GeminiDeepResearchResultResponse:
        """Wait for a deep research job to complete.

        Polls the job status at regular intervals until a terminal status
        is reached (completed, failed, or cancelled) or the maximum number
        of polling attempts is exceeded.

        Args:
            interaction_id: The interaction ID from job creation.
            poll_interval: Optional override for polling interval in seconds.
            max_attempts: Optional override for maximum polling attempts.

        Returns:
            GeminiDeepResearchResultResponse with final status and results.

        Raises:
            GeminiAPIError: If polling fails, max attempts exceeded, or job failed.
        """
        interval = poll_interval or self._poll_interval
        attempts = max_attempts or self._max_poll_attempts

        last_event_id: str | None = None

        for _attempt in range(attempts):
            result = await self.poll_research(
                interaction_id=interaction_id,
                last_event_id=last_event_id,
            )

            # Update last_event_id for potential reconnection
            if result.event_id:
                last_event_id = result.event_id

            # Check for terminal status
            if self._is_terminal_status(result.status):
                # Handle failure status
                if result.status == GeminiInteractionStatus.FAILED:
                    raise GeminiAPIError.research_failed(
                        message=result.error_message
                        or "Deep research job failed.",
                        details={"interaction_id": interaction_id},
                    )

                # Handle cancelled status
                if result.status == GeminiInteractionStatus.CANCELLED:
                    raise GeminiAPIError.api_error(
                        message="Deep research job was cancelled.",
                        details={"interaction_id": interaction_id},
                    )

                # Return completed result
                return result

            # Wait before next poll
            await asyncio.sleep(interval)

        # Max attempts exceeded
        raise GeminiAPIError.max_polls_exceeded(
            message=f"Maximum polling attempts ({attempts}) exceeded.",
            details={
                "interaction_id": interaction_id,
                "attempts": attempts,
                "poll_interval": interval,
            },
        )

    async def cancel_research(
        self,
        interaction_id: str,
    ) -> None:
        """Cancel a running deep research job.

        Makes a DELETE request to terminate a running research job.
        Returns successfully if the job was cancelled or was already
        in a terminal state.

        Args:
            interaction_id: The interaction ID of the job to cancel.

        Raises:
            GeminiAPIError: If the cancellation request fails.
        """
        headers = self._build_headers()
        url = f"{self.BASE_URL}/interactions/{interaction_id}"

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(self._timeout)
            ) as client:
                response = await client.delete(
                    url,
                    headers=headers,
                )

                # 204 No Content is expected on success
                if response.status_code not in (200, 204):
                    raise self._handle_error(
                        status_code=response.status_code,
                        response_body=response.text,
                    )

        except GeminiAPIError:
            # Re-raise our own exceptions
            raise
        except httpx.TimeoutException as exc:
            raise GeminiAPIError.request_timeout(
                message=f"Cancel request timed out after {self._timeout} seconds.",
                details={"original_error": str(exc)},
            ) from exc
        except httpx.HTTPError as exc:
            raise GeminiAPIError.api_error(
                message="HTTP error occurred while cancelling Gemini job.",
                details={"original_error": str(exc)},
            ) from exc
        except Exception as exc:
            raise GeminiAPIError.api_error(
                message="Unexpected error occurred during cancellation.",
                details={"original_error": str(exc)},
            ) from exc
