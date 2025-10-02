from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal
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
        models.Client.id == agreement_data.client_id,
        models.Client.organisation_id == auth.organisation_id
    ).first()
    
    policy = db.query(models.Policy).filter(
        models.Policy.id == agreement_data.policy_id,
        models.Policy.organisation_id == auth.organisation_id
    ).first()
    
    if not client or not policy:
        raise HTTPException(status_code=404, detail="Client or policy not found")
    
    # Calculate instalment schedule
    principal = float(agreement_data.principal_amount)
    term_months = agreement_data.term_months
    apr_bps = agreement_data.apr_bps
    monthly_rate = (apr_bps / 10000) / 12
    monthly_payment = principal * monthly_rate / (1 - pow(1 + monthly_rate, -term_months))
    
    start_date = agreement_data.start_date or datetime.utcnow()
    end_date = start_date + timedelta(days=term_months * 30)
    
    # Create agreement
    agreement = models.Agreement(
        organisation_id=auth.organisation_id,
        client_id=agreement_data.client_id,
        policy_id=agreement_data.policy_id,
        principal_amount=agreement_data.principal_amount,
        apr_bps=agreement_data.apr_bps,
        term_months=agreement_data.term_months,
        status=models.AgreementStatusEnum.DRAFT,
        start_date=start_date,
        end_date=end_date,
        outstanding_amount=agreement_data.principal_amount
    )
    
    db.add(agreement)
    db.flush()
    
    # Create instalments
    for i in range(term_months):
        due_date = start_date + timedelta(days=i * 30)
        instalment = models.Instalment(
            agreement_id=agreement.id,
            sequence=i + 1,
            due_date=due_date,
            amount_due=Decimal(str(round(monthly_payment, 2))),
            amount_paid=Decimal(0),
            status=models.InstalmentStatusEnum.UPCOMING
        )
        db.add(instalment)
    
    # Create event
    event = models.AgreementEvent(
        agreement_id=agreement.id,
        type="AGREEMENT_CREATED",
        actor_type=auth.role,
        meta={"user_id": auth.user_id}
    )
    db.add(event)
    
    # Audit log
    audit_log = models.AuditLog(
        organisation_id=auth.organisation_id,
        actor_type=auth.role,
        action="CREATE",
        entity="AGREEMENT",
        after={"id": agreement.id}
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
    
    # Create event
    event = models.AgreementEvent(
        agreement_id=id,
        type="AGREEMENT_PROPOSED",
        actor_type=auth.role,
        meta={"user_id": auth.user_id}
    )
    db.add(event)
    
    db.commit()
    db.refresh(agreement)
    
    return agreement
