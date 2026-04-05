"""Pydantic schemas for You.com Research API request and response types."""

from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class YouComResearchEffort(StrEnum):
    """Research effort levels for You.com deep research queries."""

    LITE = "lite"
    STANDARD = "standard"
    DEEP = "deep"
    EXHAUSTIVE = "exhaustive"


class YouComDeepResearchRequest(BaseModel):
    """Request schema for synchronous You.com deep research queries."""

    model_config = ConfigDict(extra="forbid")

    query: str = Field(
        min_length=1,
        max_length=10000,
        description="The research query to answer",
    )
    research_effort: YouComResearchEffort = Field(
        default=YouComResearchEffort.STANDARD,
        description="Depth and cost tier for You.com research",
    )

    @field_validator("query")
    @classmethod
    def validate_query(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Research query is required")
        return value


class YouComSource(BaseModel):
    """Individual source cited by the You.com research response."""

    model_config = ConfigDict(extra="allow")

    url: str = Field(description="URL of the cited source")
    title: str | None = Field(
        default=None,
        description="Title of the cited source",
    )
    snippets: list[str] = Field(
        default_factory=list,
        description="Relevant snippets extracted from the source",
    )


class YouComOutput(BaseModel):
    """Main You.com research output payload."""

    model_config = ConfigDict(extra="allow")

    content: str = Field(
        default="",
        description="Markdown-formatted research content",
    )
    content_type: str = Field(
        default="text",
        description="Format of the content field",
    )
    sources: list[YouComSource] = Field(
        default_factory=list,
        description="Sources cited in the research output",
    )


class YouComDeepResearchResponse(BaseModel):
    """Response schema for synchronous You.com deep research queries."""

    model_config = ConfigDict(extra="allow")

    output: YouComOutput = Field(description="Main You.com research output")
