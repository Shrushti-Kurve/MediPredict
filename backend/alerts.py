from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


# =========================================================
# GET ALL ACTIVE ALERTS
# =========================================================

@router.get("/")
def get_alerts(
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            Alert_ID,
            Medicine_ID,
            Disease,
            Village,
            Alert_Type,
            Severity,
            Alert_Category,
            Alert_Message,
            Alert_Date,
            Status
        FROM alerts
        ORDER BY Alert_Date DESC
    """)

    result = db.execute(query).mappings().all()

    return [dict(row) for row in result]


# =========================================================
# GET UNREAD/ACTIVE ALERT COUNT
# Used later for notification bell
# =========================================================

@router.get("/count")
def alert_count(
    db: Session = Depends(get_db)
):

    query = text("""
        SELECT COUNT(*) AS count
        FROM alerts
        WHERE Status = 'Active'
    """)

    result = db.execute(query).mappings().first()

    return {
        "count": result["count"]
    }