"""
Role-Based Access Control middleware.

Role hierarchy: OWNER > ADMIN > MEMBER > READ_ONLY

- OWNER: Full access, can transfer ownership, delete org
- ADMIN: Can manage members, invitations, and all data
- MEMBER: Can create/update data but not manage members
- READ_ONLY: Can only view data
"""

from fastapi import HTTPException
from functools import wraps
from typing import Callable, List

from middleware.auth import AuthContext
from models import MembershipRoleEnum


# Role hierarchy - higher index = higher privilege
ROLE_HIERARCHY = {
    "READ_ONLY": 0,
    "MEMBER": 1,
    "ADMIN": 2,
    "OWNER": 3,
}


def get_role_level(role: str) -> int:
    """Get the privilege level of a role."""
    return ROLE_HIERARCHY.get(role, -1)


def require_role(*allowed_roles: str):
    """
    Decorator/dependency to require specific roles.

    Usage:
        @router.get("/admin-only")
        def admin_endpoint(auth: AuthContext = Depends(get_auth_context)):
            require_role("ADMIN", "OWNER")(auth)
            ...

    Or as a reusable dependency:
        admin_only = require_role("ADMIN", "OWNER")

        @router.get("/admin-only")
        def admin_endpoint(auth: AuthContext = Depends(get_auth_context)):
            admin_only(auth)
            ...
    """
    def checker(auth: AuthContext) -> AuthContext:
        if auth.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required roles: {', '.join(allowed_roles)}"
            )
        return auth
    return checker


def require_minimum_role(minimum_role: str):
    """
    Require at least the specified role level.

    Usage:
        require_minimum_role("MEMBER")(auth)  # Allows MEMBER, ADMIN, OWNER

    Args:
        minimum_role: The minimum role required (inclusive)
    """
    min_level = get_role_level(minimum_role)

    def checker(auth: AuthContext) -> AuthContext:
        user_level = get_role_level(auth.role)
        if user_level < min_level:
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Minimum role required: {minimum_role}"
            )
        return auth
    return checker


def check_organisation_access(auth: AuthContext, organisation_id: str) -> bool:
    """
    Check if the user has access to the specified organisation.

    Note: With the single-membership model, users can only access their own org.

    Args:
        auth: The authentication context
        organisation_id: The organisation to check access for

    Returns:
        True if access is allowed

    Raises:
        HTTPException: If access is denied
    """
    if auth.organisation_id != organisation_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied to this organisation"
        )
    return True


def is_admin(auth: AuthContext) -> bool:
    """Check if the user is an ADMIN or OWNER."""
    return auth.role in ("ADMIN", "OWNER")


def is_owner(auth: AuthContext) -> bool:
    """Check if the user is an OWNER."""
    return auth.role == "OWNER"


def can_write(auth: AuthContext) -> bool:
    """Check if the user can create/update data (MEMBER+)."""
    return get_role_level(auth.role) >= get_role_level("MEMBER")


def can_delete(auth: AuthContext) -> bool:
    """Check if the user can delete data (ADMIN+)."""
    return get_role_level(auth.role) >= get_role_level("ADMIN")


def can_manage_members(auth: AuthContext) -> bool:
    """Check if the user can invite/manage members (ADMIN+)."""
    return get_role_level(auth.role) >= get_role_level("ADMIN")


# Convenience dependencies for common access patterns
require_owner = require_role("OWNER")
require_admin = require_role("ADMIN", "OWNER")
require_member = require_minimum_role("MEMBER")
require_read = require_minimum_role("READ_ONLY")  # Any authenticated user
