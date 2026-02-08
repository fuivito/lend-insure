from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from middleware.auth import AuthContext, get_auth_context
from middleware.rbac import require_minimum_role
import models
import schemas

router = APIRouter(prefix="/api/broker/policies", tags=["Broker - Policies"])

@router.post("", status_code=201)
async def create_policy(
    policy_data: schemas.PolicyCreate,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    # MEMBER+ can create policies
    require_minimum_role("MEMBER")(auth)
    
    # Verify client belongs to organisation
    client = db.query(models.Client).filter(
        models.Client.id == policy_data.client_id,
        models.Client.organisation_id == auth.organisation_id
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Create policy with explicit timestamps
    now = datetime.utcnow()
    
    policy = models.Policy(
        organisation_id=auth.organisation_id,
        created_at=now,
        updated_at=now,
        **policy_data.model_dump()
    )
    
    db.add(policy)
    db.commit()
    db.refresh(policy)
    
    # Audit log
    audit_log = models.AuditLog(
        organisation_id=auth.organisation_id,
        actor_type=auth.role,
        action="CREATE",
        entity="POLICY",
        after={"id": str(policy.id), "policy_number": policy.policy_number}
    )
    db.add(audit_log)
    db.commit()
    
    return schemas.PolicyResponse.model_validate(policy)

@router.get("")
async def list_policies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    # Any authenticated user can list policies
    require_minimum_role("READ_ONLY")(auth)

    # Always filter by organisation
    policies = db.query(models.Policy).filter(
        models.Policy.organisation_id == auth.organisation_id
    ).offset(skip).limit(limit).all()
    
    return policies

@router.get("/{id}")
async def get_policy(
    id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    # Any authenticated user can view a policy
    require_minimum_role("READ_ONLY")(auth)

    policy = db.query(models.Policy).filter(
        models.Policy.id == id,
        models.Policy.organisation_id == auth.organisation_id
    ).first()
    
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    return policy
