from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from typing import Optional, List, Dict, Any

from database import get_db, engine
from sqlalchemy import text as sa_text


router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"]
)


def ensure_prescriptions_table():
    create_sql = sa_text("""
    CREATE TABLE IF NOT EXISTS prescriptions (
        Prescription_ID INT AUTO_INCREMENT PRIMARY KEY,
        Patient_ID INT,
        Patient_Name VARCHAR(255),
        Medicine_Name VARCHAR(255),
        Quantity INT,
        User_ID INT NULL,
        Prescription_Date DATETIME
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """)

    with engine.begin() as conn:
        conn.execute(create_sql)


try:
    ensure_prescriptions_table()
except Exception:
    pass


@router.post("/")
def prescribe_medicine(
    patient_id: int,
    medicine_name: str,
    quantity: int = 1,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    if not medicine_name or not medicine_name.strip():
        raise HTTPException(status_code=400, detail="Medicine name is required")

    # normalize user_id
    if user_id is None or str(user_id).strip() == "":
        user_id_val = None
    else:
        try:
            user_id_val = int(user_id)
        except Exception:
            user_id_val = None

    # load patient
    patient_q = text("""
        SELECT Patient_ID, Patient_Name, Disease, Village
        FROM patients
        WHERE Patient_ID = :pid
    """)

    patient = db.execute(patient_q, {"pid": patient_id}).mappings().first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # find medicine in inventory (optional)
    med_q = text("""
        SELECT Medicine_ID, Medicine_Name, Current_Stock
        FROM medicines
        WHERE LOWER(TRIM(Medicine_Name)) = LOWER(TRIM(:mname))
        LIMIT 1
    """)

    med = db.execute(med_q, {"mname": medicine_name}).mappings().first()

    try:
        # insert prescription
        ins = text("""
            INSERT INTO prescriptions
            (Patient_ID, Patient_Name, Medicine_Name, Quantity, User_ID, Prescription_Date)
            VALUES
            (:patient_id, :patient_name, :medicine_name, :quantity, :user_id, NOW())
        """)

        db.execute(ins, {
            "patient_id": patient_id,
            "patient_name": patient["Patient_Name"],
            "medicine_name": medicine_name,
            "quantity": quantity,
            "user_id": user_id_val
        })

        # if medicine exists, record transaction (do not deduct stock)
        if med:
            try:
                trans = text("""
                    INSERT INTO medicine_transactions
                    (Patient_ID, Medicine_ID, Quantity, Transaction_Type, Transaction_Date, User_ID)
                    VALUES
                    (:patient_id, :medicine_id, :quantity, 'PRESCRIPTION', CURDATE(), :user_id)
                """)

                db.execute(trans, {
                    "patient_id": patient_id,
                    "medicine_id": med["Medicine_ID"],
                    "quantity": quantity,
                    "user_id": user_id_val
                })
            except Exception:
                pass

        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unable to save prescription: {str(e)}")

    return {
        "status": "success",
        "message": "Prescription saved successfully",
        "patient": {
            "Patient_ID": patient["Patient_ID"],
            "Patient_Name": patient["Patient_Name"],
            "Disease": patient["Disease"],
            "Village": patient["Village"]
        },
        "medicine": medicine_name,
        "quantity": quantity,
        "medicine_found_in_inventory": bool(med),
    }


@router.post('/bulk')
def prescribe_bulk(payload: Dict[str, Any], db: Session = Depends(get_db)):
    # payload: { patient_id: int, medicines: [{medicine_name, quantity}], user_id: optional }
    patient_id = payload.get('patient_id')
    medicines = payload.get('medicines') or []
    user_id_raw = payload.get('user_id')

    if not patient_id:
        raise HTTPException(status_code=400, detail='patient_id is required')

    if not isinstance(medicines, list) or len(medicines) == 0:
        raise HTTPException(status_code=400, detail='medicines list required')

    if user_id_raw is None or str(user_id_raw).strip() == '':
        user_id_val = None
    else:
        try:
            user_id_val = int(user_id_raw)
        except Exception:
            user_id_val = None

    patient_q = text("""
        SELECT Patient_ID, Patient_Name, Disease, Village
        FROM patients
        WHERE Patient_ID = :pid
    """)

    patient = db.execute(patient_q, {"pid": patient_id}).mappings().first()

    if not patient:
        raise HTTPException(status_code=404, detail='Patient not found')

    try:
        for item in medicines:
            med_name = (item.get('medicine_name') or item.get('name') or '').strip()
            qty = int(item.get('quantity') or item.get('qty') or 1)

            if not med_name:
                continue

            ins = text("""
                INSERT INTO prescriptions
                (Patient_ID, Patient_Name, Medicine_Name, Quantity, User_ID, Prescription_Date)
                VALUES (:patient_id, :patient_name, :medicine_name, :quantity, :user_id, NOW())
            """)

            db.execute(ins, {
                "patient_id": patient_id,
                "patient_name": patient['Patient_Name'],
                "medicine_name": med_name,
                "quantity": qty,
                "user_id": user_id_val
            })

            med_q = text("""
                SELECT Medicine_ID
                FROM medicines
                WHERE LOWER(TRIM(Medicine_Name)) = LOWER(TRIM(:mname))
                LIMIT 1
            """)

            med = db.execute(med_q, {"mname": med_name}).mappings().first()

            if med:
                try:
                    trans = text("""
                        INSERT INTO medicine_transactions
                        (Patient_ID, Medicine_ID, Quantity, Transaction_Type, Transaction_Date, User_ID)
                        VALUES (:patient_id, :medicine_id, :quantity, 'PRESCRIPTION', CURDATE(), :user_id)
                    """)

                    db.execute(trans, {
                        "patient_id": patient_id,
                        "medicine_id": med['Medicine_ID'],
                        "quantity": qty,
                        "user_id": user_id_val
                    })
                except Exception:
                    pass

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Unable to save prescriptions: {str(e)}')

    return {"status": "success", "message": "Prescriptions saved", "patient_id": patient_id}
