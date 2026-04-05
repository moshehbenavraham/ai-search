"""Custom exceptions for API integrations.

This package contains custom exception classes and error codes for handling
errors from external API integrations in a structured way.
"""

from app.exceptions.gemini import GeminiAPIError, GeminiErrorCode
from app.exceptions.perplexity import PerplexityAPIError, PerplexityErrorCode
from app.exceptions.youcom import YouComAPIError, YouComErrorCode

__all__ = [
    # Perplexity
    "PerplexityAPIError",
    "PerplexityErrorCode",
    # Gemini
    "GeminiAPIError",
    "GeminiErrorCode",
    # You.com
    "YouComAPIError",
    "YouComErrorCode",
]
