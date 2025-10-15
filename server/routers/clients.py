from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from database import get_db
from middleware.auth import AuthContext, get_auth_context
from middleware.rbac import require_role
import models
import schemas
import math

router = APIRouter(prefix="/api/broker/clients", tags=["Broker - Clients"])

@router.get("")
async def list_clients(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    require_role("BROKER", "BROKER_ADMIN", "INTERNAL")(auth)
    
    query = db.query(models.Client)
    
    # Organisation scoping
    if auth.role != "INTERNAL":
        query = query.filter(models.Client.organisation_id == auth.organisation_id)
    
    # Search filter
    if search:
        query = query.filter(
            or_(
                models.Client.first_name.ilike(f"%{search}%"),
                models.Client.last_name.ilike(f"%{search}%"),
                models.Client.email.ilike(f"%{search}%")
            )
        )
    
    total = query.count()
    clients = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "data": clients,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": math.ceil(total / limit)
        }
    }

@router.get("/{id}")
async def get_client(
    id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    require_role("BROKER", "BROKER_ADMIN", "INTERNAL")(auth)
    
    query = db.query(models.Client).filter(models.Client.id == id)
    
    if auth.role != "INTERNAL":
        query = query.filter(models.Client.organisation_id == auth.organisation_id)
    
    client = query.first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return client

@router.post("", status_code=201)
async def create_client(
    client_data: schemas.ClientCreate,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    require_role("BROKER", "BROKER_ADMIN")(auth)
    
    client = models.Client(
        organisation_id=auth.organisation_id,
        **client_data.model_dump()
    )
    
    db.add(client)
    db.commit()
    db.refresh(client)
    
    # Audit log
    audit_log = models.AuditLog(
        organisation_id=auth.organisation_id,
        actor_type=auth.role,
        action="CREATE",
        entity="CLIENT",
        after={"id": client.id, "email": client.email}
    )
    db.add(audit_log)
    db.commit()
    
    return client
