from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from database import get_db
from notifications import create_notification_for_alert
from predict import run_automatic_prediction, PATIENT_TRIGGER


router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"]
)


# =========================================================
# DOCTOR → PRESCRIBE MEDICINE
# =========================================================

@router.post("/")
def prescribe_medicine(
    patient_id: int,
    medicine_id: int,
    quantity: int,
    user_id: int = None,
    db: Session = Depends(get_db)
):
    # -----------------------------------------------------
    # Validate quantity
    # -----------------------------------------------------
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    # -----------------------------------------------------
    # Check patient
    # -----------------------------------------------------
    patient_query = text("""
        SELECT
            Patient_ID,
            Patient_Name,
            Disease,
            Village
        FROM patients
        WHERE Patient_ID = :patient_id
    """)

    patient = db.execute(
        patient_query,
        {"patient_id": patient_id}
    ).mappings().first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # -----------------------------------------------------
    # Check medicine
    # -----------------------------------------------------
    medicine_query = text("""
        SELECT
            Medicine_ID,
            Medicine_Name,
            Current_Stock,
            Reorder_Level,
            Stock_Status,
            Expiry_Date
        FROM medicines
        WHERE Medicine_ID = :medicine_id
    """)

    medicine = db.execute(
        medicine_query,
        {"medicine_id": medicine_id}
    ).mappings().first()

    if not medicine:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    # -----------------------------------------------------
    # CHECK EXPIRY
    # -----------------------------------------------------
    if medicine["Expiry_Date"]:
        expiry = medicine["Expiry_Date"]
        if hasattr(expiry, "date"):
            expiry = expiry.date()
        if expiry < datetime.now().date():
            raise HTTPException(
                status_code=400,
                detail=f"{medicine['Medicine_Name']} is expired"
            )

    # -----------------------------------------------------
    # CHECK STOCK
    # -----------------------------------------------------
    current_stock = medicine["Current_Stock"] or 0

    if current_stock < quantity:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Medicine not available in sufficient quantity",
                "medicine": medicine["Medicine_Name"],
                "available_stock": current_stock,
                "requested_quantity": quantity
            }
        )

    # -----------------------------------------------------
    # DEDUCT MEDICINE
    # -----------------------------------------------------
    new_stock = current_stock - quantity

    if new_stock <= 0:
        new_status = "OUT_OF_STOCK"
    elif new_stock <= (medicine["Reorder_Level"] or 0):
        new_status = "LOW"
    else:
        new_status = "AVAILABLE"

    update_query = text("""
        UPDATE medicines
        SET
            Current_Stock = :new_stock,
            Stock_Status = :new_status
        WHERE Medicine_ID = :medicine_id
    """)

    db.execute(
        update_query,
        {
            "new_stock": new_stock,
            "new_status": new_status,
            "medicine_id": medicine_id
        }
    )

    # -----------------------------------------------------
    # RECORD PRESCRIPTION RECORD
    # -----------------------------------------------------
    prescription_query = text("""
        INSERT INTO prescriptions
        (
            Patient_ID,
            Patient_Name,
            Medicine_Name,
            Quantity,
            User_ID,
            Prescription_Date
        )
        VALUES
        (
            :patient_id,
            :patient_name,
            :medicine_name,
            :quantity,
            :user_id,
            NOW()
        )
    """)

    db.execute(
        prescription_query,
        {
            "patient_id": patient_id,
            "patient_name": patient["Patient_Name"],
            "medicine_name": medicine["Medicine_Name"],
            "quantity": quantity,
            "user_id": user_id
        }
    )

    # -----------------------------------------------------
    # ADD TRANSACTION
    # -----------------------------------------------------
    transaction_query = text("""
        INSERT INTO medicine_transactions
        (
            Patient_ID,
            Medicine_ID,
            Quantity,
            Transaction_Type,
            Transaction_Date,
            User_ID
        )
        VALUES
        (
            :patient_id,
            :medicine_id,
            :quantity,
            'DISPENSE',
            CURDATE(),
            :user_id
        )
    """)

    db.execute(
        transaction_query,
        {
            "patient_id": patient_id,
            "medicine_id": medicine_id,
            "quantity": quantity,
            "user_id": user_id
        }
    )

    # -----------------------------------------------------
    # GENERATE STOCK ALERT IF LOW OR OUT_OF_STOCK
    # -----------------------------------------------------
    alert_id = None

    if new_status == "LOW":
        alert_query = text("""
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
                :disease,
                :village,
                'MEDICINE_STOCK',
                'MEDIUM',
                'MEDICINE',
                :message,
                NOW(),
                'Active'
            )
        """)

        result = db.execute(
            alert_query,
            {
                "medicine_id": medicine_id,
                "disease": patient["Disease"],
                "village": patient["Village"],
                "message": (
                    f"{medicine['Medicine_Name']} stock is low. "
                    f"Only {new_stock} units remaining."
                )
            }
        )
        alert_id = result.lastrowid

    elif new_status == "OUT_OF_STOCK":
        alert_query = text("""
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
                :disease,
                :village,
                'MEDICINE_STOCK',
                'HIGH',
                'MEDICINE',
                :message,
                NOW(),
                'Active'
            )
        """)

        result = db.execute(
            alert_query,
            {
                "medicine_id": medicine_id,
                "disease": patient["Disease"],
                "village": patient["Village"],
                "message": f"{medicine['Medicine_Name']} is OUT OF STOCK."
            }
        )
        alert_id = result.lastrowid

    if alert_id:
        severity = "MEDIUM" if new_status == "LOW" else "HIGH"
        create_notification_for_alert(
            db,
            alert_id,
            f"Medicine {new_status}: {medicine['Medicine_Name']}",
            f"{medicine['Medicine_Name']} stock status is {new_status}. Remaining stock: {new_stock}",
            severity,
            "/alerts",
        )

    # -----------------------------------------------------
    # CRITICAL: DO NOT DELETE THE PATIENT MASTER RECORD!
    # The prescribed patient automatically leaves the pending list
    # because they now have an entry in prescriptions table,
    # but their record remains permanently in patients table.
    # -----------------------------------------------------
    db.commit()

    # -----------------------------------------------------
    # CHECK TRIGGER: Detect required completed real patient records
    # If completed patients >= PATIENT_TRIGGER (2 for demo)
    # -> Run EXISTING disease analysis / forecasting immediately!
    # -----------------------------------------------------
    completed_count_query = text("""
        SELECT COUNT(DISTINCT p.Patient_ID) AS total
        FROM patients p
        WHERE p.Disease IS NOT NULL
          AND (
            EXISTS (SELECT 1 FROM prescriptions pr WHERE pr.Patient_ID = p.Patient_ID)
            OR EXISTS (SELECT 1 FROM medicine_transactions mt WHERE mt.Patient_ID = p.Patient_ID)
          )
    """)
    completed_total = db.execute(completed_count_query).scalar() or 0

    forecast_result = None
    if completed_total >= PATIENT_TRIGGER:
        try:
            forecast_result = run_automatic_prediction()
        except Exception as exc:
            forecast_result = {
                "status": "prediction_error",
                "message": str(exc)
            }
    else:
        forecast_result = {
            "status": "waiting",
            "completed_patients": completed_total,
            "required_patients": PATIENT_TRIGGER,
            "message": f"{completed_total} of {PATIENT_TRIGGER} required completed patient records."
        }

    return {
        "status": "success",
        "message": "Medicine prescribed successfully",
        "patient": patient["Patient_Name"],
        "medicine": medicine["Medicine_Name"],
        "quantity_dispensed": quantity,
        "remaining_stock": new_stock,
        "stock_status": new_status,
        "alert_generated": alert_id is not None,
        "completed_patients": completed_total,
        "forecast_result": forecast_result
    }