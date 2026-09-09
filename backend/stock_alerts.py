from datetime import date

from sqlalchemy import text
from database import engine
from notifications import create_notification_for_alert


def generate_medicine_alerts():

    query = text("""
        SELECT
            Medicine_ID,
            Medicine_Name,
            Current_Stock,
            Reorder_Level,
            Expiry_Date
        FROM medicines
    """)

    with engine.connect() as connection:

        medicines = connection.execute(query).mappings().all()

    alerts_created = 0

    with engine.begin() as connection:

        for medicine in medicines:

            medicine_id = medicine["Medicine_ID"]
            name = medicine["Medicine_Name"]

            stock = medicine["Current_Stock"] or 0
            reorder = medicine["Reorder_Level"] or 0
            expiry = medicine["Expiry_Date"]

            # -----------------------------------------
            # OUT OF STOCK
            # -----------------------------------------

            if stock == 0:

                existing = connection.execute(
                    text("""
                        SELECT Alert_ID
                        FROM alerts
                        WHERE Medicine_ID = :medicine_id
                          AND Alert_Type IN ('MEDICINE_STOCK', 'MEDICINE_EXPIRY')
                          AND Status = 'Active'
                        LIMIT 1
                    """),
                    {"medicine_id": medicine_id}
                ).fetchone()

                if existing is None:
                    result = connection.execute(
                        text("""
                            INSERT INTO alerts
                            (
                                Medicine_ID,
                                Disease,
                                Village,
                                Alert_Type,
                                Severity,
                                Alert_Category,
                                Alert_Message,
                                Alert_Date,
                                Status
                            )
                            VALUES
                            (
                                :medicine_id,
                                NULL,
                                NULL,
                                'MEDICINE_STOCK',
                                'HIGH',
                                'MEDICINE',
                                :message,
                                NOW(),
                                'Active'
                            )
                        """),
                        {
                            "medicine_id": medicine_id,
                            "message":
                                f"{name} is OUT OF STOCK."
                        }
                    )

                    alert_id = getattr(result, "lastrowid", None)
                    create_notification_for_alert(
                        connection,
                        alert_id,
                        f"Medicine alert: {name}",
                        f"{name} is OUT OF STOCK.",
                        "HIGH",
                        "/alerts",
                    )

                    alerts_created += 1

            # -----------------------------------------
            # LOW STOCK
            # -----------------------------------------

            elif stock <= reorder:

                existing = connection.execute(
                    text("""
                        SELECT Alert_ID
                        FROM alerts
                        WHERE Medicine_ID = :medicine_id
                          AND Alert_Type = 'MEDICINE_STOCK'
                          AND Status = 'Active'
                        LIMIT 1
                    """),
                    {"medicine_id": medicine_id}
                ).fetchone()

                if existing is None:
                    result = connection.execute(
                        text("""
                            INSERT INTO alerts
                            (
                                Medicine_ID,
                                Disease,
                                Village,
                                Alert_Type,
                                Severity,
                                Alert_Category,
                                Alert_Message,
                                Alert_Date,
                                Status
                            )
                            VALUES
                            (
                                :medicine_id,
                                NULL,
                                NULL,
                                'MEDICINE_STOCK',
                                'MEDIUM',
                                'MEDICINE',
                                :message,
                                NOW(),
                                'Active'
                            )
                        """),
                        {
                            "medicine_id": medicine_id,
                            "message":
                                f"{name} is LOW IN STOCK. "
                                f"Only {stock} units remaining."
                        }
                    )

                    alert_id = getattr(result, "lastrowid", None)
                    create_notification_for_alert(
                        connection,
                        alert_id,
                        f"Medicine alert: {name}",
                        f"{name} is LOW IN STOCK. Only {stock} units remaining.",
                        "MEDIUM",
                        "/alerts",
                    )

                    alerts_created += 1

            # -----------------------------------------
            # EXPIRED
            # -----------------------------------------

            if expiry and expiry < date.today():

                existing = connection.execute(
                    text("""
                        SELECT Alert_ID
                        FROM alerts
                        WHERE Medicine_ID = :medicine_id
                          AND Alert_Type = 'MEDICINE_EXPIRY'
                          AND Status = 'Active'
                        LIMIT 1
                    """),
                    {"medicine_id": medicine_id}
                ).fetchone()

                if existing is None:
                    result = connection.execute(
                        text("""
                            INSERT INTO alerts
                            (
                                Medicine_ID,
                                Disease,
                                Village,
                                Alert_Type,
                                Severity,
                                Alert_Category,
                                Alert_Message,
                                Alert_Date,
                                Status
                            )
                            VALUES
                            (
                                :medicine_id,
                                NULL,
                                NULL,
                                'MEDICINE_EXPIRY',
                                'HIGH',
                                'MEDICINE',
                                :message,
                                NOW(),
                                'Active'
                            )
                        """),
                        {
                            "medicine_id": medicine_id,
                            "message":
                                f"{name} has EXPIRED. "
                                f"Do not dispense this medicine."
                        }
                    )

                    alert_id = getattr(result, "lastrowid", None)
                    create_notification_for_alert(
                        connection,
                        alert_id,
                        f"Medicine expiry: {name}",
                        f"{name} has EXPIRED. Do not dispense this medicine.",
                        "HIGH",
                        "/alerts",
                    )

                    alerts_created += 1

    return {
        "status": "success",
        "alerts_created": alerts_created
    }