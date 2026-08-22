from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(tags=["Health Check"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint for the load balancer to monitor DB and API connectivity.
    """
    try:
        # Simple query to check db connection
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "database": db_status
    }
