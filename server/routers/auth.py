"""
Authentication router for signup, invitation redemption, and user info.

Endpoints:
- POST /api/auth/signup-with-org: Create a new org and become its OWNER
- POST /api/auth/redeem-invitation: Join an org via invitation token
- GET /api/auth/me: Get current user info
"""

import hashlib
import secrets
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import AuthContext, get_auth_context, get_auth_context_no_membership
from models import (
    User, Membership, MembershipInvitation, Organisation,
    MembershipRoleEnum, MembershipStatusEnum, OrgTypeEnum
)
from schemas import (
    SignupWithOrgRequest, RedeemInvitationRequest, AuthMeResponse,
    UserResponse, OrganisationResponse, MembershipResponse
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _hash_token(token: str) -> str:
    """Hash a token for secure storage."""
    return hashlib.sha256(token.encode()).hexdigest()


@router.post("/signup-with-org", response_model=AuthMeResponse)
async def signup_with_org(
    request: SignupWithOrgRequest,
    auth_info: dict = Depends(get_auth_context_no_membership),
    db: Session = Depends(get_db)
):
    """
    Create a new organisation and become its OWNER.

    This endpoint is for users who have authenticated via Supabase Auth
    but don't have a membership yet (new users).

    Flow:
    1. User signs up/logs in via Supabase Auth (frontend)
    2. User calls this endpoint with their JWT
    3. Backend creates the organisation, user record, and OWNER membership
    """
    auth_user_id = auth_info["auth_user_id"]
    email = auth_info["email"]

    # Check if user already exists
    existing_user = db.query(User).filter(User.auth_user_id == auth_user_id).first()

    if existing_user:
        # Check if they already have a membership
        existing_membership = db.query(Membership).filter(
            Membership.user_id == existing_user.id
        ).first()

        if existing_membership:
            raise HTTPException(
                status_code=400,
                detail="You are already a member of an organisation"
            )

    # Create the organisation
    organisation = Organisation(
        name=request.name,
        org_type=request.org_type
    )
    db.add(organisation)
    db.flush()  # Get the ID

    # Create or get the user
    if existing_user:
        user = existing_user
    else:
        user = User(
            auth_user_id=auth_user_id,
            email=email,
            name=email.split("@")[0]  # Default name from email
        )
        db.add(user)
        db.flush()

    # Create the membership as OWNER
    membership = Membership(
        organisation_id=organisation.id,
        user_id=user.id,
        role=MembershipRoleEnum.OWNER,
        status=MembershipStatusEnum.ACTIVE
    )
    db.add(membership)
    db.commit()
    db.refresh(organisation)
    db.refresh(user)
    db.refresh(membership)

    return AuthMeResponse(
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            created_at=user.created_at,
            updated_at=user.updated_at
        ),
        organisation=OrganisationResponse(
            id=str(organisation.id),
            name=organisation.name,
            org_type=organisation.org_type,
            status=organisation.status,
            created_at=organisation.created_at,
            updated_at=organisation.updated_at
        ),
        membership=MembershipResponse(
            id=str(membership.id),
            organisation_id=str(membership.organisation_id),
            user_id=str(membership.user_id),
            role=membership.role,
            status=membership.status,
            created_at=membership.created_at,
            updated_at=membership.updated_at,
            user_email=user.email,
            user_name=user.name
        )
    )


