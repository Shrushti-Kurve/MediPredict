from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from database import get_db


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
        {
            "patient_id": patient_id
        }
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
        {
            "medicine_id": medicine_id
        }
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

        if medicine["Expiry_Date"] < datetime.now().date():

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
    # GENERATE STOCK ALERT
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

                "message":
                    f"{medicine['Medicine_Name']} stock is low. "
                    f"Only {new_stock} units remaining."
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

                "message":
                    f"{medicine['Medicine_Name']} is OUT OF STOCK."
            }
        )

        alert_id = result.lastrowid


    # -----------------------------------------------------
    # CREATE NOTIFICATIONS FOR ALL USERS
    # -----------------------------------------------------

    if alert_id:

        notification_query = text("""
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
        """)


        db.execute(
            notification_query,
            {
                "alert_id": alert_id,

                "title":
                    f"Medicine {new_status}",

                "message":
                    f"{medicine['Medicine_Name']} "
                    f"stock status is {new_status}. "
                    f"Remaining stock: {new_stock}",

                "severity":
                    "MEDIUM"
                    if new_status == "LOW"
                    else "HIGH"
            }
        )


    # -----------------------------------------------------
    # SAVE EVERYTHING
    # -----------------------------------------------------

    db.commit()


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "status": "success",

        "message": "Medicine prescribed successfully",

        "patient": patient["Patient_Name"],

        "medicine": medicine["Medicine_Name"],

        "quantity_dispensed": quantity,

        "remaining_stock": new_stock,

        "stock_status": new_status,

        "alert_generated":
            alert_id is not None

    }