from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from datetime import datetime

router = APIRouter(tags=["System"])

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"
    
    return {
        "ok": db_status == "connected",
        "ts": datetime.utcnow().isoformat(),
        "database": db_status
    }