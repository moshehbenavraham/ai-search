import secrets
from enum import StrEnum
from typing import Annotated, Any, Literal

from pydantic import (
    AnyUrl,
    BeforeValidator,
    EmailStr,
    Field,
    HttpUrl,
    PostgresDsn,
    computed_field,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self

# =============================================================================
# Perplexity API Enums
# =============================================================================


class PerplexityModel(StrEnum):
    """Available Perplexity Sonar models for deep research."""

    SONAR = "sonar"
    SONAR_PRO = "sonar-pro"
    SONAR_REASONING = "sonar-reasoning"
    SONAR_REASONING_PRO = "sonar-reasoning-pro"
    SONAR_DEEP_RESEARCH = "sonar-deep-research"


class PerplexitySearchMode(StrEnum):
    """Search mode options for Perplexity API."""

    AUTO = "auto"
    NEWS = "news"
    ACADEMIC = "academic"
    SOCIAL = "social"


class PerplexityReasoningEffort(StrEnum):
    """Reasoning effort levels for Perplexity reasoning models."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# =============================================================================
# Gemini API Enums
# =============================================================================


class GeminiAgent(StrEnum):
    """Available Gemini agents for research tasks."""

    DEFAULT = "default"


# =============================================================================
# You.com API Enums
# =============================================================================


class YouComResearchEffort(StrEnum):
    """Research effort tiers for You.com research queries."""

    LITE = "lite"
    STANDARD = "standard"
    DEEP = "deep"
    EXHAUSTIVE = "exhaustive"


# =============================================================================
# Settings Classes
# =============================================================================


# Tavily API configuration settings
# Used for web search, content extraction, and site mapping features
class TavilySettings(BaseSettings):
    """Configuration for Tavily API integration.

    Environment variables:
        TAVILY_API_KEY: Required API key from tavily.com
        TAVILY_TIMEOUT: Request timeout in seconds (default: 60)
        TAVILY_PROXY: Optional HTTP proxy URL for API requests
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        env_prefix="TAVILY_",
    )

    # Required: Tavily API key (obtain from tavily.com)
    api_key: str

    # Optional: Request timeout in seconds
    timeout: int = 60

    # Optional: HTTP proxy URL for API requests
    proxy: str | None = None


# Perplexity API configuration settings
# Used for AI-powered deep research with citations
class PerplexitySettings(BaseSettings):
    """Configuration for Perplexity Sonar API integration.

    Environment variables:
        PERPLEXITY_API_KEY: API key from perplexity.ai (optional)
        PERPLEXITY_TIMEOUT: Request timeout in seconds (default: 300)
        PERPLEXITY_DEFAULT_MODEL: Default model to use (default: sonar-pro)
        PERPLEXITY_SEARCH_MODE: Search mode (default: auto)
        PERPLEXITY_REASONING_EFFORT: Reasoning effort level (default: medium)
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        env_prefix="PERPLEXITY_",
    )

    # Optional: Perplexity API key (obtain from perplexity.ai)
    api_key: str | None = Field(
        default=None,
        description="Perplexity API key for authentication",
    )

    # Request timeout in seconds (300s for deep research)
    timeout: int = Field(
        default=300,
        description="Request timeout in seconds",
    )

    # Default model for research queries (sonar-deep-research for exhaustive research)
    default_model: PerplexityModel = Field(
        default=PerplexityModel.SONAR_DEEP_RESEARCH,
        description="Default Perplexity model to use",
    )

    # Search mode for queries
    search_mode: PerplexitySearchMode = Field(
        default=PerplexitySearchMode.AUTO,
        description="Search mode for Perplexity queries",
    )

    # Reasoning effort level for reasoning models
    reasoning_effort: PerplexityReasoningEffort = Field(
        default=PerplexityReasoningEffort.MEDIUM,
        description="Reasoning effort level",
    )


# Gemini API configuration settings
# Used for long-running research tasks with polling
class GeminiSettings(BaseSettings):
    """Configuration for Google Gemini API integration.

    Environment variables:
        GEMINI_API_KEY: API key from Google AI Studio (optional)
        GEMINI_TIMEOUT: Request timeout in seconds (default: 120)
        GEMINI_POLL_INTERVAL: Polling interval in seconds (default: 10)
        GEMINI_MAX_POLL_ATTEMPTS: Maximum polling attempts (default: 360)
        GEMINI_AGENT: Agent selection (default: default)
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        env_prefix="GEMINI_",
    )

    # Optional: Gemini API key (obtain from Google AI Studio)
    api_key: str | None = Field(
        default=None,
        description="Gemini API key for authentication",
    )

    # Request timeout in seconds (per poll request)
    timeout: int = Field(
        default=120,
        description="Request timeout in seconds",
    )

    # Polling interval for long-running tasks
    poll_interval: int = Field(
        default=10,
        description="Polling interval in seconds",
    )

    # Maximum polling attempts (10s * 360 = 1 hour max)
    max_poll_attempts: int = Field(
        default=360,
        description="Maximum number of polling attempts",
    )

    # Agent selection
    agent: GeminiAgent = Field(
        default=GeminiAgent.DEFAULT,
        description="Gemini agent to use",
    )


