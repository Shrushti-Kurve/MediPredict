from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from sqlalchemy import text as sa_text
from models import Patient
from schemas import PatientCreate, PatientUpdate

# Automatic prediction function
from predict import run_automatic_prediction, check_trigger, PATIENT_TRIGGER


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


# =========================================================
# STAFF → ADD PATIENT
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

        Visit_Date=visit_date

    )

    db.add(patient)

    db.commit()

    db.refresh(patient)
    # After adding a patient, only run automatic prediction when the
    # configured `PATIENT_TRIGGER` is reached (e.g. 2 patients for testing).
    prediction_result = None

    try:
        triggered, total = check_trigger()

        if triggered:
            prediction_result = run_automatic_prediction()
        else:
            prediction_result = {
                "status": "waiting",
                "patient_count": total,
                "required_patients": PATIENT_TRIGGER,
                "message": "Prediction trigger not reached."
            }

    except Exception as e:
        prediction_result = {
            "status": "prediction_error",
            "message": str(e)
        }

    return {

        "status": "success",

        "message": "Patient added successfully",

        "Patient_ID": patient.Patient_ID,

        "Patient_Name": patient.Patient_Name,

        "automatic_prediction": prediction_result

    }

@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    force: bool = False,
    db: Session = Depends(get_db)
):

    # Check for dependent medicine_transactions
    trans_q = db.execute(
        sa_text("SELECT COUNT(*) AS total FROM medicine_transactions WHERE Patient_ID = :pid"),
        {"pid": patient_id}
    ).mappings().first()

    trans_count = trans_q["total"] if trans_q else 0

    if trans_count > 0 and not force:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Patient has related medicine transactions. Use force=true to delete and remove dependent records.",
                "dependent_transactions": trans_count
            }
        )

    try:
        if force:
            # delete dependent records first
            db.execute(sa_text("DELETE FROM medicine_transactions WHERE Patient_ID = :pid"), {"pid": patient_id})
            db.execute(sa_text("DELETE FROM prescriptions WHERE Patient_ID = :pid"), {"pid": patient_id})

        db.execute(sa_text("DELETE FROM patients WHERE Patient_ID = :pid"), {"pid": patient_id})
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unable to delete patient: {str(e)}")

    return {"status": "success", "patient_deleted": True}


# =========================================================
# DOCTOR / STAFF → VIEW ALL PATIENTS
# =========================================================

@router.get("/")
def get_patients(
    db: Session = Depends(get_db)
):

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


    # -----------------------------------------------------
    # UPDATE DISEASE
    # -----------------------------------------------------

    if data.Disease is not None:

        patient.Disease = data.Disease


    # -----------------------------------------------------
    # UPDATE SYMPTOMS
    # -----------------------------------------------------

    if data.Symptoms is not None:

        patient.Symptoms = data.Symptoms


    # -----------------------------------------------------
    # UPDATE DOCTOR
    # -----------------------------------------------------

    if data.Doctor is not None:

        patient.Doctor = data.Doctor


    # -----------------------------------------------------
    # UPDATE DOCTOR USER ID
    # -----------------------------------------------------

    if data.Doctor_User_ID is not None:

        patient.Doctor_User_ID = data.Doctor_User_ID


    # Save doctor changes
    db.commit()

    db.refresh(patient)


    # =====================================================
    # AUTOMATIC PREDICTION TRIGGER
    # =====================================================
    #
    # The doctor does NOT click Predict.
    #
    # After the patient is updated, the backend checks:
    #
    #       diagnosed patients >= PATIENT_TRIGGER
    #
    # If yes → prediction automatically runs.
    #
    # Currently PATIENT_TRIGGER = 2 for your hackathon test.
    # Later change it to 100 in predict.py.
    # =====================================================

    prediction_result = None

    try:
        triggered, total = check_trigger()

        if triggered:
            prediction_result = run_automatic_prediction()
        else:
            prediction_result = {
                "status": "waiting",
                "patient_count": total,
                "required_patients": PATIENT_TRIGGER,
                "message": "Prediction trigger not reached."
            }

    except Exception as e:
        # Patient update should NOT fail just because prediction has an error.
        prediction_result = {"status": "prediction_error", "message": str(e)}


    # =====================================================
    # RESPONSE
    # =====================================================

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

        },

        "automatic_prediction": prediction_result

    }