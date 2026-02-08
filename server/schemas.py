from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any
from datetime import datetime
from decimal import Decimal
import uuid
from models import (
    AgreementStatusEnum, InstalmentStatusEnum,
    PaymentStatusEnum, OrganisationStatusEnum, ProposalStatusEnum,
    OrgTypeEnum, MembershipRoleEnum, MembershipStatusEnum
)

# Client schemas
class ClientCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None

class ClientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None


class ClientResponse(BaseModel):
    id: str
    organisation_id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    address_line1: Optional[str]
    address_line2: Optional[str]
    city: Optional[str]
    postcode: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    @field_validator('id', 'organisation_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: str
        }

# Policy schemas
class PolicyCreate(BaseModel):
    client_id: str
    insurer: str  # Changed from insurer_name
    product_type: str
    policy_number: str
    start_date: datetime  # Changed from inception_date
    end_date: datetime  # Changed from expiry_date
    premium_amount_pennies: int  # Changed from gross_premium

class PolicyResponse(BaseModel):
    id: str
    organisation_id: str
    client_id: str
    insurer: str  # Changed from insurer_name
    product_type: str
    policy_number: str
    start_date: datetime  # Changed from inception_date
    end_date: datetime  # Changed from expiry_date
    premium_amount_pennies: int  # Changed from gross_premium
    created_at: datetime
    
    @field_validator('id', 'organisation_id', 'client_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: str
        }

# Agreement schemas
class AgreementCreate(BaseModel):
    client_id: str
    policy_id: str
    principal_amount_pennies: int  # Amount in pennies
    apr_bps: int
    term_months: int
    broker_fee_bps: int
    signed_at: Optional[datetime] = None

class AgreementResponse(BaseModel):
    id: str
    organisation_id: str
    client_id: str
    policy_id: str
    principal_amount_pennies: int  # Amount in pennies
    apr_bps: int
    term_months: int
    broker_fee_bps: int
    status: AgreementStatusEnum
    signed_at: Optional[datetime]
    activated_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    @field_validator('id', 'organisation_id', 'client_id', 'policy_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: str
        }

# Instalment schemas
class InstalmentResponse(BaseModel):
    id: str
    agreement_id: str
    sequence_number: int
    due_date: datetime
    amount_pennies: int
    status: InstalmentStatusEnum
    created_at: datetime
    updated_at: Optional[datetime]

    @field_validator('id', 'agreement_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: str
        }

# Dashboard schemas
class DashboardResponse(BaseModel):
    active_agreements: int
    defaults: int
    terminated: int
    revenue_ytd: Decimal
    notifications: List[dict]

# Proposal schemas
class ProposalResponse(BaseModel):
    id: str
    broker_id: str
    broker_name: str
    broker_email: str
    insurance_type: str
    total_premium: Decimal
    currency: str
    expiry_date: datetime
    status: str
    created_at: datetime
    updated_at: datetime
    terms: Any
    custom_schedule: Optional[Any] = None
    
    @field_validator('id', 'broker_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: str
        }

# Pagination
class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int

class PaginatedResponse(BaseModel):
    data: List
    pagination: PaginationMeta


# ============================================================================
# User schemas
# ============================================================================

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime
    updated_at: Optional[datetime]

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True
        json_encoders = {uuid.UUID: str}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


# ============================================================================
# Organisation schemas
# ============================================================================

class OrganisationCreate(BaseModel):
    name: str
    org_type: OrgTypeEnum = OrgTypeEnum.BROKER


class OrganisationUpdate(BaseModel):
    name: Optional[str] = None


class OrganisationResponse(BaseModel):
    id: str
    name: str
    org_type: OrgTypeEnum
    status: OrganisationStatusEnum
    created_at: datetime
    updated_at: Optional[datetime]

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True
        json_encoders = {uuid.UUID: str}


# ============================================================================
# Membership schemas
# ============================================================================

class MembershipResponse(BaseModel):
    id: str
    organisation_id: str
    user_id: str
    role: MembershipRoleEnum
    status: MembershipStatusEnum
    created_at: datetime
    updated_at: Optional[datetime]
    # Included user info for convenience
    user_email: Optional[str] = None
    user_name: Optional[str] = None

    @field_validator('id', 'organisation_id', 'user_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True
        json_encoders = {uuid.UUID: str}


class MembershipUpdate(BaseModel):
    role: Optional[MembershipRoleEnum] = None
    status: Optional[MembershipStatusEnum] = None


# ============================================================================
# Invitation schemas
# ============================================================================

class InviteUserRequest(BaseModel):
    email: EmailStr
    role: MembershipRoleEnum = MembershipRoleEnum.MEMBER


class InvitationResponse(BaseModel):
    id: str
    organisation_id: str
    email: str
    role: MembershipRoleEnum
    expires_at: datetime
    accepted_at: Optional[datetime]
    created_at: datetime

    @field_validator('id', 'organisation_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True
        json_encoders = {uuid.UUID: str}


class InviteUserResponse(BaseModel):
    invitation: InvitationResponse
    invite_url: Optional[str] = None  # Only returned in dev/staging


# ============================================================================
# Auth schemas
# ============================================================================

class SignupWithOrgRequest(BaseModel):
    """Request to create a new organisation for an authenticated user."""
    name: str
    org_type: OrgTypeEnum = OrgTypeEnum.BROKER


class RedeemInvitationRequest(BaseModel):
    """Request to redeem an invitation token."""
    token: str


class AuthMeResponse(BaseModel):
    """Response for /api/auth/me endpoint."""
    user: UserResponse
    organisation: OrganisationResponse
    membership: MembershipResponse
