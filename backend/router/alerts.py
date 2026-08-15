from fastapi import APIRouter
from sqlalchemy import text
from database import engine

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get("/")
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
          AND Severity IN ('HIGH', 'MEDIUM')
        ORDER BY
            CASE
                WHEN Severity = 'HIGH' THEN 1
                WHEN Severity = 'MEDIUM' THEN 2
                ELSE 3
            END,
            Alert_Date DESC,
            Alert_ID DESC
    """)

    with engine.connect() as connection:

        rows = connection.execute(query).mappings().all()

    return [dict(row) for row in rows]


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