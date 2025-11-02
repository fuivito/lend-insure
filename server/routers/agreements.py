from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
from database import get_db
from middleware.auth import AuthContext, get_auth_context
from middleware.rbac import require_role
import models
import schemas
import math

router = APIRouter(prefix="/api/broker/agreements", tags=["Broker - Agreements"])

@router.get("")
async def list_agreements(
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    require_role("BROKER", "BROKER_ADMIN", "INTERNAL")(auth)
    
    query = db.query(models.Agreement)
    
    # Organisation scoping
    if auth.role != "INTERNAL":
        query = query.filter(models.Agreement.organisation_id == auth.organisation_id)
    
    if status:
        query = query.filter(models.Agreement.status == status)
    if client_id:
        query = query.filter(models.Agreement.client_id == client_id)
    
    total = query.count()
    agreements = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "data": agreements,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": math.ceil(total / limit)
        }
    }

@router.get("/{id}")
async def get_agreement(
    id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    require_role("BROKER", "BROKER_ADMIN", "INTERNAL")(auth)
    
    query = db.query(models.Agreement).filter(models.Agreement.id == id)
    
    if auth.role != "INTERNAL":
        query = query.filter(models.Agreement.organisation_id == auth.organisation_id)
    
    agreement = query.first()
    
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    
    return agreement

@router.post("", status_code=201)
async def create_agreement(
    agreement_data: schemas.AgreementCreate,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    require_role("BROKER", "BROKER_ADMIN")(auth)
    
    # Verify client and policy
    client = db.query(models.Client).filter(
        models.Client.id == uuid.UUID(agreement_data.client_id),
        models.Client.organisation_id == uuid.UUID(auth.organisation_id)
    ).first()
    
    policy = db.query(models.Policy).filter(
        models.Policy.id == uuid.UUID(agreement_data.policy_id),
        models.Policy.organisation_id == uuid.UUID(auth.organisation_id)
    ).first()
    
    if not client or not policy:
        raise HTTPException(status_code=404, detail="Client or policy not found")
    
    # Calculate instalment schedule
    principal = agreement_data.principal_amount_pennies / 100  # Convert pennies to pounds
    term_months = agreement_data.term_months
    apr_bps = agreement_data.apr_bps
    monthly_rate = (apr_bps / 10000) / 12
    monthly_payment = principal * monthly_rate / (1 - pow(1 + monthly_rate, -term_months))
    
    signed_at = agreement_data.signed_at or datetime.utcnow()
    activated_at = signed_at + timedelta(days=1)  # Assume activated next day
    
    # Create agreement with explicit timestamps
    now = datetime.utcnow()
    agreement = models.Agreement(
        organisation_id=uuid.UUID(auth.organisation_id),
        client_id=uuid.UUID(agreement_data.client_id),
        policy_id=uuid.UUID(agreement_data.policy_id),
        principal_amount_pennies=agreement_data.principal_amount_pennies,
        apr_bps=agreement_data.apr_bps,
        term_months=agreement_data.term_months,
        broker_fee_bps=agreement_data.broker_fee_bps,
        status=models.AgreementStatusEnum.DRAFT,
        signed_at=signed_at,
        activated_at=activated_at,
        created_at=now,
        updated_at=now
    )
    
    db.add(agreement)
    db.flush()
    
    # Create instalments
    for i in range(term_months):
        due_date = signed_at + timedelta(days=i * 30)
        instalment = models.Instalment(
            agreement_id=agreement.id,
            sequence_number=i + 1,
            due_date=due_date,
            amount_pennies=int(round(monthly_payment * 100)),  # Convert to pennies
            status=models.InstalmentStatusEnum.UPCOMING
        )
        db.add(instalment)
    
    # Note: AgreementEvent model doesn't exist in current database, skipping event creation
    
    # Audit log
    audit_log = models.AuditLog(
        organisation_id=uuid.UUID(auth.organisation_id),
        actor_type=auth.role,
        action="CREATE",
        entity="AGREEMENT",
        after={"id": str(agreement.id)}
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(agreement)
    
    return agreement

@router.post("/{id}/propose")
async def propose_agreement(
    id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    require_role("BROKER", "BROKER_ADMIN")(auth)
    
    agreement = db.query(models.Agreement).filter(
        models.Agreement.id == id,
        models.Agreement.organisation_id == auth.organisation_id,
        models.Agreement.status == models.AgreementStatusEnum.DRAFT
    ).first()
    
    if not agreement:
        raise HTTPException(
            status_code=404,
            detail="Agreement not found or not in DRAFT status"
        )
    
    agreement.status = models.AgreementStatusEnum.PROPOSED
    
    # Note: AgreementEvent model doesn't exist in current database, skipping event creation
    
    db.commit()
    db.refresh(agreement)
    
    return agreement

@router.delete("/{id}")
async def delete_agreement(
    id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    require_role("BROKER", "BROKER_ADMIN")(auth)
    
    # Find the agreement
    query = db.query(models.Agreement).filter(models.Agreement.id == id)
    
    if auth.role != "INTERNAL":
        query = query.filter(models.Agreement.organisation_id == auth.organisation_id)
    
    agreement = query.first()
    
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    
    # Only allow deletion of draft, proposed, or pending agreements
    if agreement.status not in [models.AgreementStatusEnum.DRAFT, models.AgreementStatusEnum.PROPOSED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete agreement with status {agreement.status}. Only DRAFT and PROPOSED agreements can be deleted."
        )
    
    # Store agreement data for audit log
    agreement_data = {
        "id": str(agreement.id),
        "client_id": str(agreement.client_id),
        "policy_id": str(agreement.policy_id),
        "status": str(agreement.status),
        "principal_amount_pennies": agreement.principal_amount_pennies
    }
    
    # Delete the agreement (instalments will be cascade deleted)
    db.delete(agreement)
    
    # Audit log
    audit_log = models.AuditLog(
        organisation_id=auth.organisation_id,
        actor_type=auth.role,
        action="DELETE",
        entity="AGREEMENT",
        before=agreement_data
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Agreement deleted successfully"}
