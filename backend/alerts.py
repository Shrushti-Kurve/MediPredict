from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


# =========================================================
# GET ALL ACTIVE ALERTS (Only DISEASE and MEDICINE categories)
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
        WHERE Status = 'Active'
          AND Alert_Date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND Alert_Category IN ('DISEASE', 'MEDICINE')
        ORDER BY
            CASE
                WHEN Severity IN ('HIGH', 'CRITICAL', 'DANGER') THEN 1
                WHEN Severity IN ('MEDIUM', 'WARNING') THEN 2
                ELSE 3
            END,
            Alert_Date DESC,
            Alert_ID DESC
    """)

    result = db.execute(query).mappings().all()
    return [dict(row) for row in result]


# =========================================================
# GET UNREAD/ACTIVE ALERT COUNT
# =========================================================

@router.get("/count")
def alert_count(
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT COUNT(*) AS count
        FROM alerts
        WHERE Status = 'Active'
          AND Alert_Date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND Alert_Category IN ('DISEASE', 'MEDICINE')
    """)

    result = db.execute(query).mappings().first()
    return {
        "count": result["count"] if result else 0
    }