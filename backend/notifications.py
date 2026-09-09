from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


def build_notification_record(
    alert_id: int,
    title: str,
    message: str,
    severity: str = "INFO",
    link: str = "/alerts",
):
    return {
        "Alert_ID": alert_id,
        "Title": title,
        "Message": message,
        "Severity": severity,
        "link": link,
        "expires_at": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
    }


def cleanup_old_alerts(db):
    db.execute(text("""
        DELETE FROM notifications
        WHERE Created_At < DATE_SUB(NOW(), INTERVAL 7 DAY)
    """))

    db.execute(text("""
        DELETE FROM alerts
        WHERE Status = 'Active'
          AND Alert_Date < DATE_SUB(NOW(), INTERVAL 7 DAY)
    """))

    if hasattr(db, "commit"):
        db.commit()

    return {
        "status": "cleanup_complete"
    }


def create_notification_for_alert(
    db,
    alert_id: int,
    title: str,
    message: str,
    severity: str = "INFO",
    link: str = "/alerts",
):
    if alert_id is None:
        return None

    db.execute(text("""
        INSERT INTO notifications
        (
            Alert_ID,
            User_ID,
            Title,
            Message,
            Severity,
            Is_Read,
            Created_At
        )
        SELECT
            :alert_id,
            User_ID,
            :title,
            :message,
            :severity,
            0,
            NOW()
        FROM users
    """), {
        "alert_id": alert_id,
        "title": title,
        "message": message,
        "severity": severity,
    })

    # Only commit for Session objects. Connection objects are already managed by the
    # surrounding transaction (for example, in run_automatic_prediction()) and must not
    # be committed mid-transaction or the alert insert will fail and the alert will not
    # appear in the alert page.
    from sqlalchemy.orm import Session
    if isinstance(db, Session):
        db.commit()

    return build_notification_record(
        alert_id=alert_id,
        title=title,
        message=message,
        severity=severity,
        link=link,
    )


# =========================================================
# GET NOTIFICATIONS
# =========================================================

@router.get("/")
def get_notifications(
    db: Session = Depends(get_db)
):
    cleanup_old_alerts(db)

    query = text("""
        SELECT
            n.Notification_ID,
            n.Alert_ID,
            n.User_ID,
            n.Title,
            n.Message,
            n.Severity,
            n.Is_Read,
            n.Created_At,
            a.Alert_Category
        FROM notifications n
        INNER JOIN alerts a ON a.Alert_ID = n.Alert_ID
        WHERE a.Status = 'Active'
          AND a.Alert_Category IN ('DISEASE', 'MEDICINE')
        ORDER BY n.Created_At DESC
    """)

    result = db.execute(query).mappings().all()
    payload = []

    for row in result:
        item = dict(row)
        created = item.get("Created_At")
        if created:
            expires_at = created + timedelta(days=7)
            item["expires_at"] = expires_at.strftime("%Y-%m-%d %H:%M:%S")
        else:
            item["expires_at"] = None
        item["link"] = "/alerts"
        payload.append(item)

    return payload


# =========================================================
# NOTIFICATION COUNT
# Used by 🔔 bell
# =========================================================

@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db)
):
    cleanup_old_alerts(db)

    query = text("""
        SELECT COUNT(*) AS count
        FROM notifications n
        INNER JOIN alerts a ON a.Alert_ID = n.Alert_ID
        WHERE n.Is_Read = 0
          AND a.Status = 'Active'
          AND a.Alert_Category IN ('DISEASE', 'MEDICINE')
    """)

    result = db.execute(query).mappings().first()

    return {
        "count": result["count"] if result else 0
    }


# =========================================================
# MARK NOTIFICATION AS READ
# =========================================================

@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    cleanup_old_alerts(db)

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