@router.post("/redeem-invitation", response_model=AuthMeResponse)
async def redeem_invitation(
    request: RedeemInvitationRequest,
    auth_info: dict = Depends(get_auth_context_no_membership),
    db: Session = Depends(get_db)
):
    """
    Redeem an invitation token to join an organisation.

    Flow:
    1. User receives invitation email with token
    2. User signs up/logs in via Supabase Auth (frontend)
    3. User calls this endpoint with their JWT and the token
    4. Backend validates the token and creates the membership

    CRITICAL: Rejects if user already has ANY membership (single-org constraint)
    """
    auth_user_id = auth_info["auth_user_id"]
    email = auth_info["email"]

    # Hash the provided token to compare with stored hash
    token_hash = _hash_token(request.token)

    # Find the invitation
    invitation = db.query(MembershipInvitation).filter(
        MembershipInvitation.token_hash == token_hash
    ).first()

    if not invitation:
        raise HTTPException(
            status_code=404,
            detail="Invalid invitation token"
        )

    # Check expiration
    if invitation.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Invitation has expired"
        )

    # Check if already accepted
    if invitation.accepted_at:
        raise HTTPException(
            status_code=400,
            detail="Invitation has already been redeemed"
        )

    # Check if user already exists
    existing_user = db.query(User).filter(User.auth_user_id == auth_user_id).first()

    if existing_user:
        # CRITICAL: Check if they already have ANY membership
        existing_membership = db.query(Membership).filter(
            Membership.user_id == existing_user.id
        ).first()

        if existing_membership:
            raise HTTPException(
                status_code=400,
                detail="You are already a member of an organisation. "
                       "Users can only belong to one organisation."
            )

    # Get the organisation
    organisation = db.query(Organisation).filter(
        Organisation.id == invitation.organisation_id
    ).first()

    if not organisation:
        raise HTTPException(
            status_code=404,
            detail="Organisation not found"
        )

    # Create or get the user
    if existing_user:
        user = existing_user
    else:
        user = User(
            auth_user_id=auth_user_id,
            email=email,
            name=email.split("@")[0]  # Default name from email
        )
        db.add(user)
        db.flush()

    # Create the membership with the invited role
    membership = Membership(
        organisation_id=invitation.organisation_id,
        user_id=user.id,
        role=invitation.role,
        status=MembershipStatusEnum.ACTIVE
    )
    db.add(membership)

    # Mark invitation as accepted
    invitation.accepted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(organisation)
    db.refresh(user)
    db.refresh(membership)

    return AuthMeResponse(
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            created_at=user.created_at,
            updated_at=user.updated_at
        ),
        organisation=OrganisationResponse(
            id=str(organisation.id),
            name=organisation.name,
            org_type=organisation.org_type,
            status=organisation.status,
            created_at=organisation.created_at,
            updated_at=organisation.updated_at
        ),
        membership=MembershipResponse(
            id=str(membership.id),
            organisation_id=str(membership.organisation_id),
            user_id=str(membership.user_id),
            role=membership.role,
            status=membership.status,
            created_at=membership.created_at,
            updated_at=membership.updated_at,
            user_email=user.email,
            user_name=user.name
        )
    )


@router.get("/me", response_model=AuthMeResponse)
async def get_me(
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    """
    Get the current user's info, organisation, and membership.

    Requires an active membership.
    """
    # Get fresh data from DB
    user = db.query(User).filter(User.id == auth.user_id).first()
    membership = db.query(Membership).filter(
        Membership.user_id == auth.user_id,
        Membership.status == MembershipStatusEnum.ACTIVE
    ).first()
    organisation = db.query(Organisation).filter(
        Organisation.id == auth.organisation_id
    ).first()

    if not user or not membership or not organisation:
        raise HTTPException(
            status_code=404,
            detail="User data not found"
        )

    return AuthMeResponse(
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            created_at=user.created_at,
            updated_at=user.updated_at
        ),
        organisation=OrganisationResponse(
            id=str(organisation.id),
            name=organisation.name,
            org_type=organisation.org_type,
            status=organisation.status,
            created_at=organisation.created_at,
            updated_at=organisation.updated_at
        ),
        membership=MembershipResponse(
            id=str(membership.id),
            organisation_id=str(membership.organisation_id),
            user_id=str(membership.user_id),
            role=membership.role,
            status=membership.status,
            created_at=membership.created_at,
            updated_at=membership.updated_at,
            user_email=user.email,
            user_name=user.name
        )
    )


@router.get("/check-membership")
async def check_membership(
    auth_info: dict = Depends(get_auth_context_no_membership),
    db: Session = Depends(get_db)
):
    """
    Check if the authenticated user has a membership.

    Useful for the frontend to determine which flow to show:
    - If has_membership=True: Go to dashboard
    - If has_membership=False and has_pending_invitation=True: Show redeem invitation page
    - If has_membership=False and has_pending_invitation=False: Show create org page
    """
    auth_user_id = auth_info["auth_user_id"]
    email = auth_info["email"]

    user = db.query(User).filter(User.auth_user_id == auth_user_id).first()

    if user:
        membership = db.query(Membership).filter(
            Membership.user_id == user.id,
            Membership.status == MembershipStatusEnum.ACTIVE
        ).first()

        if membership:
            return {
                "has_membership": True,
                "has_pending_invitation": False,
                "organisation_id": str(membership.organisation_id),
                "role": membership.role.value
            }

    # Check for pending invitations by email
    pending_invitation = db.query(MembershipInvitation).filter(
        MembershipInvitation.email == email,
        MembershipInvitation.accepted_at.is_(None),
        MembershipInvitation.expires_at > datetime.now(timezone.utc)
    ).first()

    return {
        "has_membership": False,
        "has_pending_invitation": pending_invitation is not None,
        "organisation_id": None,
        "role": None
    }
