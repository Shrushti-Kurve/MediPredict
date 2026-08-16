from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy import engine

from database import get_db

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


# =========================================================
# GET ALL ACTIVE ALERTS
# =========================================================

@router.get("/count")
def get_alert_count():

    query = text("""
        SELECT COUNT(*) AS total
        FROM alerts
        WHERE Status = 'Active'
          AND Severity IN ('HIGH', 'MEDIUM')
    """)

    with engine.connect() as connection:
        result = connection.execute(query).mappings().first()

    return {
        "count": result["total"] if result else 0
    }
from sqlalchemy import text
from database import engine


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
        ORDER BY Alert_Date DESC, Alert_ID DESC
    """)

    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    return [dict(row) for row in rows]