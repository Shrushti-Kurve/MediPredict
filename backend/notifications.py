from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# GET NOTIFICATIONS
# =========================================================

@router.get("/")
def get_notifications(
    db: Session = Depends(get_db)
):

    query = text("""
        SELECT
            Notification_ID,
            Alert_ID,
            User_ID,
            Title,
            Message,
            Severity,
            Is_Read,
            Created_At
        FROM notifications
        ORDER BY Created_At DESC
    """)

    result = db.execute(query).mappings().all()

    return [dict(row) for row in result]


# =========================================================
# NOTIFICATION COUNT
# Used by 🔔 bell
# =========================================================

@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db)
):

    query = text("""
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE Is_Read = 0
    """)

    result = db.execute(query).mappings().first()

    return {
        "count": result["count"]
    }


# =========================================================
# MARK NOTIFICATION AS READ
# =========================================================

@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db)
):

    query = text("""
        UPDATE notifications
        SET Is_Read = 1
        WHERE Notification_ID = :notification_id
    """)

    db.execute(
        query,
        {
            "notification_id": notification_id
        }
    )

    db.commit()

    return {
        "status": "success",
        "message": "Notification marked as read"
    }