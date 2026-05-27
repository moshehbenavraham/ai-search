import base64
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt

from app.core.config import settings

ALGORITHM = "HS256"
MAX_BCRYPT_PASSWORD_BYTES = 72
BCRYPT_SHA256_PREFIX = "$bcrypt-sha256$"


def _bcrypt_sha256_password_bytes(password: str) -> bytes:
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return base64.b64encode(digest)


def _legacy_bcrypt_password_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:MAX_BCRYPT_PASSWORD_BYTES]


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if hashed_password.startswith(BCRYPT_SHA256_PREFIX):
            return bcrypt.checkpw(
                _bcrypt_sha256_password_bytes(plain_password),
                hashed_password.removeprefix(BCRYPT_SHA256_PREFIX).encode("utf-8"),
            )
        return bcrypt.checkpw(
            _legacy_bcrypt_password_bytes(plain_password),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        return False


def get_password_hash(password: str) -> str:
    hashed = bcrypt.hashpw(_bcrypt_sha256_password_bytes(password), bcrypt.gensalt())
    return f"{BCRYPT_SHA256_PREFIX}{hashed.decode('utf-8')}"
