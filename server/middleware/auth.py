from fastapi import Header, HTTPException, Depends
from typing import Optional
from jose import jwt, JWTError
from config import settings

class AuthContext:
    def __init__(self, user_id: str, organisation_id: str, role: str):
        self.user_id = user_id
        self.organisation_id = organisation_id
        self.role = role

async def get_auth_context(
    x_user_id: Optional[str] = Header(None),
    x_org_id: Optional[str] = Header(None),
    x_role: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
) -> AuthContext:
    # Development mode: allow dev headers
    if settings.ENVIRONMENT == "development" and x_user_id and x_org_id and x_role:
        return AuthContext(
            user_id=x_user_id,
            organisation_id=x_org_id,
            role=x_role
        )
    
    # JWT authentication
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization[7:]
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return AuthContext(
            user_id=payload["user_id"],
            organisation_id=payload["organisation_id"],
            role=payload["role"]
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
