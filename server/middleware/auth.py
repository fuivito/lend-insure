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
    # Development mode: always allow (use provided headers or defaults)
    if settings.ENVIRONMENT == "development":
        print("in development mode")
        return AuthContext(
            user_id=x_user_id or "650e8400-e29b-41d4-a716-446655440000",
            organisation_id=x_org_id or "550e8400-e29b-41d4-a716-446655440000",
            role=x_role or "BROKER"
        )
    
    # Production mode: require JWT authentication
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