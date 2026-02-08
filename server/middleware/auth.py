"""
Authentication middleware for Supabase JWT verification.

Supports two modes:
1. Development mode: Uses X-* headers for testing
2. Production mode: Verifies Supabase JWTs and looks up memberships
"""

from fastapi import Header, HTTPException, Depends
from typing import Optional
from dataclasses import dataclass
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from config import settings
from database import get_db
from models import User, Membership, MembershipStatusEnum


@dataclass
class AuthContext:
    """
    Authentication context for the current request.

    Attributes:
        auth_user_id: The Supabase auth.uid() - UUID from auth.users
        user_id: The internal users.id - UUID from public.users
        organisation_id: The user's organisation from their active membership
        role: The user's role in the organisation (OWNER, ADMIN, MEMBER, READ_ONLY)
        email: The user's email address
        name: The user's display name
        access_token: The original JWT for downstream Supabase calls with RLS
    """
    auth_user_id: str
    user_id: str
    organisation_id: str
    role: str
    email: str
    name: str
    access_token: Optional[str] = None


def _verify_supabase_jwt(token: str) -> dict:
    """
    Verify a Supabase JWT and return the payload.

    Args:
        token: The JWT to verify

    Returns:
        The decoded JWT payload

    Raises:
        HTTPException: If the token is invalid or expired
    """
    if not settings.SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_JWT_SECRET not configured"
        )

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}  # Supabase doesn't set aud by default
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid or expired token: {e}"
        )


def _get_membership_from_auth_user_id(db: Session, auth_user_id: str) -> tuple[User, Membership]:
    """
    Look up the user and their active membership by auth_user_id.

    Args:
        db: Database session
        auth_user_id: The Supabase auth.uid()

    Returns:
        Tuple of (User, Membership)

    Raises:
        HTTPException: If user not found or no active membership
    """
    user = db.query(User).filter(User.auth_user_id == auth_user_id).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found. Please complete signup."
        )

    membership = db.query(Membership).filter(
        Membership.user_id == user.id,
        Membership.status == MembershipStatusEnum.ACTIVE
    ).first()

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="No active membership. Please join an organisation or create one."
        )

    return user, membership


async def get_auth_context(
    x_user_id: Optional[str] = Header(None),
    x_org_id: Optional[str] = Header(None),
    x_role: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> AuthContext:
    """
    Get the authentication context for the current request.

    In development mode, uses X-* headers for testing.
    In production mode, verifies the Supabase JWT and looks up the user's membership.

    Args:
        x_user_id: Development header for user ID
        x_org_id: Development header for organisation ID
        x_role: Development header for role
        authorization: Bearer token for production auth
        db: Database session

    Returns:
        AuthContext with user and organisation information

    Raises:
        HTTPException: If authentication fails
    """
    # PRIORITY: Always prefer JWT if provided
    # X-* headers only work in dev mode when EXPLICITLY provided (for curl/API testing)
    if authorization and authorization.startswith("Bearer "):
        # Has JWT - use production auth flow (handled below)
        pass
    elif settings.ENVIRONMENT == "development" and x_user_id and x_org_id:
        # Development mode: allow X-* headers for explicit API testing only
        # This is for curl/Postman testing, NOT for frontend fallback
        return AuthContext(
            auth_user_id=x_user_id,
            user_id=x_user_id,
            organisation_id=x_org_id,
            role=x_role or "MEMBER",
            email="dev@example.com",
            name="Dev User",
            access_token=None
        )

    # All other cases: require JWT (production mode behavior)
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )

    token = authorization[7:]

    # Verify the JWT
    payload = _verify_supabase_jwt(token)
    auth_user_id = payload.get("sub")

    if not auth_user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token: missing sub claim"
        )

    # Look up user and membership
    user, membership = _get_membership_from_auth_user_id(db, auth_user_id)

    return AuthContext(
        auth_user_id=str(auth_user_id),
        user_id=str(user.id),
        organisation_id=str(membership.organisation_id),
        role=membership.role.value,
        email=user.email,
        name=user.name,
        access_token=token
    )


async def get_optional_auth_context(
    x_user_id: Optional[str] = Header(None),
    x_org_id: Optional[str] = Header(None),
    x_role: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[AuthContext]:
    """
    Get authentication context if available, None otherwise.
    Useful for endpoints that work both authenticated and unauthenticated.
    """
    try:
        return await get_auth_context(
            x_user_id=x_user_id,
            x_org_id=x_org_id,
            x_role=x_role,
            authorization=authorization,
            db=db
        )
    except HTTPException:
        return None


async def get_auth_context_no_membership(
    authorization: Optional[str] = Header(None),
) -> dict:
    """
    Get basic auth info from JWT without requiring a membership.
    Used for signup flows where user doesn't have a membership yet.

    Returns:
        Dict with auth_user_id and email from the JWT

    Raises:
        HTTPException: If no valid JWT provided
    """
    # Always require a valid JWT - no dev fallbacks
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )

    token = authorization[7:]
    payload = _verify_supabase_jwt(token)

    return {
        "auth_user_id": payload.get("sub"),
        "email": payload.get("email")
    }
