"""Perplexity API route handlers.

This module provides FastAPI route handlers for Perplexity deep research
operations. Routes require JWT authentication via CurrentUser dependency
and use PerplexityDep for service injection.

Endpoints:
    POST /perplexity/deep-research - Execute deep research query
"""

from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUser, PerplexityDep
from app.schemas.perplexity import (
    PerplexityDeepResearchRequest,
    PerplexityDeepResearchResponse,
)

router = APIRouter(prefix="/perplexity", tags=["perplexity"])


@router.post("/deep-research", response_model=PerplexityDeepResearchResponse)
async def deep_research(
    _current_user: CurrentUser,
    perplexity: PerplexityDep,
    request: PerplexityDeepResearchRequest,
) -> Any:
    """Execute a deep research query using Perplexity Sonar API.

    Performs a deep research query with the provided parameters, returning
    a comprehensive response with citations and search results.

    Args:
        _current_user: Authenticated user (required for authorization).
        perplexity: Injected PerplexityService instance.
        request: Deep research request with query and optional parameters.

    Returns:
        PerplexityDeepResearchResponse with model response and citations.

    Raises:
        PerplexityAPIError: If the Perplexity API request fails.
    """
    return await perplexity.deep_research(request)
