from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date

from database import get_db
from models import Medicine
from schemas import MedicineCreate, MedicineStockUpdate


router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"]
)


# =========================================================
# STOCK STATUS
# =========================================================

def calculate_stock_status(
    current_stock: int,
    reorder_level: int
):

    if current_stock <= 0:

        return "OUT_OF_STOCK"

    elif current_stock <= reorder_level:

        return "LOW"

    else:

        return "AVAILABLE"


# =========================================================
# EXPIRY STATUS
# =========================================================

def check_expiry(expiry_date):

    if expiry_date is None:

        return "NO_EXPIRY_DATE"

    today = date.today()

    if expiry_date < today:

        return "EXPIRED"

    return "VALID"


# =========================================================
# OLD MEDICINE REQUIREMENT FUNCTION
# Keeps your existing app.py working
# =========================================================

def get_medicine_requirement(disease: str):

    return {

        "disease": disease,

        "message": "Medicine requirement endpoint connected",

        "status": "success"

    }


# =========================================================
# PHARMACIST → ADD MEDICINE
# =========================================================

@router.post("/")
def add_medicine(
    data: MedicineCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Medicine).filter(
        Medicine.Medicine_Name == data.Medicine_Name
    ).first()

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Medicine already exists"
        )

    expiry = None

    if data.Expiry_Date:

        try:

            expiry = datetime.strptime(
                data.Expiry_Date,
                "%Y-%m-%d"
            ).date()

        except ValueError:

            raise HTTPException(
                status_code=400,
                detail="Expiry_Date must be YYYY-MM-DD"
            )

    stock_status = calculate_stock_status(
        data.Current_Stock,
        data.Reorder_Level
    )

    medicine = Medicine(

        Medicine_Name=data.Medicine_Name,

        Current_Stock=data.Current_Stock,

        Reorder_Level=data.Reorder_Level,

        Stock_Status=stock_status,

        Expiry_Date=expiry,

        Supplier=data.Supplier,

        PHC_Name=data.PHC_Name

    )

    db.add(medicine)

    db.commit()

    db.refresh(medicine)

    return {

        "status": "success",

        "message": "Medicine added successfully",

        "Medicine_ID": medicine.Medicine_ID,

        "Medicine_Name": medicine.Medicine_Name,

        "Current_Stock": medicine.Current_Stock,

        "Stock_Status": medicine.Stock_Status

    }


# =========================================================
# VIEW ALL MEDICINES
# =========================================================

@router.get("/")
def get_medicines(
    db: Session = Depends(get_db)
):

    medicines = db.query(Medicine).all()

    result = []

    for medicine in medicines:

        result.append({

            "Medicine_ID": medicine.Medicine_ID,

            "Medicine_Name": medicine.Medicine_Name,

            "Current_Stock": medicine.Current_Stock,

            "Reorder_Level": medicine.Reorder_Level,

            "Stock_Status": medicine.Stock_Status,

            "Expiry_Date": medicine.Expiry_Date,

            "Expiry_Status": check_expiry(
                medicine.Expiry_Date
            ),

            "Supplier": medicine.Supplier,

            "PHC_Name": medicine.PHC_Name

        })

    return result


# =========================================================
# GET ONE MEDICINE
# =========================================================

@router.get("/{medicine_id}")
def get_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):

    medicine = db.query(Medicine).filter(
        Medicine.Medicine_ID == medicine_id
    ).first()

    if not medicine:

        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    return {

        "Medicine_ID": medicine.Medicine_ID,

        "Medicine_Name": medicine.Medicine_Name,

        "Current_Stock": medicine.Current_Stock,

        "Reorder_Level": medicine.Reorder_Level,

        "Stock_Status": medicine.Stock_Status,

        "Expiry_Date": medicine.Expiry_Date,

        "Expiry_Status": check_expiry(
            medicine.Expiry_Date
        ),

        "Supplier": medicine.Supplier,

        "PHC_Name": medicine.PHC_Name

    }


# =========================================================
# PHARMACIST → ADD STOCK
# =========================================================

@router.put("/{medicine_id}/add-stock")
def add_stock(
    medicine_id: int,
    data: MedicineStockUpdate,
    db: Session = Depends(get_db)
):

    if data.quantity <= 0:

        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    medicine = db.query(Medicine).filter(
        Medicine.Medicine_ID == medicine_id
    ).first()

    if not medicine:

        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    medicine.Current_Stock += data.quantity

    medicine.Stock_Status = calculate_stock_status(
        medicine.Current_Stock,
        medicine.Reorder_Level
    )

    db.commit()

    db.refresh(medicine)

    return {

        "status": "success",

        "message": "Stock added successfully",

        "Medicine_Name": medicine.Medicine_Name,

        "Current_Stock": medicine.Current_Stock,

        "Stock_Status": medicine.Stock_Status

    }


# =========================================================
# PHARMACIST → REMOVE STOCK
# =========================================================

@router.put("/{medicine_id}/remove-stock")
def remove_stock(
    medicine_id: int,
    data: MedicineStockUpdate,
    db: Session = Depends(get_db)
):

    if data.quantity <= 0:

        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    medicine = db.query(Medicine).filter(
        Medicine.Medicine_ID == medicine_id
    ).first()

    if not medicine:

        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    if medicine.Current_Stock < data.quantity:

        raise HTTPException(
            status_code=400,
            detail="Not enough medicine in stock"
        )

    medicine.Current_Stock -= data.quantity

    medicine.Stock_Status = calculate_stock_status(
        medicine.Current_Stock,
        medicine.Reorder_Level
    )

    db.commit()

    db.refresh(medicine)

    return {

        "status": "success",

        "message": "Stock removed successfully",

        "Medicine_Name": medicine.Medicine_Name,

        "Current_Stock": medicine.Current_Stock,

        "Stock_Status": medicine.Stock_Status

    }