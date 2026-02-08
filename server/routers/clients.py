from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import datetime
from database import get_db
from middleware.auth import AuthContext, get_auth_context
from middleware.rbac import require_minimum_role
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
    # Any authenticated user can list clients
    require_minimum_role("READ_ONLY")(auth)

    # Always filter by organisation
    query = db.query(models.Client).filter(
        models.Client.organisation_id == auth.organisation_id
    )
    
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
    # Any authenticated user can view a client
    require_minimum_role("READ_ONLY")(auth)

    query = db.query(models.Client).filter(
        models.Client.id == id,
        models.Client.organisation_id == auth.organisation_id
    )
    
    client = query.first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return client

@router.put("/{id}")
async def update_client(
    id: str,
    client_data: schemas.ClientUpdate,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    # MEMBER+ can update clients
    require_minimum_role("MEMBER")(auth)

    # Find the client within user's organisation
    client = db.query(models.Client).filter(
        models.Client.id == id,
        models.Client.organisation_id == auth.organisation_id
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Store original data for audit log
    original_data = {
        "id": str(client.id),
        "first_name": client.first_name,
        "last_name": client.last_name,
        "email": client.email,
        "phone": client.phone,
        "address_line1": client.address_line1,
        "address_line2": client.address_line2,
        "city": client.city,
        "postcode": client.postcode
    }
    
    # Update only provided fields
    update_data = client_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    # Update timestamp
    client.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(client)
    
    # Audit log
    audit_log = models.AuditLog(
        organisation_id=auth.organisation_id,
        actor_type=auth.role,
        action="UPDATE",
        entity="CLIENT",
        before=original_data,
        after={
            "id": str(client.id),
            "first_name": client.first_name,
            "last_name": client.last_name,
            "email": client.email,
            "phone": client.phone,
            "address_line1": client.address_line1,
            "address_line2": client.address_line2,
            "city": client.city,
            "postcode": client.postcode
        }
    )
    db.add(audit_log)
    db.commit()
    
    return schemas.ClientResponse.model_validate(client)

@router.delete("/{id}")
async def delete_client(
    id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    # ADMIN+ can delete clients
    require_minimum_role("ADMIN")(auth)

    # Find the client within user's organisation
    client = db.query(models.Client).filter(
        models.Client.id == id,
        models.Client.organisation_id == auth.organisation_id
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Check if client has any agreements
    agreements_count = db.query(models.Agreement).filter(
        models.Agreement.client_id == id,
        models.Agreement.organisation_id == auth.organisation_id
    ).count()
    
    if agreements_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete client with {agreements_count} active agreement(s). Please delete agreements first."
        )
    
    # Store client data for audit log
    client_data = {
        "id": str(client.id),
        "email": client.email,
        "first_name": client.first_name,
        "last_name": client.last_name
    }
    
    # Delete the client
    db.delete(client)
    
    # Audit log
    audit_log = models.AuditLog(
        organisation_id=auth.organisation_id,
        actor_type=auth.role,
        action="DELETE",
        entity="CLIENT",
        before=client_data
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Client deleted successfully"}

@router.post("", status_code=201)
async def create_client(
    client_data: schemas.ClientCreate,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    # MEMBER+ can create clients
    require_minimum_role("MEMBER")(auth)
    
    print("=== DEBUGGING CLIENT CREATION ===")
    print("1. Incoming client_data:", client_data)
    print("2. client_data.model_dump():", client_data.model_dump())
    print("3. auth.organisation_id:", auth.organisation_id)

    # Create client object with explicit timestamp
    now = datetime.utcnow()
    
    client = models.Client(
        organisation_id=auth.organisation_id,
        created_at=now,
        updated_at=now,
        **client_data.model_dump()
    )

    print("4. Created client object:", client)
    print("5. Client attributes:", client.__dict__)
    
    db.add(client)
    db.commit()
    db.refresh(client)
    
    # Audit log
    audit_log = models.AuditLog(
        organisation_id=auth.organisation_id,
        actor_type=auth.role,
        action="CREATE",
        entity="CLIENT",
        after={"id": str(client.id), "email": client.email}
    )
    db.add(audit_log)
    db.commit()
    
    return client
