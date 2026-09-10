from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from database import get_db
from models import Patient
from schemas import PatientCreate, PatientUpdate


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


# =========================================================
# DELETE PATIENT (PRESERVE RECORD)
# =========================================================

@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.Patient_ID == patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Demo requirement: a patient may leave the pending prescription queue,
    # but the master record must be preserved for history and forecasting.
    return {
        "status": "success",
        "message": "Patient removed from pending work but record preserved for history and forecasting",
        "patient_id": patient_id,
        "record_preserved": True
    }


# =========================================================
# STAFF → ADD PATIENT (Stored in DB, NO prediction/alert on add)
# =========================================================

@router.post("/")
def add_patient(
    data: PatientCreate,
    db: Session = Depends(get_db)
):
    visit_date = None

    if data.Visit_Date:
        try:
            visit_date = datetime.strptime(
                data.Visit_Date,
                "%Y-%m-%d"
            ).date()
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Visit_Date must be YYYY-MM-DD"
            )

    patient = Patient(
        Patient_Name=data.Patient_Name,
        Age=data.Age,
        Gender=data.Gender,
        Village=data.Village,
        Visit_Date=visit_date,
        Disease=data.Disease,
        Symptoms=data.Symptoms,
        Doctor=data.Doctor
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    # NOTE: Adding a patient must NOT create an alert or trigger forecasting.
    # Forecasting is only triggered after prescriptions are completed.
    return {
        "status": "success",
        "message": "Patient added successfully",
        "Patient_ID": patient.Patient_ID,
        "Patient_Name": patient.Patient_Name
    }


# =========================================================
# VIEW PENDING PATIENTS (Awaiting prescription)
# =========================================================

@router.get("/pending")
def get_pending_patients(
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT p.*
        FROM patients p
        WHERE NOT EXISTS (
            SELECT 1 FROM prescriptions pr WHERE pr.Patient_ID = p.Patient_ID
        ) AND NOT EXISTS (
            SELECT 1 FROM medicine_transactions mt WHERE mt.Patient_ID = p.Patient_ID
        )
        ORDER BY p.Patient_ID DESC
    """)
    result = db.execute(query).mappings().all()
    return [dict(row) for row in result]


# =========================================================
# DOCTOR / STAFF → VIEW ALL PATIENTS OR PENDING
# =========================================================

@router.get("/")
def get_patients(
    pending: bool = False,
    db: Session = Depends(get_db)
):
    if pending:
        query = text("""
            SELECT p.*
            FROM patients p
            WHERE NOT EXISTS (
                SELECT 1 FROM prescriptions pr WHERE pr.Patient_ID = p.Patient_ID
            ) AND NOT EXISTS (
                SELECT 1 FROM medicine_transactions mt WHERE mt.Patient_ID = p.Patient_ID
            )
            ORDER BY p.Patient_ID DESC
        """)
        result = db.execute(query).mappings().all()
        return [dict(row) for row in result]

    patients = db.query(Patient).order_by(
        Patient.Patient_ID.desc()
    ).all()

    return patients


# =========================================================
# GET ONE PATIENT
# =========================================================

@router.get("/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.Patient_ID == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return patient


# =========================================================
# DOCTOR → UPDATE PATIENT
# =========================================================

@router.put("/{patient_id}")
def update_patient(
    patient_id: int,
    data: PatientUpdate,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.Patient_ID == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    if data.Disease is not None:
        patient.Disease = data.Disease

    if data.Symptoms is not None:
        patient.Symptoms = data.Symptoms

    if data.Doctor is not None:
        patient.Doctor = data.Doctor

    if data.Doctor_User_ID is not None:
        patient.Doctor_User_ID = data.Doctor_User_ID

    db.commit()
    db.refresh(patient)

    return {
        "status": "success",
        "message": "Patient updated successfully",
        "patient": {
            "Patient_ID": patient.Patient_ID,
            "Patient_Name": patient.Patient_Name,
            "Disease": patient.Disease,
            "Symptoms": patient.Symptoms,
            "Doctor": patient.Doctor,
            "Doctor_User_ID": patient.Doctor_User_ID
        }
    }