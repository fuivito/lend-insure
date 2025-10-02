from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from decimal import Decimal
from models import BrokerRoleEnum, AgreementStatusEnum, InstalmentStatusEnum, PaymentStatusEnum, OrganisationStatusEnum, ProposalStatusEnum

# Client schemas
class ClientCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    dob: Optional[datetime] = None
    address: Optional[str] = None

class ClientResponse(BaseModel):
    id: str
    organisation_id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    dob: Optional[datetime]
    address: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Policy schemas
class PolicyCreate(BaseModel):
    client_id: str
    insurer_name: str
    product_type: str
    policy_number: str
    inception_date: datetime
    expiry_date: datetime
    gross_premium: Decimal

class PolicyResponse(BaseModel):
    id: str
    organisation_id: str
    client_id: str
    insurer_name: str
    product_type: str
    policy_number: str
    inception_date: datetime
    expiry_date: datetime
    gross_premium: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True

# Agreement schemas
class AgreementCreate(BaseModel):
    client_id: str
    policy_id: str
    principal_amount: Decimal
    apr_bps: int
    term_months: int
    start_date: Optional[datetime] = None

class AgreementResponse(BaseModel):
    id: str
    organisation_id: str
    client_id: str
    policy_id: str
    principal_amount: Decimal
    apr_bps: int
    term_months: int
    status: AgreementStatusEnum
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    outstanding_amount: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True

# Instalment schemas
class InstalmentResponse(BaseModel):
    id: str
    agreement_id: str
    sequence: int
    due_date: datetime
    amount_due: Decimal
    amount_paid: Decimal
    status: InstalmentStatusEnum
    
    class Config:
        from_attributes = True

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
    
    class Config:
        from_attributes = True

# Pagination
class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int

class PaginatedResponse(BaseModel):
    data: List
    pagination: PaginationMeta
