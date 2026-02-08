"""
Memberships router for managing organisation members.

Endpoints:
- GET /api/broker/memberships: List all members
- POST /api/broker/memberships/invite: Invite a new member
- PUT /api/broker/memberships/{id}: Update a member's role/status
- DELETE /api/broker/memberships/{id}: Remove a member
- GET /api/broker/memberships/invitations: List pending invitations
- DELETE /api/broker/memberships/invitations/{id}: Cancel an invitation
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from middleware.auth import AuthContext, get_auth_context
from middleware.rbac import require_admin, is_admin, is_owner
from models import (
    User, Membership, MembershipInvitation, Organisation,
    MembershipRoleEnum, MembershipStatusEnum
)
from schemas import (
    InviteUserRequest, InviteUserResponse, InvitationResponse,
    MembershipResponse, MembershipUpdate
)

router = APIRouter(prefix="/api/broker/memberships", tags=["memberships"])


def _generate_token() -> str:
    """Generate a secure random token."""
    return secrets.token_urlsafe(32)


def _hash_token(token: str) -> str:
    """Hash a token for secure storage."""
    return hashlib.sha256(token.encode()).hexdigest()


@router.get("", response_model=List[MembershipResponse])
async def list_memberships(
    status: Optional[MembershipStatusEnum] = Query(None),
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    List all memberships in the organisation.

    Any authenticated member can view memberships.
    """
    query = db.query(Membership).filter(
        Membership.organisation_id == auth.organisation_id
    )

    if status:
        query = query.filter(Membership.status == status)

    memberships = query.all()

    # Fetch user info for each membership
    result = []
    for membership in memberships:
        user = db.query(User).filter(User.id == membership.user_id).first()
        result.append(MembershipResponse(
            id=str(membership.id),
            organisation_id=str(membership.organisation_id),
            user_id=str(membership.user_id),
            role=membership.role,
            status=membership.status,
            created_at=membership.created_at,
            updated_at=membership.updated_at,
            user_email=user.email if user else None,
            user_name=user.name if user else None
        ))

    return result


