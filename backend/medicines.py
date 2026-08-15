from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"]
)


# =========================================================
# GET ALL MEDICINES
# =========================================================

@router.get("/")
def get_medicines(db: Session = Depends(get_db)):

    result = db.execute(
        text("""
            SELECT
                Medicine_ID,
                Medicine_Name,
                Current_Stock,
                Reorder_Level,
                Stock_Status,
                Expiry_Date,
                Supplier,
                PHC_Name
            FROM medicines
            ORDER BY Medicine_Name
        """)
    )

    return [dict(row._mapping) for row in result]


# =========================================================
# GET ONE MEDICINE
# =========================================================

@router.get("/{medicine_id}")
def get_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):

    result = db.execute(
        text("""
            SELECT *
            FROM medicines
            WHERE Medicine_ID = :medicine_id
        """),
        {"medicine_id": medicine_id}
    ).fetchone()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    return dict(result._mapping)


# =========================================================
# ADD MEDICINE
# =========================================================

@router.post("/")
def add_medicine(
    data: dict,
    db: Session = Depends(get_db)
):

    medicine_name = data.get("Medicine_Name")
    current_stock = int(data.get("Current_Stock", 0))
    reorder_level = int(data.get("Reorder_Level", 0))
    expiry_date = data.get("Expiry_Date")
    supplier = data.get("Supplier")
    phc_name = data.get("PHC_Name")

    if not medicine_name:
        raise HTTPException(
            status_code=400,
            detail="Medicine_Name is required"
        )

    # -----------------------------------------------------
    # CHECK IF MEDICINE ALREADY EXISTS
    # -----------------------------------------------------

    existing = db.execute(
        text("""
            SELECT *
            FROM medicines
            WHERE Medicine_Name = :name
        """),
        {"name": medicine_name}
    ).fetchone()

    # -----------------------------------------------------
    # IF EXISTS → ADD STOCK
    # -----------------------------------------------------

    if existing:

        new_stock = (
            existing.Current_Stock or 0
        ) + current_stock

        if new_stock == 0:
            stock_status = "OUT_OF_STOCK"

        elif new_stock <= (
            existing.Reorder_Level or reorder_level
        ):
            stock_status = "LOW_STOCK"

        else:
            stock_status = "AVAILABLE"

        db.execute(
            text("""
                UPDATE medicines
                SET
                    Current_Stock = :stock,
                    Stock_Status = :status
                WHERE Medicine_ID = :id
            """),
            {
                "stock": new_stock,
                "status": stock_status,
                "id": existing.Medicine_ID
            }
        )

        db.commit()

        return {
            "status": "success",
            "message": "Medicine already existed. Stock updated.",
            "Medicine_ID": existing.Medicine_ID,
            "Medicine_Name": existing.Medicine_Name,
            "Current_Stock": new_stock,
            "Stock_Status": stock_status
        }

    # -----------------------------------------------------
    # NEW MEDICINE
    # -----------------------------------------------------

    if current_stock <= 0:
        stock_status = "OUT_OF_STOCK"

    elif current_stock <= reorder_level:
        stock_status = "LOW_STOCK"

    else:
        stock_status = "AVAILABLE"

    result = db.execute(
        text("""
            INSERT INTO medicines
            (
                Medicine_Name,
                Current_Stock,
                Reorder_Level,
                Stock_Status,
                Expiry_Date,
                Supplier,
                PHC_Name
            )
            VALUES
            (
                :name,
                :stock,
                :reorder,
                :status,
                :expiry,
                :supplier,
                :phc
            )
        """),
        {
            "name": medicine_name,
            "stock": current_stock,
            "reorder": reorder_level,
            "status": stock_status,
            "expiry": expiry_date,
            "supplier": supplier,
            "phc": phc_name
        }
    )

    db.commit()

    return {
        "status": "success",
        "message": "Medicine added successfully",
        "Medicine_ID": result.lastrowid,
        "Medicine_Name": medicine_name,
        "Current_Stock": current_stock,
        "Stock_Status": stock_status
    }


# =========================================================
# UPDATE MEDICINE STOCK
# =========================================================

@router.put("/{medicine_id}/stock")
def update_stock(
    medicine_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    quantity = data.get("Quantity")

    if quantity is None:
        raise HTTPException(
            status_code=400,
            detail="Quantity is required"
        )

    quantity = int(quantity)

    medicine = db.execute(
        text("""
            SELECT *
            FROM medicines
            WHERE Medicine_ID = :id
        """),
        {"id": medicine_id}
    ).fetchone()

    if not medicine:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    new_stock = (
        medicine.Current_Stock or 0
    ) + quantity

    if new_stock < 0:
        new_stock = 0

    if new_stock == 0:
        status = "OUT_OF_STOCK"

    elif new_stock <= (
        medicine.Reorder_Level or 0
    ):
        status = "LOW_STOCK"

    else:
        status = "AVAILABLE"

    db.execute(
        text("""
            UPDATE medicines
            SET
                Current_Stock = :stock,
                Stock_Status = :status
            WHERE Medicine_ID = :id
        """),
        {
            "stock": new_stock,
            "status": status,
            "id": medicine_id
        }
    )

    db.commit()

    return {
        "status": "success",
        "message": "Stock updated",
        "Medicine_ID": medicine_id,
        "Current_Stock": new_stock,
        "Stock_Status": status
    }


# =========================================================
# CHECK MEDICINE REQUIREMENT FOR DISEASE
# =========================================================

@router.get("/requirement/{disease}")
def get_medicine_requirement(
    disease: str,
    db: Session = Depends(get_db)
):

    medicine_map = {

        "Dengue": [
            "Paracetamol",
            "ORS"
        ],

        "Fever": [
            "Paracetamol"
        ],

        "Diarrhoea": [
            "ORS"
        ],

        "Cough": [
            "Cough Syrup"
        ],

        "Common Cold": [
            "Cetirizine"
        ],

        "Anaemia": [
            "Iron Tablets"
        ]
    }

    required = medicine_map.get(
        disease,
        []
    )

    return {
        "disease": disease,
        "required_medicines": required
    }