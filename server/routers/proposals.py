from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Proposal, ProposalStatusEnum
from schemas import ProposalResponse
from middleware.auth import get_current_user
from middleware.rbac import require_role

router = APIRouter(prefix="/api/customer/proposals", tags=["proposals"])

@router.get("", response_model=List[ProposalResponse])
def list_proposals(
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all proposals for the customer"""
    query = db.query(Proposal)
    
    # Filter by client (customer context)
    if current_user.get("client_id"):
        query = query.filter(Proposal.client_id == current_user["client_id"])
    
    # Filter by search term
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Proposal.broker_name.ilike(search_term)) |
            (Proposal.insurance_type.ilike(search_term))
        )
    
    # Filter by status
    if status:
        query = query.filter(Proposal.status == status)
    
    proposals = query.order_by(Proposal.created_at.desc()).all()
    return proposals

@router.get("/{proposal_id}", response_model=ProposalResponse)
def get_proposal(
    proposal_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific proposal by ID"""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check access (customer can only see their own proposals)
    if current_user.get("client_id") and proposal.client_id != current_user["client_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Mark as viewed if it's new
    if proposal.status == ProposalStatusEnum.NEW:
        proposal.status = ProposalStatusEnum.VIEWED
        db.commit()
        db.refresh(proposal)
    
    return proposal

@router.post("/{proposal_id}/accept")
def accept_proposal(
    proposal_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Accept a proposal"""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check access
    if current_user.get("client_id") and proposal.client_id != current_user["client_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    proposal.status = ProposalStatusEnum.ACCEPTED
    db.commit()
    db.refresh(proposal)
    
    return {"message": "Proposal accepted", "proposal": proposal}

@router.post("/{proposal_id}/decline")
def decline_proposal(
    proposal_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Decline a proposal"""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check access
    if current_user.get("client_id") and proposal.client_id != current_user["client_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    proposal.status = ProposalStatusEnum.DECLINED
    db.commit()
    db.refresh(proposal)
    
    return {"message": "Proposal declined", "proposal": proposal}
