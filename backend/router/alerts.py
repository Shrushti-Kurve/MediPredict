from fastapi import APIRouter
from sqlalchemy import text
from database import engine

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("")
def get_alerts():

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
        ORDER BY Alert_Date DESC
    """)

    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    return {
        "count": len(rows),
        "alerts": [dict(row) for row in rows]
    }