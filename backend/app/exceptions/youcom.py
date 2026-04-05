"""Custom exceptions for You.com Research API integration."""

from enum import StrEnum
from typing import Any


class YouComErrorCode(StrEnum):
    """Error codes for You.com API errors."""

    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    INVALID_API_KEY = "invalid_api_key"
    REQUEST_TIMEOUT = "request_timeout"
    INVALID_REQUEST = "invalid_request"
    YOUCOM_API_ERROR = "youcom_api_error"


class YouComAPIError(Exception):
    """Custom exception for You.com API errors."""

    def __init__(
        self,
        status_code: int,
        error_code: YouComErrorCode,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details

    @classmethod
    def rate_limit_exceeded(
        cls,
        message: str = "You.com API rate limit exceeded. Please try again later.",
        details: dict[str, Any] | None = None,
    ) -> "YouComAPIError":
        return cls(
            status_code=429,
            error_code=YouComErrorCode.RATE_LIMIT_EXCEEDED,
            message=message,
            details=details,
        )

    @classmethod
    def invalid_api_key(
        cls,
        message: str = "Invalid or missing You.com API key.",
        details: dict[str, Any] | None = None,
    ) -> "YouComAPIError":
        return cls(
            status_code=401,
            error_code=YouComErrorCode.INVALID_API_KEY,
            message=message,
            details=details,
        )

    @classmethod
    def request_timeout(
        cls,
        message: str = "You.com API request timed out.",
        details: dict[str, Any] | None = None,
    ) -> "YouComAPIError":
        return cls(
            status_code=504,
            error_code=YouComErrorCode.REQUEST_TIMEOUT,
            message=message,
            details=details,
        )

    @classmethod
    def invalid_request(
        cls,
        message: str = "Invalid request parameters for You.com API.",
        details: dict[str, Any] | None = None,
    ) -> "YouComAPIError":
        return cls(
            status_code=400,
            error_code=YouComErrorCode.INVALID_REQUEST,
            message=message,
            details=details,
        )

    @classmethod
    def api_error(
        cls,
        message: str = "An error occurred while communicating with the You.com API.",
        details: dict[str, Any] | None = None,
    ) -> "YouComAPIError":
        return cls(
            status_code=500,
            error_code=YouComErrorCode.YOUCOM_API_ERROR,
            message=message,
            details=details,
        )
