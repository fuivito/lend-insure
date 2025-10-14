from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from decimal import Decimal
from ..database import get_db
from ..middleware.auth import AuthContext, get_auth_context
from ..middleware.rbac import require_role
from .. import models

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
    
    # Note: CommissionLine model doesn't exist in current database
    # For now, calculate revenue as a simple percentage of principal amounts
    revenue_ytd = Decimal(0)
    for agreement in agreements:
        # Simple calculation: 2% of principal amount as revenue
        commission = Decimal(agreement.principal_amount_pennies) / 100 * Decimal(0.02)
        revenue_ytd += commission
    
    # Note: AgreementEvent model doesn't exist in current database
    # For now, return empty notifications
    notifications = []
    
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
