from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
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
    require_role("BROKER", "BROKER_ADMIN", "INTERNAL")(auth)
    
    is_internal = auth.role == "INTERNAL"
    org_filter = {} if is_internal else {"organisation_id": auth.organisation_id}
    
    # Get agreement counts
    active_count = db.query(models.Agreement).filter_by(
        **org_filter, status=models.AgreementStatusEnum.ACTIVE
    ).count()
    
    defaulted_count = db.query(models.Agreement).filter_by(
        **org_filter, status=models.AgreementStatusEnum.DEFAULTED
    ).count()
    
    terminated_count = db.query(models.Agreement).filter_by(
        **org_filter, status=models.AgreementStatusEnum.TERMINATED
    ).count()
    
    # Calculate YTD revenue
    year_start = datetime(datetime.utcnow().year, 1, 1)
    
    query = db.query(models.Agreement).filter(
        models.Agreement.start_date >= year_start,
        models.Agreement.status.in_([
            models.AgreementStatusEnum.ACTIVE,
            models.AgreementStatusEnum.SIGNED
        ])
    )
    
    if not is_internal:
        query = query.filter(models.Agreement.organisation_id == auth.organisation_id)
    
    agreements = query.all()
    
    revenue_ytd = Decimal(0)
    for agreement in agreements:
        commission_sum = db.query(func.sum(models.CommissionLine.amount)).filter(
            models.CommissionLine.agreement_id == agreement.id
        ).scalar() or Decimal(0)
        revenue_ytd += commission_sum
    
    # Get recent notifications
    event_query = db.query(models.AgreementEvent).join(models.Agreement)
    
    if not is_internal:
        event_query = event_query.filter(
            models.Agreement.organisation_id == auth.organisation_id
        )
    
    recent_events = event_query.order_by(
        models.AgreementEvent.created_at.desc()
    ).limit(10).all()
    
    notifications = []
    for event in recent_events:
        client = db.query(models.Client).filter(
            models.Client.id == event.agreement.client_id
        ).first()
        
        notifications.append({
            "id": event.id,
            "type": event.type,
            "message": format_event_message(event.type, client),
            "timestamp": event.created_at.isoformat(),
            "agreement_id": event.agreement_id
        })
    
    return {
        "active_agreements": active_count,
        "defaults": defaulted_count,
        "terminated": terminated_count,
        "revenue_ytd": float(revenue_ytd),
        "notifications": notifications
    }

def format_event_message(event_type: str, client) -> str:
    client_name = f"{client.first_name} {client.last_name}"
    
    messages = {
        "AGREEMENT_CREATED": f"New agreement created for {client_name}",
        "AGREEMENT_PROPOSED": f"Agreement proposed to {client_name}",
        "AGREEMENT_SIGNED": f"{client_name} signed their agreement",
        "PAYMENT_RECEIVED": f"Payment received from {client_name}",
        "PAYMENT_MISSED": f"Payment missed by {client_name}"
    }
    
    return messages.get(event_type, f"Event: {event_type} for {client_name}")
