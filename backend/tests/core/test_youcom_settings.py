"""You.com key migration coverage; no database or external API calls."""

from pathlib import Path

import pytest

from app.core.config import YouComSettings


@pytest.fixture(autouse=True)
def clean_youcom_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in (
        "YDC_API_KEY",
        "YOUCOM_API_KEY",
        "YOUCOM_TIMEOUT",
        "YOUCOM_DEFAULT_RESEARCH_EFFORT",
    ):
        monkeypatch.delenv(name, raising=False)


@pytest.mark.parametrize(
    ("canonical", "legacy", "expected"),
    [
        (None, None, None),
        ("canonical-test-value", None, "canonical-test-value"),
        (None, "legacy-test-value", "legacy-test-value"),
        ("canonical-test-value", "legacy-test-value", "canonical-test-value"),
        ("", "legacy-test-value", "legacy-test-value"),
        ("", "", None),
    ],
)
def test_api_key_environment_aliases(
    monkeypatch: pytest.MonkeyPatch,
    canonical: str | None,
    legacy: str | None,
    expected: str | None,
) -> None:
    if canonical is not None:
        monkeypatch.setenv("YDC_API_KEY", canonical)
    if legacy is not None:
        monkeypatch.setenv("YOUCOM_API_KEY", legacy)
    assert YouComSettings(_env_file=None).api_key == expected


def test_api_key_field_name_constructor_remains_supported() -> None:
    assert YouComSettings(api_key="explicit-test-value", _env_file=None).api_key == (
        "explicit-test-value"
    )


def test_explicit_api_key_overrides_environment(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("YDC_API_KEY", "environment-test-value")
    assert YouComSettings(api_key="explicit-test-value", _env_file=None).api_key == (
        "explicit-test-value"
    )


def test_other_youcom_environment_settings_keep_prefix(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("YOUCOM_TIMEOUT", "123")
    monkeypatch.setenv("YOUCOM_DEFAULT_RESEARCH_EFFORT", "deep")
    settings = YouComSettings(_env_file=None)
    assert settings.timeout == 123
    assert settings.default_research_effort == "deep"


def test_empty_canonical_dotenv_preserves_legacy_key(tmp_path: Path) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text("YDC_API_KEY=\nYOUCOM_API_KEY=legacy-test-value\n")
    assert YouComSettings(_env_file=env_file).api_key == "legacy-test-value"


def test_environment_overrides_dotenv_alias(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text("YDC_API_KEY=dotenv-test-value\n")
    monkeypatch.setenv("YOUCOM_API_KEY", "environment-test-value")
    assert YouComSettings(_env_file=env_file).api_key == "environment-test-value"
