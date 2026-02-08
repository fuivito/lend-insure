"""
Organisations router for viewing and updating organisation settings.

Endpoints:
- GET /api/broker/organisation: Get current organisation
- PUT /api/broker/organisation: Update organisation settings
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import AuthContext, get_auth_context
from middleware.rbac import require_admin
from models import Organisation
from schemas import OrganisationResponse, OrganisationUpdate

router = APIRouter(prefix="/api/broker/organisation", tags=["organisation"])


@router.get("", response_model=OrganisationResponse)
async def get_organisation(
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    Get the current user's organisation.

    Any authenticated member can view the organisation.
    """
    organisation = db.query(Organisation).filter(
        Organisation.id == auth.organisation_id
    ).first()

    if not organisation:
        raise HTTPException(status_code=404, detail="Organisation not found")

    return OrganisationResponse(
        id=str(organisation.id),
        name=organisation.name,
        org_type=organisation.org_type,
        status=organisation.status,
        created_at=organisation.created_at,
        updated_at=organisation.updated_at
    )


@router.put("", response_model=OrganisationResponse)
async def update_organisation(
    update: OrganisationUpdate,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    Update organisation settings.

    Requires ADMIN or OWNER role.
    """
    require_admin(auth)

    organisation = db.query(Organisation).filter(
        Organisation.id == auth.organisation_id
    ).first()

    if not organisation:
        raise HTTPException(status_code=404, detail="Organisation not found")

    # Apply updates
    if update.name is not None:
        organisation.name = update.name

    db.commit()
    db.refresh(organisation)

    return OrganisationResponse(
        id=str(organisation.id),
        name=organisation.name,
        org_type=organisation.org_type,
        status=organisation.status,
        created_at=organisation.created_at,
        updated_at=organisation.updated_at
    )
