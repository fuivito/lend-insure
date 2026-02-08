"""
Supabase client wrapper for authenticated operations.

Provides two modes:
1. Service role client - for admin operations (user creation, membership management)
2. User client - uses the user's JWT for RLS-protected operations
"""

from supabase import create_client, Client
from config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class SupabaseService:
    """Wrapper for Supabase client operations."""

    _service_client: Optional[Client] = None

    @classmethod
    def get_service_client(cls) -> Client:
        """
        Get the service role client for admin operations.
        This bypasses RLS and should only be used for:
        - Creating users during signup
        - Looking up memberships for auth
        - Managing invitations
        """
        if cls._service_client is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured"
                )
            cls._service_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
        return cls._service_client

    @staticmethod
    def get_user_client(access_token: str) -> Client:
        """
        Get a client configured with the user's access token.
        This respects RLS policies.

        Args:
            access_token: The user's JWT from Supabase Auth
        """
        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_ANON_KEY must be configured"
            )

        client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        # Set the access token for RLS
        client.auth.set_session(access_token, "")
        return client


def get_supabase_service() -> Client:
    """Dependency for getting the service role client."""
    return SupabaseService.get_service_client()


def verify_supabase_jwt(token: str) -> dict:
    """
    Verify a Supabase JWT and extract claims.

    Args:
        token: The JWT to verify

    Returns:
        The decoded JWT payload

    Raises:
        ValueError: If the token is invalid
    """
    from jose import jwt, JWTError

    if not settings.SUPABASE_JWT_SECRET:
        raise ValueError("SUPABASE_JWT_SECRET must be configured")

    try:
        # Supabase uses HS256 by default
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}  # Supabase doesn't set aud by default
        )
        return payload
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise ValueError(f"Invalid token: {e}")


def get_user_from_token(token: str) -> Optional[dict]:
    """
    Get user info from a Supabase JWT.

    Returns:
        Dict with 'sub' (auth_user_id), 'email', 'role', etc.
        or None if token is invalid
    """
    try:
        payload = verify_supabase_jwt(token)
        return {
            "auth_user_id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role"),
            "exp": payload.get("exp"),
            "iat": payload.get("iat"),
        }
    except ValueError:
        return None
