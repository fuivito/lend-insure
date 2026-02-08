from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from decimal import Decimal
from database import get_db
from middleware.auth import AuthContext, get_auth_context
from middleware.rbac import require_role
import models

router = APIRouter(prefix="/api/broker/dashboard", tags=["Broker - Dashboard"])

@router.get("")
async def get_dashboard(
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context)
):
    require_role("OWNER", "ADMIN", "MEMBER", "READ_ONLY")(auth)
    org_id = auth.organisation_id

    # Client stats
    total_clients = db.query(models.Client).filter(
        models.Client.organisation_id == org_id
    ).count()

    # Agreement stats by status
    agreement_query = db.query(models.Agreement).filter(
        models.Agreement.organisation_id == org_id
    )

    total_agreements = agreement_query.count()
    draft_count = agreement_query.filter(models.Agreement.status == models.AgreementStatusEnum.DRAFT).count()
    proposed_count = agreement_query.filter(models.Agreement.status == models.AgreementStatusEnum.PROPOSED).count()
    active_count = agreement_query.filter(models.Agreement.status == models.AgreementStatusEnum.ACTIVE).count()
    signed_count = agreement_query.filter(models.Agreement.status == models.AgreementStatusEnum.SIGNED).count()

    # Total financed amount (active + signed agreements)
    total_financed = db.query(func.sum(models.Agreement.principal_amount_pennies)).filter(
        models.Agreement.organisation_id == org_id,
        models.Agreement.status.in_([
            models.AgreementStatusEnum.ACTIVE,
            models.AgreementStatusEnum.SIGNED
        ])
    ).scalar() or 0

    # Recent clients (last 5)
    recent_clients = db.query(models.Client).filter(
        models.Client.organisation_id == org_id
    ).order_by(desc(models.Client.created_at)).limit(5).all()

    # Recent agreements (last 5) with client info
    recent_agreements = db.query(models.Agreement).filter(
        models.Agreement.organisation_id == org_id
    ).order_by(desc(models.Agreement.created_at)).limit(5).all()

    # Proposed agreements list (for follow-up tracking)
    proposed_agreements_list = db.query(models.Agreement).filter(
        models.Agreement.organisation_id == org_id,
        models.Agreement.status == models.AgreementStatusEnum.PROPOSED
    ).order_by(desc(models.Agreement.created_at)).limit(10).all()

    # Format recent clients
    recent_clients_data = [
        {
            "id": str(c.id),
            "name": f"{c.first_name} {c.last_name}",
            "email": c.email,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in recent_clients
    ]

    # Format recent agreements with client names
    recent_agreements_data = []
    for a in recent_agreements:
        client = db.query(models.Client).filter(models.Client.id == a.client_id).first()
        recent_agreements_data.append({
            "id": str(a.id),
            "client_name": f"{client.first_name} {client.last_name}" if client else "Unknown",
            "principal_amount_pennies": a.principal_amount_pennies,
            "status": a.status.value,
            "created_at": a.created_at.isoformat() if a.created_at else None
        })

    # Format proposed agreements for follow-up tracking
    proposed_agreements_data = []
    for a in proposed_agreements_list:
        client = db.query(models.Client).filter(models.Client.id == a.client_id).first()
        proposed_agreements_data.append({
            "id": str(a.id),
            "client_name": f"{client.first_name} {client.last_name}" if client else "Unknown",
            "client_email": client.email if client else None,
            "client_phone": client.phone if client else None,
            "principal_amount_pennies": a.principal_amount_pennies,
            "created_at": a.created_at.isoformat() if a.created_at else None
        })

    return {
        "total_clients": total_clients,
        "total_agreements": total_agreements,
        "draft_agreements": draft_count,
        "proposed_agreements": proposed_count,
        "signed_agreements": signed_count,
        "active_agreements": active_count,
        "total_financed_pennies": total_financed,
        "recent_clients": recent_clients_data,
        "recent_agreements": recent_agreements_data,
        "proposed_agreements_list": proposed_agreements_data
    }
