"""Custom exceptions for Tavily API integration.

This module defines custom exception classes and error codes for handling
Tavily API errors in a structured way. The TavilyAPIError exception provides
consistent error responses with HTTP status code mapping.

Usage:
    from app.core.exceptions import TavilyAPIError, TavilyErrorCode

    # Raise with factory method
    raise TavilyAPIError.rate_limit_exceeded()

    # Raise with custom parameters
    raise TavilyAPIError(
        status_code=500,
        error_code=TavilyErrorCode.TAVILY_API_ERROR,
        message="An unexpected error occurred",
    )
"""

from enum import StrEnum
from typing import Any


class TavilyErrorCode(StrEnum):
    """Error codes for Tavily API errors.

    These codes provide machine-readable error categorization for clients
    to handle different error types appropriately.

    Attributes:
        RATE_LIMIT_EXCEEDED: API rate limit has been exceeded.
        INVALID_API_KEY: API key is invalid or missing.
        REQUEST_TIMEOUT: Request timed out waiting for response.
        INVALID_REQUEST: Request parameters are invalid.
        TAVILY_API_ERROR: Unexpected error from Tavily API.
    """

    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    INVALID_API_KEY = "invalid_api_key"
    REQUEST_TIMEOUT = "request_timeout"
    INVALID_REQUEST = "invalid_request"
    TAVILY_API_ERROR = "tavily_api_error"


class TavilyAPIError(Exception):
    """Custom exception for Tavily API errors.

    This exception provides structured error information including HTTP status
    code, error code, message, and optional details. It is designed to be
    caught by a FastAPI exception handler for consistent API error responses.

    Attributes:
        status_code: HTTP status code for the error response.
        error_code: Machine-readable error code from TavilyErrorCode.
        message: Human-readable error message.
        details: Optional additional error details.
    """

    def __init__(
        self,
        status_code: int,
        error_code: TavilyErrorCode,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        """Initialize TavilyAPIError.

        Args:
            status_code: HTTP status code for the error response.
            error_code: Machine-readable error code from TavilyErrorCode.
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
        message: str = "API rate limit exceeded. Please try again later.",
        details: dict[str, Any] | None = None,
    ) -> "TavilyAPIError":
        """Create a rate limit exceeded error.

        Args:
            message: Custom error message. Defaults to standard rate limit message.
            details: Optional additional error details.

        Returns:
            TavilyAPIError configured for rate limit exceeded (429).
        """
        return cls(
            status_code=429,
            error_code=TavilyErrorCode.RATE_LIMIT_EXCEEDED,
            message=message,
            details=details,
        )

    @classmethod
    def invalid_api_key(
        cls,
        message: str = "Invalid or missing Tavily API key.",
        details: dict[str, Any] | None = None,
    ) -> "TavilyAPIError":
        """Create an invalid API key error.

        Args:
            message: Custom error message. Defaults to standard auth message.
            details: Optional additional error details.

        Returns:
            TavilyAPIError configured for invalid API key (401).
        """
        return cls(
            status_code=401,
            error_code=TavilyErrorCode.INVALID_API_KEY,
            message=message,
            details=details,
        )

    @classmethod
    def request_timeout(
        cls,
        message: str = "Request timed out. The operation took too long to complete.",
        details: dict[str, Any] | None = None,
    ) -> "TavilyAPIError":
        """Create a request timeout error.

        Args:
            message: Custom error message. Defaults to standard timeout message.
            details: Optional additional error details.

        Returns:
            TavilyAPIError configured for request timeout (504).
        """
        return cls(
            status_code=504,
            error_code=TavilyErrorCode.REQUEST_TIMEOUT,
            message=message,
            details=details,
        )

    @classmethod
    def invalid_request(
        cls,
        message: str = "Invalid request parameters.",
        details: dict[str, Any] | None = None,
    ) -> "TavilyAPIError":
        """Create an invalid request error.

        Args:
            message: Custom error message. Defaults to standard validation message.
            details: Optional additional error details.

        Returns:
            TavilyAPIError configured for invalid request (400).
        """
        return cls(
            status_code=400,
            error_code=TavilyErrorCode.INVALID_REQUEST,
            message=message,
            details=details,
        )

    @classmethod
    def api_error(
        cls,
        message: str = "An error occurred while communicating with the Tavily API.",
        details: dict[str, Any] | None = None,
    ) -> "TavilyAPIError":
        """Create a generic Tavily API error.

        Args:
            message: Custom error message. Defaults to standard API error message.
            details: Optional additional error details.

        Returns:
            TavilyAPIError configured for generic API error (500).
        """
        return cls(
            status_code=500,
            error_code=TavilyErrorCode.TAVILY_API_ERROR,
            message=message,
            details=details,
        )
