"""Custom exceptions for API integrations.

This package contains custom exception classes and error codes for handling
errors from external API integrations in a structured way.
"""

from app.exceptions.perplexity import PerplexityAPIError, PerplexityErrorCode

__all__ = [
    # Perplexity
    "PerplexityAPIError",
    "PerplexityErrorCode",
]
