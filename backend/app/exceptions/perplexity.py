"""Custom exceptions for Perplexity API integration.

This module defines custom exception classes and error codes for handling
Perplexity API errors in a structured way. The PerplexityAPIError exception
provides consistent error responses with HTTP status code mapping.

Usage:
    from app.exceptions.perplexity import PerplexityAPIError, PerplexityErrorCode

    # Raise with factory method
    raise PerplexityAPIError.rate_limit_exceeded()

    # Raise with custom parameters
    raise PerplexityAPIError(
        status_code=500,
        error_code=PerplexityErrorCode.PERPLEXITY_API_ERROR,
        message="An unexpected error occurred",
    )
"""

from enum import StrEnum
from typing import Any


class PerplexityErrorCode(StrEnum):
    """Error codes for Perplexity API errors.

    These codes provide machine-readable error categorization for clients
    to handle different error types appropriately.

    Attributes:
        RATE_LIMIT_EXCEEDED: API rate limit has been exceeded.
        INVALID_API_KEY: API key is invalid or missing.
        REQUEST_TIMEOUT: Request timed out waiting for response.
        INVALID_REQUEST: Request parameters are invalid.
        CONTENT_FILTER: Content was filtered due to policy violation.
        PERPLEXITY_API_ERROR: Unexpected error from Perplexity API.
    """

    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    INVALID_API_KEY = "invalid_api_key"
    REQUEST_TIMEOUT = "request_timeout"
    INVALID_REQUEST = "invalid_request"
    CONTENT_FILTER = "content_filter"
    PERPLEXITY_API_ERROR = "perplexity_api_error"


class PerplexityAPIError(Exception):
    """Custom exception for Perplexity API errors.

    This exception provides structured error information including HTTP status
    code, error code, message, and optional details. It is designed to be
    caught by a FastAPI exception handler for consistent API error responses.

    Attributes:
        status_code: HTTP status code for the error response.
        error_code: Machine-readable error code from PerplexityErrorCode.
        message: Human-readable error message.
        details: Optional additional error details.
    """

    def __init__(
        self,
        status_code: int,
        error_code: PerplexityErrorCode,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        """Initialize PerplexityAPIError.

        Args:
            status_code: HTTP status code for the error response.
            error_code: Machine-readable error code from PerplexityErrorCode.
            message: Human-readable error message.
            details: Optional additional error details.
        """
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details

    @classmethod
    def rate_limit_exceeded(
        cls,
        message: str = "Perplexity API rate limit exceeded. Please try again later.",
        details: dict[str, Any] | None = None,
    ) -> "PerplexityAPIError":
        """Create a rate limit exceeded error.

        Args:
            message: Custom error message. Defaults to standard rate limit message.
            details: Optional additional error details.

        Returns:
            PerplexityAPIError configured for rate limit exceeded (429).
        """
        return cls(
            status_code=429,
            error_code=PerplexityErrorCode.RATE_LIMIT_EXCEEDED,
            message=message,
            details=details,
        )

    @classmethod
    def invalid_api_key(
        cls,
        message: str = "Invalid or missing Perplexity API key.",
        details: dict[str, Any] | None = None,
    ) -> "PerplexityAPIError":
        """Create an invalid API key error.

        Args:
            message: Custom error message. Defaults to standard auth message.
            details: Optional additional error details.

        Returns:
            PerplexityAPIError configured for invalid API key (401).
        """
        return cls(
            status_code=401,
            error_code=PerplexityErrorCode.INVALID_API_KEY,
            message=message,
            details=details,
        )

    @classmethod
    def request_timeout(
        cls,
        message: str = "Perplexity API request timed out.",
        details: dict[str, Any] | None = None,
    ) -> "PerplexityAPIError":
        """Create a request timeout error.

        Args:
            message: Custom error message. Defaults to standard timeout message.
            details: Optional additional error details.

        Returns:
            PerplexityAPIError configured for request timeout (504).
        """
        return cls(
            status_code=504,
            error_code=PerplexityErrorCode.REQUEST_TIMEOUT,
            message=message,
            details=details,
        )

    @classmethod
    def invalid_request(
        cls,
        message: str = "Invalid request parameters for Perplexity API.",
        details: dict[str, Any] | None = None,
    ) -> "PerplexityAPIError":
        """Create an invalid request error.

        Args:
            message: Custom error message. Defaults to standard validation message.
            details: Optional additional error details.

        Returns:
            PerplexityAPIError configured for invalid request (400).
        """
        return cls(
            status_code=400,
            error_code=PerplexityErrorCode.INVALID_REQUEST,
            message=message,
            details=details,
        )

    @classmethod
    def content_filter(
        cls,
        message: str = "Content was filtered due to Perplexity policy violation.",
        details: dict[str, Any] | None = None,
    ) -> "PerplexityAPIError":
        """Create a content filter error.

        Args:
            message: Custom error message. Defaults to standard filter message.
            details: Optional additional error details.

        Returns:
            PerplexityAPIError configured for content filter (403).
        """
        return cls(
            status_code=403,
            error_code=PerplexityErrorCode.CONTENT_FILTER,
            message=message,
            details=details,
        )

    @classmethod
    def api_error(
        cls,
        message: str = "An error occurred while communicating with the Perplexity API.",
        details: dict[str, Any] | None = None,
    ) -> "PerplexityAPIError":
        """Create a generic Perplexity API error.

        Args:
            message: Custom error message. Defaults to standard API error message.
            details: Optional additional error details.

        Returns:
            PerplexityAPIError configured for generic API error (500).
        """
        return cls(
            status_code=500,
            error_code=PerplexityErrorCode.PERPLEXITY_API_ERROR,
            message=message,
            details=details,
        )
