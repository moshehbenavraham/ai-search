"""Exercise the stdlib logger callbacks used by both startup retry loops."""

import importlib
import logging
from unittest.mock import MagicMock

import pytest
from tenacity import RetryError, stop_after_attempt, wait_none


@pytest.mark.parametrize(
    "module_name", ["app.backend_pre_start", "app.tests_pre_start"]
)
@pytest.mark.parametrize("exhausted", [False, True])
def test_retry_logs_and_stops(
    module_name: str,
    exhausted: bool,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    module = importlib.import_module(module_name)
    session = MagicMock()
    session.exec.side_effect = (
        [RuntimeError("synthetic connection failure")] * 3
        if exhausted
        else [RuntimeError("synthetic connection failure"), True]
    )
    session_factory = MagicMock()
    session_factory.return_value.__enter__.return_value = session
    monkeypatch.setattr(module, "Session", session_factory)

    # Use the production-decorated function and callbacks, with no waiting or DB.
    bounded_init = module.init.retry_with(stop=stop_after_attempt(3), wait=wait_none())
    with caplog.at_level(logging.INFO, logger=module_name):
        if exhausted:
            with pytest.raises(RetryError):
                bounded_init(MagicMock())
        else:
            bounded_init(MagicMock())

    attempts = 3 if exhausted else 2
    failures = 3 if exhausted else 1
    records = [record for record in caplog.records if record.name == module_name]
    assert session.exec.call_count == attempts
    assert (
        sum(record.getMessage().startswith("Starting call") for record in records)
        == attempts
    )
    assert (
        sum(record.getMessage().startswith("Finished call") for record in records)
        == failures
    )
    assert all(
        record.levelno == logging.WARNING
        for record in records
        if record.getMessage().startswith("Finished call")
    )