class YouComSettings(BaseSettings):
    """Configuration for You.com Research API integration.

    Environment variables:
        YOUCOM_API_KEY: API key from You.com (optional)
        YOUCOM_TIMEOUT: Request timeout in seconds (default: 300)
        YOUCOM_DEFAULT_RESEARCH_EFFORT: Default research effort (default: standard)
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        env_prefix="YOUCOM_",
    )

    api_key: str | None = Field(
        default=None,
        description="You.com API key for authentication",
    )
    timeout: int = Field(
        default=300,
        description="Request timeout in seconds",
    )
    default_research_effort: YouComResearchEffort = Field(
        default=YouComResearchEffort.STANDARD,
        description="Default You.com research effort",
    )


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",") if i.strip()]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    FRONTEND_HOST: str = "http://localhost:5181"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]

    PROJECT_NAME: str
    SENTRY_DSN: HttpUrl | None = None
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5441
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )

    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: EmailStr | None = None
    EMAILS_FROM_NAME: str | None = None

    @model_validator(mode="after")
    def _set_default_emails_from(self) -> Self:
        if not self.EMAILS_FROM_NAME:
            self.EMAILS_FROM_NAME = self.PROJECT_NAME
        return self

    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48

    @computed_field  # type: ignore[prop-decorator]
    @property
    def emails_enabled(self) -> bool:
        return bool(self.SMTP_HOST and self.EMAILS_FROM_EMAIL)

    EMAIL_TEST_USER: EmailStr = "test@example.com"
    FIRST_SUPERUSER: EmailStr
    FIRST_SUPERUSER_PASSWORD: str

    def _check_default_secret(self, var_name: str, value: str | None) -> None:
        if value == "changethis":
            message = (
                f'The value of {var_name} is "changethis", '
                "for security, please change it, at least for deployments."
            )
            if self.ENVIRONMENT == "local":
                # Suppress warnings in local development to reduce log noise
                pass
            else:
                raise ValueError(message)

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        self._check_default_secret("SECRET_KEY", self.SECRET_KEY)
        self._check_default_secret("POSTGRES_PASSWORD", self.POSTGRES_PASSWORD)
        self._check_default_secret(
            "FIRST_SUPERUSER_PASSWORD", self.FIRST_SUPERUSER_PASSWORD
        )

        return self

    # Tavily API settings (nested model)
    tavily: TavilySettings = Field(
        default_factory=lambda: TavilySettings()  # type: ignore[call-arg]
    )

    # Perplexity API settings (nested model)
    perplexity: PerplexitySettings = Field(default_factory=lambda: PerplexitySettings())

    # Gemini API settings (nested model)
    gemini: GeminiSettings = Field(default_factory=lambda: GeminiSettings())

    # You.com API settings (nested model)
    youcom: YouComSettings = Field(default_factory=lambda: YouComSettings())


settings = Settings()  # type: ignore
