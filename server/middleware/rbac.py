from fastapi import HTTPException
from ..middleware.auth import AuthContext

def require_role(*allowed_roles: str):
    def decorator(auth: AuthContext):
        if auth.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )
        return auth
    return decorator

def check_organisation_access(auth: AuthContext, organisation_id: str) -> bool:
    # INTERNAL role can access all organisations
    if auth.role == "INTERNAL":
        return True
    # Other roles can only access their own organisation
    return auth.organisation_id == organisation_id
    