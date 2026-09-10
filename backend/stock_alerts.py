from datetime import date, timedelta
from sqlalchemy import text
from database import engine
from notifications import create_notification_for_alert

STOCK_THRESHOLD = 50


def evaluate_medicine_alerts(medicine_id=None, connection=None):
    """
    Evaluates current stock and expiry conditions for medicines against:
    - Minimum threshold = 50
    - stock == 0 -> OUT OF STOCK (HIGH)
    - 0 < stock <= 50 -> LOW STOCK (MEDIUM)
    - stock > 50 -> Deactivate active low stock/out of stock alerts
    - expiry < today -> EXPIRED (HIGH)
    - today <= expiry <= today + 30 days -> APPROACHING EXPIRY (MEDIUM)
    - expiry > today + 30 days -> Deactivate active expiry alerts
    """
    today = date.today()
    expiring_horizon = today + timedelta(days=30)

    def _process(conn):
        if medicine_id:
            query = text("""
                SELECT Medicine_ID, Medicine_Name, Current_Stock, Reorder_Level, Expiry_Date
                FROM medicines
                WHERE Medicine_ID = :medicine_id
            """)
            meds = conn.execute(query, {"medicine_id": medicine_id}).mappings().all()
        else:
            query = text("""
                SELECT Medicine_ID, Medicine_Name, Current_Stock, Reorder_Level, Expiry_Date
                FROM medicines
            """)
            meds = conn.execute(query).mappings().all()

        results = []

        for med in meds:
            m_id = med["Medicine_ID"]
            name = med["Medicine_Name"]
            stock = med["Current_Stock"] if med["Current_Stock"] is not None else 0
            expiry = med["Expiry_Date"]
            if hasattr(expiry, "date"):
                expiry = expiry.date()

            # -------------------------------------------------------------
            # 1. STOCK LEVEL EVALUATION (Threshold = 50)
            # -------------------------------------------------------------
            if stock > STOCK_THRESHOLD:
                # Safely above threshold -> resolve any active stock alerts
                conn.execute(text("""
                    UPDATE alerts
                    SET Status = 'Inactive'
                    WHERE Medicine_ID = :med_id
                      AND Alert_Type IN ('MEDICINE_LOW_STOCK', 'MEDICINE_OUT_OF_STOCK', 'MEDICINE_STOCK')
                      AND Status = 'Active'
                """), {"med_id": m_id})

            elif stock == 0:
                # Deactivate low stock alerts if previously present
                conn.execute(text("""
                    UPDATE alerts
                    SET Status = 'Inactive'
                    WHERE Medicine_ID = :med_id
                      AND Alert_Type = 'MEDICINE_LOW_STOCK'
                      AND Status = 'Active'
                """), {"med_id": m_id})

                # Check if active OUT_OF_STOCK alert already exists
                existing_out = conn.execute(text("""
                    SELECT Alert_ID FROM alerts
                    WHERE Medicine_ID = :med_id
                      AND Alert_Type = 'MEDICINE_OUT_OF_STOCK'
                      AND Status = 'Active'
                    LIMIT 1
                """), {"med_id": m_id}).fetchone()

                msg = f"{name} is OUT OF STOCK. Immediate restocking required."
                if existing_out:
                    conn.execute(text("""
                        UPDATE alerts
                        SET Alert_Message = :msg, Alert_Date = NOW()
                        WHERE Alert_ID = :alert_id
                    """), {"msg": msg, "alert_id": existing_out[0]})
                else:
                    res = conn.execute(text("""
                        INSERT INTO alerts
                        (Medicine_ID, Disease, Village, Alert_Type, Severity, Alert_Category, Alert_Message, Alert_Date, Status)
                        VALUES
                        (:med_id, NULL, NULL, 'MEDICINE_OUT_OF_STOCK', 'HIGH', 'MEDICINE', :msg, NOW(), 'Active')
                    """), {"med_id": m_id, "msg": msg})
                    new_alert_id = getattr(res, "lastrowid", None)
                    create_notification_for_alert(
                        conn,
                        new_alert_id,
                        f"Medicine Out of Stock: {name}",
                        msg,
                        "HIGH",
                        "/alerts"
                    )

            else:
                # 0 < stock <= STOCK_THRESHOLD (Low stock)
                conn.execute(text("""
                    UPDATE alerts
                    SET Status = 'Inactive'
                    WHERE Medicine_ID = :med_id
                      AND Alert_Type = 'MEDICINE_OUT_OF_STOCK'
                      AND Status = 'Active'
                """), {"med_id": m_id})

                existing_low = conn.execute(text("""
                    SELECT Alert_ID FROM alerts
                    WHERE Medicine_ID = :med_id
                      AND Alert_Type = 'MEDICINE_LOW_STOCK'
                      AND Status = 'Active'
                    LIMIT 1
                """), {"med_id": m_id}).fetchone()

                msg = f"{name} stock is LOW. Only {stock} units remaining (Minimum threshold is {STOCK_THRESHOLD})."
                if existing_low:
                    conn.execute(text("""
                        UPDATE alerts
                        SET Alert_Message = :msg, Alert_Date = NOW()
                        WHERE Alert_ID = :alert_id
                    """), {"msg": msg, "alert_id": existing_low[0]})
                else:
                    res = conn.execute(text("""
                        INSERT INTO alerts
                        (Medicine_ID, Disease, Village, Alert_Type, Severity, Alert_Category, Alert_Message, Alert_Date, Status)
                        VALUES
                        (:med_id, NULL, NULL, 'MEDICINE_LOW_STOCK', 'MEDIUM', 'MEDICINE', :msg, NOW(), 'Active')
                    """), {"med_id": m_id, "msg": msg})
                    new_alert_id = getattr(res, "lastrowid", None)
                    create_notification_for_alert(
                        conn,
                        new_alert_id,
                        f"Medicine Low Stock: {name}",
                        msg,
                        "MEDIUM",
                        "/alerts"
                    )

            # -------------------------------------------------------------
            # 2. EXPIRY EVALUATION
            # -------------------------------------------------------------
            if expiry:
                if expiry < today:
                    # Expired
                    conn.execute(text("""
                        UPDATE alerts
                        SET Status = 'Inactive'
                        WHERE Medicine_ID = :med_id
                          AND Alert_Type IN ('MEDICINE_EXPIRING', 'MEDICINE_EXPIRY_WARNING')
                          AND Status = 'Active'
                    """), {"med_id": m_id})

                    existing_exp = conn.execute(text("""
                        SELECT Alert_ID FROM alerts
                        WHERE Medicine_ID = :med_id
                          AND Alert_Type = 'MEDICINE_EXPIRED'
                          AND Status = 'Active'
                        LIMIT 1
                    """), {"med_id": m_id}).fetchone()

                    msg = f"{name} has EXPIRED ({expiry}). Remove it from pharmacy stock immediately."
                    if existing_exp:
                        conn.execute(text("""
                            UPDATE alerts
                            SET Alert_Message = :msg, Alert_Date = NOW()
                            WHERE Alert_ID = :alert_id
                        """), {"msg": msg, "alert_id": existing_exp[0]})
                    else:
                        res = conn.execute(text("""
                            INSERT INTO alerts
                            (Medicine_ID, Disease, Village, Alert_Type, Severity, Alert_Category, Alert_Message, Alert_Date, Status)
                            VALUES
                            (:med_id, NULL, NULL, 'MEDICINE_EXPIRED', 'HIGH', 'MEDICINE', :msg, NOW(), 'Active')
                        """), {"med_id": m_id, "msg": msg})
                        new_alert_id = getattr(res, "lastrowid", None)
                        create_notification_for_alert(
                            conn,
                            new_alert_id,
                            f"Medicine Expired: {name}",
                            msg,
                            "HIGH",
                            "/alerts"
                        )
                elif today <= expiry <= expiring_horizon:
                    # Approaching expiry
                    existing_near = conn.execute(text("""
                        SELECT Alert_ID FROM alerts
                        WHERE Medicine_ID = :med_id
                          AND Alert_Type = 'MEDICINE_EXPIRING'
                          AND Status = 'Active'
                        LIMIT 1
                    """), {"med_id": m_id}).fetchone()

                    msg = f"{name} is approaching expiry (Expires on {expiry}). Plan for replenishment."
                    if not existing_near:
                        res = conn.execute(text("""
                            INSERT INTO alerts
                            (Medicine_ID, Disease, Village, Alert_Type, Severity, Alert_Category, Alert_Message, Alert_Date, Status)
                            VALUES
                            (:med_id, NULL, NULL, 'MEDICINE_EXPIRING', 'MEDIUM', 'MEDICINE', :msg, NOW(), 'Active')
                        """), {"med_id": m_id, "msg": msg})
                        new_alert_id = getattr(res, "lastrowid", None)
                        create_notification_for_alert(
                            conn,
                            new_alert_id,
                            f"Medicine Expiring Soon: {name}",
                            msg,
                            "MEDIUM",
                            "/alerts"
                        )
                else:
                    # Expiry > 30 days away -> resolve expiry alerts
                    conn.execute(text("""
                        UPDATE alerts
                        SET Status = 'Inactive'
                        WHERE Medicine_ID = :med_id
                          AND Alert_Type IN ('MEDICINE_EXPIRED', 'MEDICINE_EXPIRING', 'MEDICINE_EXPIRY', 'MEDICINE_EXPIRY_WARNING')
                          AND Status = 'Active'
                    """), {"med_id": m_id})

            results.append({
                "medicine_id": m_id,
                "medicine_name": name,
                "current_stock": stock,
                "expiry_date": str(expiry) if expiry else None
            })

        return results

    if connection is not None:
        return _process(connection)
    else:
        with engine.begin() as conn:
            return _process(conn)


def generate_medicine_alerts():
    """Alias to evaluate all medicines."""
    res = evaluate_medicine_alerts()
    return {
        "status": "success",
        "evaluated_medicines": len(res)
    }