@router.post("/invite", response_model=InviteUserResponse)
async def invite_user(
    request: InviteUserRequest,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    Invite a new user to the organisation.

    Requires ADMIN or OWNER role.
    """
    require_admin(auth)

    # Check if user already exists and has a membership
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        existing_membership = db.query(Membership).filter(
            Membership.user_id == existing_user.id
        ).first()
        if existing_membership:
            raise HTTPException(
                status_code=400,
                detail="This user is already a member of an organisation"
            )

    # Check for existing pending invitation
    existing_invitation = db.query(MembershipInvitation).filter(
        MembershipInvitation.organisation_id == auth.organisation_id,
        MembershipInvitation.email == request.email,
        MembershipInvitation.accepted_at.is_(None),
        MembershipInvitation.expires_at > datetime.now(timezone.utc)
    ).first()

    if existing_invitation:
        raise HTTPException(
            status_code=400,
            detail="An active invitation already exists for this email"
        )

    # Cannot invite with OWNER role (there can only be one OWNER)
    if request.role == MembershipRoleEnum.OWNER:
        raise HTTPException(
            status_code=400,
            detail="Cannot invite users as OWNER. Use ownership transfer instead."
        )

    # Generate secure token
    token = _generate_token()
    token_hash = _hash_token(token)

    # Create invitation
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.INVITATION_EXPIRY_HOURS)

    invitation = MembershipInvitation(
        organisation_id=auth.organisation_id,
        email=request.email,
        role=request.role,
        token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    # Build the invite URL (only returned in dev/staging for testing)
    invite_url = None
    if settings.ENVIRONMENT in ("development", "staging"):
        invite_url = f"{settings.INVITATION_BASE_URL}?token={token}"

    return InviteUserResponse(
        invitation=InvitationResponse(
            id=str(invitation.id),
            organisation_id=str(invitation.organisation_id),
            email=invitation.email,
            role=invitation.role,
            expires_at=invitation.expires_at,
            accepted_at=invitation.accepted_at,
            created_at=invitation.created_at
        ),
        invite_url=invite_url
    )


@router.get("/{membership_id}", response_model=MembershipResponse)
async def get_membership(
    membership_id: str,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    Get a specific membership.
    """
    membership = db.query(Membership).filter(
        Membership.id == membership_id,
        Membership.organisation_id == auth.organisation_id
    ).first()

    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    user = db.query(User).filter(User.id == membership.user_id).first()

    return MembershipResponse(
        id=str(membership.id),
        organisation_id=str(membership.organisation_id),
        user_id=str(membership.user_id),
        role=membership.role,
        status=membership.status,
        created_at=membership.created_at,
        updated_at=membership.updated_at,
        user_email=user.email if user else None,
        user_name=user.name if user else None
    )


@router.put("/{membership_id}", response_model=MembershipResponse)
async def update_membership(
    membership_id: str,
    update: MembershipUpdate,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    Update a membership's role or status.

    Requires ADMIN or OWNER role.

    Rules:
    - Cannot change your own role
    - Cannot demote the OWNER (only ownership transfer can do that)
    - Only OWNER can promote to ADMIN
    - Cannot set someone as OWNER (use ownership transfer)
    """
    require_admin(auth)

    membership = db.query(Membership).filter(
        Membership.id == membership_id,
        Membership.organisation_id == auth.organisation_id
    ).first()

    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    # Cannot change your own role
    if str(membership.user_id) == auth.user_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot change your own membership"
        )

    # Cannot modify the OWNER
    if membership.role == MembershipRoleEnum.OWNER:
        raise HTTPException(
            status_code=400,
            detail="Cannot modify the OWNER. Use ownership transfer instead."
        )

    # Cannot set role to OWNER
    if update.role == MembershipRoleEnum.OWNER:
        raise HTTPException(
            status_code=400,
            detail="Cannot set role to OWNER. Use ownership transfer instead."
        )

    # Only OWNER can promote to ADMIN
    if update.role == MembershipRoleEnum.ADMIN and not is_owner(auth):
        raise HTTPException(
            status_code=403,
            detail="Only the OWNER can promote members to ADMIN"
        )

    # Apply updates
    if update.role is not None:
        membership.role = update.role
    if update.status is not None:
        membership.status = update.status

    db.commit()
    db.refresh(membership)

    user = db.query(User).filter(User.id == membership.user_id).first()

    return MembershipResponse(
        id=str(membership.id),
        organisation_id=str(membership.organisation_id),
        user_id=str(membership.user_id),
        role=membership.role,
        status=membership.status,
        created_at=membership.created_at,
        updated_at=membership.updated_at,
        user_email=user.email if user else None,
        user_name=user.name if user else None
    )


@router.delete("/{membership_id}")
async def remove_membership(
    membership_id: str,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    Remove a member from the organisation.

    Requires ADMIN or OWNER role.

    Rules:
    - Cannot remove yourself
    - Cannot remove the OWNER
    """
    require_admin(auth)

    membership = db.query(Membership).filter(
        Membership.id == membership_id,
        Membership.organisation_id == auth.organisation_id
    ).first()

    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    # Cannot remove yourself
    if str(membership.user_id) == auth.user_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot remove yourself from the organisation"
        )

    # Cannot remove the OWNER
    if membership.role == MembershipRoleEnum.OWNER:
        raise HTTPException(
            status_code=400,
            detail="Cannot remove the OWNER. Transfer ownership first."
        )

    # Soft delete by setting status to REMOVED
    membership.status = MembershipStatusEnum.REMOVED
    db.commit()

    return {"message": "Member removed successfully"}


# ----- Invitation Management -----

@router.get("/invitations", response_model=List[InvitationResponse])
async def list_invitations(
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    List all pending invitations.

    Requires ADMIN or OWNER role.
    """
    require_admin(auth)

    invitations = db.query(MembershipInvitation).filter(
        MembershipInvitation.organisation_id == auth.organisation_id,
        MembershipInvitation.accepted_at.is_(None),
        MembershipInvitation.expires_at > datetime.now(timezone.utc)
    ).all()

    return [
        InvitationResponse(
            id=str(inv.id),
            organisation_id=str(inv.organisation_id),
            email=inv.email,
            role=inv.role,
            expires_at=inv.expires_at,
            accepted_at=inv.accepted_at,
            created_at=inv.created_at
        )
        for inv in invitations
    ]


@router.delete("/invitations/{invitation_id}")
async def cancel_invitation(
    invitation_id: str,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    Cancel a pending invitation.

    Requires ADMIN or OWNER role.
    """
    require_admin(auth)

    invitation = db.query(MembershipInvitation).filter(
        MembershipInvitation.id == invitation_id,
        MembershipInvitation.organisation_id == auth.organisation_id,
        MembershipInvitation.accepted_at.is_(None)
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    db.delete(invitation)
    db.commit()

    return {"message": "Invitation cancelled"}


# ----- Ownership Transfer -----

@router.post("/transfer-ownership")
async def transfer_ownership(
    new_owner_user_id: str,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    Transfer organisation ownership to another member.

    Only the current OWNER can do this.

    The current OWNER becomes an ADMIN after transfer.
    """
    if not is_owner(auth):
        raise HTTPException(
            status_code=403,
            detail="Only the OWNER can transfer ownership"
        )

    # Find the new owner's membership
    new_owner_membership = db.query(Membership).filter(
        Membership.user_id == new_owner_user_id,
        Membership.organisation_id == auth.organisation_id,
        Membership.status == MembershipStatusEnum.ACTIVE
    ).first()

    if not new_owner_membership:
        raise HTTPException(
            status_code=404,
            detail="Target member not found"
        )

    # Get current owner's membership
    current_owner_membership = db.query(Membership).filter(
        Membership.user_id == auth.user_id,
        Membership.organisation_id == auth.organisation_id
    ).first()

    # Transfer ownership
    current_owner_membership.role = MembershipRoleEnum.ADMIN
    new_owner_membership.role = MembershipRoleEnum.OWNER

    db.commit()

    return {"message": "Ownership transferred successfully"}
