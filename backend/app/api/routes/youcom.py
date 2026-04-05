"""You.com API route handlers."""

from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUser, YouComDep
from app.schemas.youcom import YouComDeepResearchRequest, YouComDeepResearchResponse

router = APIRouter(prefix="/youcom", tags=["youcom"])


@router.post("/deep-research", response_model=YouComDeepResearchResponse)
async def deep_research(
    _current_user: CurrentUser,
    youcom: YouComDep,
    request: YouComDeepResearchRequest,
) -> Any:
    """Execute a synchronous deep research query using You.com."""

    return await youcom.deep_research(request)
