from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from alerts import get_alerts
from database import get_db
from medicines import get_medicine_requirement
from predict import predict_outbreak

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


class DashboardStatsResponse(BaseModel):
    total_patients: int = 0
    total_appointments: int = 0
    total_referrals: int = 0
    total_triage_records: int = 0
    total_alerts: int = 0
    total_prescriptions: int = 0
    total_teleconsultations: int = 0
    total_diagnostic_requests: int = 0


class DashboardPatientItem(BaseModel):
    Patient_ID: int
    Patient_Name: Optional[str] = None
    Age: Optional[int] = None
    Gender: Optional[str] = None
    Village: Optional[str] = None
    Visit_Date: Optional[str] = None
    Disease: Optional[str] = None
    Doctor: Optional[str] = None


class DashboardPatientListResponse(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    data: List[DashboardPatientItem]


class DashboardDistributionItem(BaseModel):
    disease: str
    count: int = 0


class DashboardDistributionResponse(BaseModel):
    data: List[DashboardDistributionItem]


class DashboardTrendItem(BaseModel):
    month: Optional[str] = None
    count: int = 0


class DashboardTrendResponse(BaseModel):
    data: List[DashboardTrendItem]


class DashboardGenderItem(BaseModel):
    gender: str
    count: int = 0


class DashboardGenderResponse(BaseModel):
    data: List[DashboardGenderItem]


class DashboardVillageItem(BaseModel):
    village: str
    count: int = 0


class DashboardVillageResponse(BaseModel):
    data: List[DashboardVillageItem]


class DashboardMedicineItem(BaseModel):
    medicine_name: str
    current_stock: int = 0
    reorder_level: int = 0
    stock_status: Optional[str] = None
    expiry_date: Optional[str] = None
    supplier: Optional[str] = None


class DashboardMedicineResponse(BaseModel):
    summary: Dict[str, int]
    data: List[DashboardMedicineItem]


class DashboardReferralStatsResponse(BaseModel):
    total_referrals: int = 0
    pending: int = 0
    sent: int = 0
    received: int = 0
    accepted: int = 0
    treatment_completed: int = 0
    follow_up: int = 0


class DashboardAlertItem(BaseModel):
    Alert_ID: int
    Disease: Optional[str] = None
    Village: Optional[str] = None
    Alert_Type: Optional[str] = None
    Severity: Optional[str] = None
    Alert_Category: Optional[str] = None
    Alert_Message: Optional[str] = None
    Alert_Date: Optional[str] = None
    Status: Optional[str] = None


class DashboardAlertResponse(BaseModel):
    total_alerts: int = 0
    by_severity: Dict[str, int]
    data: List[DashboardAlertItem]


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("""
            SELECT
                (SELECT COALESCE(COUNT(*), 0) FROM patients) AS total_patients,
                (SELECT COALESCE(COUNT(*), 0) FROM appointments) AS total_appointments,
                (SELECT COALESCE(COUNT(*), 0) FROM referrals) AS total_referrals,
                (SELECT COALESCE(COUNT(*), 0) FROM triage_records) AS total_triage_records,
                (SELECT COALESCE(COUNT(*), 0) FROM alerts) AS total_alerts,
                (SELECT COALESCE(COUNT(*), 0) FROM prescriptions) AS total_prescriptions,
                (SELECT COALESCE(COUNT(*), 0) FROM teleconsultations) AS total_teleconsultations,
                (SELECT COALESCE(COUNT(*), 0) FROM diagnostic_requests) AS total_diagnostic_requests
        """)).mappings().first()

        if not result:
            return DashboardStatsResponse()

        return DashboardStatsResponse(
            total_patients=int(result["total_patients"] or 0),
            total_appointments=int(result["total_appointments"] or 0),
            total_referrals=int(result["total_referrals"] or 0),
            total_triage_records=int(result["total_triage_records"] or 0),
            total_alerts=int(result["total_alerts"] or 0),
            total_prescriptions=int(result["total_prescriptions"] or 0),
            total_teleconsultations=int(result["total_teleconsultations"] or 0),
            total_diagnostic_requests=int(result["total_diagnostic_requests"] or 0)
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to fetch dashboard summary: {str(exc)}") from exc


@router.get("/patients", response_model=DashboardPatientListResponse)
def get_dashboard_patients(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    try:
        offset = (page - 1) * limit

        total = db.execute(text("SELECT COUNT(*) AS total FROM patients")).mappings().first()
        total_value = int((total["total"] if total else 0) or 0)

        rows = db.execute(text("""
            SELECT
                Patient_ID,
                Patient_Name,
                Age,
                Gender,
                Village,
                Visit_Date,
                Disease,
                Doctor
            FROM patients
            ORDER BY Patient_ID DESC
            LIMIT :limit OFFSET :offset
        """), {"limit": limit, "offset": offset}).mappings().all()

        total_pages = 0 if total_value == 0 else ((total_value + limit - 1) // limit)

        return DashboardPatientListResponse(
            page=page,
            limit=limit,
            total=total_value,
            total_pages=total_pages,
            data=[DashboardPatientItem(
                Patient_ID=int(row["Patient_ID"]),
                Patient_Name=row.get("Patient_Name"),
                Age=row.get("Age"),
                Gender=row.get("Gender"),
                Village=row.get("Village"),
                Visit_Date=str(row["Visit_Date"]) if row.get("Visit_Date") is not None else None,
                Disease=row.get("Disease"),
                Doctor=row.get("Doctor")
            ) for row in rows]
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="page and limit must be valid integers") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to fetch patient list: {str(exc)}") from exc


@router.get("/disease-distribution", response_model=DashboardDistributionResponse)
def get_dashboard_disease_distribution(db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT
                Disease,
                COUNT(*) AS count
            FROM patients
            WHERE Disease IS NOT NULL
              AND Disease <> ''
            GROUP BY Disease
            ORDER BY count DESC, Disease ASC
        """)).mappings().all()

        data = [
            DashboardDistributionItem(
                disease=row["Disease"],
                count=int(row["count"] or 0)
            )
            for row in rows
        ]

        return DashboardDistributionResponse(data=data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to fetch disease distribution: {str(exc)}") from exc


@router.get("/patient-trends", response_model=DashboardTrendResponse)
def get_dashboard_patient_trends(db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT
                DATE_FORMAT(Visit_Date, '%Y-%m') AS month,
                COUNT(*) AS count
            FROM patients
            WHERE Visit_Date IS NOT NULL
            GROUP BY DATE_FORMAT(Visit_Date, '%Y-%m')
            ORDER BY month ASC
        """)).mappings().all()

        data = [
            DashboardTrendItem(
                month=row["month"],
                count=int(row["count"] or 0)
            )
            for row in rows
        ]

        return DashboardTrendResponse(data=data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to fetch patient trends: {str(exc)}") from exc


@router.get("/gender-distribution", response_model=DashboardGenderResponse)
def get_dashboard_gender_distribution(db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT
                Gender,
                COUNT(*) AS count
            FROM patients
            WHERE Gender IS NOT NULL
              AND Gender <> ''
            GROUP BY Gender
            ORDER BY count DESC, Gender ASC
        """)).mappings().all()

        data = [
            DashboardGenderItem(
                gender=row["Gender"],
                count=int(row["count"] or 0)
            )
            for row in rows
        ]

        return DashboardGenderResponse(data=data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to fetch gender distribution: {str(exc)}") from exc


@router.get("/village-distribution", response_model=DashboardVillageResponse)
def get_dashboard_village_distribution(db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT
                Village,
                COUNT(*) AS count
            FROM patients
            WHERE Village IS NOT NULL
              AND Village <> ''
            GROUP BY Village
            ORDER BY count DESC, Village ASC
        """)).mappings().all()

        data = [
            DashboardVillageItem(
                village=row["Village"],
                count=int(row["count"] or 0)
            )
            for row in rows
        ]

        return DashboardVillageResponse(data=data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to fetch village distribution: {str(exc)}") from exc


@router.get("/medicine-stock", response_model=DashboardMedicineResponse)
def get_dashboard_medicine_stock(db: Session = Depends(get_db)):
    try:
        summary = db.execute(text("""
            SELECT
                COUNT(*) AS total_medicines,
                SUM(CASE WHEN Current_Stock <= 0 THEN 1 ELSE 0 END) AS out_of_stock_medicines,
                SUM(CASE WHEN Current_Stock > 0 AND Current_Stock <= Reorder_Level THEN 1 ELSE 0 END) AS low_stock_medicines
            FROM medicines
        """)).mappings().first()

        rows = db.execute(text("""
            SELECT
                Medicine_Name,
                Current_Stock,
                Reorder_Level,
                Stock_Status,
                Expiry_Date,
                Supplier
            FROM medicines
            ORDER BY Medicine_Name ASC
        """)).mappings().all()

        summary_dict = {
            "total_medicines": int((summary["total_medicines"] if summary else 0) or 0),
            "low_stock_medicines": int((summary["low_stock_medicines"] if summary else 0) or 0),
            "out_of_stock_medicines": int((summary["out_of_stock_medicines"] if summary else 0) or 0),
        }

        data = [
            DashboardMedicineItem(
                medicine_name=row["Medicine_Name"],
                current_stock=int(row["Current_Stock"] or 0),
                reorder_level=int(row["Reorder_Level"] or 0),
                stock_status=row.get("Stock_Status"),
                expiry_date=str(row["Expiry_Date"]) if row.get("Expiry_Date") is not None else None,
                supplier=row.get("Supplier")
            )
            for row in rows
        ]

        return DashboardMedicineResponse(summary=summary_dict, data=data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to fetch medicine stock: {str(exc)}") from exc


@router.get("/referrals", response_model=DashboardReferralStatsResponse)
def get_dashboard_referrals(db: Session = Depends(get_db)):
    try:
        referral_summary = db.execute(text("""
            SELECT
                COUNT(*) AS total_referrals,
                SUM(CASE WHEN LOWER(COALESCE(Current_Status, '')) = 'pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN LOWER(COALESCE(Current_Status, '')) = 'sent' THEN 1 ELSE 0 END) AS sent,
                SUM(CASE WHEN LOWER(COALESCE(Current_Status, '')) = 'received' THEN 1 ELSE 0 END) AS received,
                SUM(CASE WHEN LOWER(COALESCE(Current_Status, '')) = 'accepted' THEN 1 ELSE 0 END) AS accepted,
                SUM(CASE WHEN LOWER(COALESCE(Current_Status, '')) IN ('completed', 'treatment completed', 'patient visited') THEN 1 ELSE 0 END) AS treatment_completed
            FROM referrals
        """)).mappings().first()

        follow_up_count = db.execute(text("SELECT COUNT(*) AS follow_up FROM followups")).mappings().first()

        summary = {
            "total_referrals": int((referral_summary["total_referrals"] if referral_summary else 0) or 0),
            "pending": int((referral_summary["pending"] if referral_summary else 0) or 0),
            "sent": int((referral_summary["sent"] if referral_summary else 0) or 0),
            "received": int((referral_summary["received"] if referral_summary else 0) or 0),
            "accepted": int((referral_summary["accepted"] if referral_summary else 0) or 0),
            "treatment_completed": int((referral_summary["treatment_completed"] if referral_summary else 0) or 0),
            "follow_up": int((follow_up_count["follow_up"] if follow_up_count else 0) or 0),
        }

        return DashboardReferralStatsResponse(**summary)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to fetch referral statistics: {str(exc)}") from exc


@router.get("/alerts", response_model=DashboardAlertResponse)
def get_dashboard_alerts(db: Session = Depends(get_db)):
    try:
        total = db.execute(text("SELECT COUNT(*) AS total_alerts FROM alerts")).mappings().first()

        severity_counts = db.execute(text("""
            SELECT
                Severity,
                COUNT(*) AS count
            FROM alerts
            GROUP BY Severity
            ORDER BY Severity ASC
        """)).mappings().all()

        rows = db.execute(text("""
            SELECT
                Alert_ID,
                Disease,
                Village,
                Alert_Type,
                Severity,
                Alert_Category,
                Alert_Message,
                Alert_Date,
                Status
            FROM alerts
            ORDER BY Alert_Date DESC, Alert_ID DESC
            LIMIT 50
        """)).mappings().all()

        severity_summary = {
            row["Severity"] if row.get("Severity") is not None else "UNKNOWN": int(row["count"] or 0)
            for row in severity_counts
        }

        return DashboardAlertResponse(
            total_alerts=int((total["total_alerts"] if total else 0) or 0),
            by_severity=severity_summary,
            data=[DashboardAlertItem(
                Alert_ID=int(row["Alert_ID"]),
                Disease=row.get("Disease"),
                Village=row.get("Village"),
                Alert_Type=row.get("Alert_Type"),
                Severity=row.get("Severity"),
                Alert_Category=row.get("Alert_Category"),
                Alert_Message=row.get("Alert_Message"),
                Alert_Date=str(row["Alert_Date"]) if row.get("Alert_Date") is not None else None,
                Status=row.get("Status")
            ) for row in rows]
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to fetch alerts: {str(exc)}") from exc


def dashboard(data):

    prediction = predict_outbreak(data)

    medicines = get_medicine_requirement(
        prediction["Disease"]
    )

    alerts = get_alerts()

    return {
        "prediction": prediction,
        "medicines": medicines,
        "alerts": alerts
    }