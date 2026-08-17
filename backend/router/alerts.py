from fastapi import APIRouter
from sqlalchemy import text
from database import engine

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get("/")
def get_alerts():

    # Return only recent active alerts (last 30 days) and prioritize by severity
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
          AND Alert_Date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
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


@router.put("/{alert_id}/dismiss")
def dismiss_alert(alert_id: int):

    query = text("""
        UPDATE alerts
        SET Status = 'Inactive'
        WHERE Alert_ID = :alert_id
    """)

    with engine.connect() as connection:
        connection.execute(query, {"alert_id": alert_id})

    return {"status": "ok", "alert_id": alert_id}


@router.post("/ack_all")
def acknowledge_all_alerts():

    query = text("""
        UPDATE alerts
        SET Status = 'Inactive'
        WHERE Status = 'Active'
          AND Severity IN ('HIGH','MEDIUM')
    """)

    with engine.connect() as connection:
        connection.execute(query)

    return {"status": "ok", "updated": True}


@router.get("/ack_all")
def acknowledge_all_alerts_get():
    # same behaviour as POST /ack_all — allow GET for compatibility
    query = text("""
        UPDATE alerts
        SET Status = 'Inactive'
        WHERE Status = 'Active'
          AND Severity IN ('HIGH','MEDIUM')
    """)

    with engine.connect() as connection:
        connection.execute(query)

    return {"status": "ok", "updated": True}