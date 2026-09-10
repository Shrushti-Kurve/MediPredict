from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, date

from database import get_db
from stock_alerts import evaluate_medicine_alerts, STOCK_THRESHOLD

router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"]
)


# =========================================================
# GET ALL MEDICINES
# =========================================================

@router.get("/")
def get_medicines(db: Session = Depends(get_db)):
    # Run evaluation to ensure stock statuses and alerts are accurate
    try:
        evaluate_medicine_alerts()
    except Exception as e:
        print("Warning: evaluate_medicine_alerts failed:", e)

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

    medicines = []
    for row in result:
        m = dict(row._mapping)
        stock = m.get("Current_Stock") or 0
        if stock == 0:
            m["Stock_Status"] = "OUT_OF_STOCK"
        elif stock <= STOCK_THRESHOLD:
            m["Stock_Status"] = "LOW_STOCK"
        else:
            m["Stock_Status"] = "AVAILABLE"
        medicines.append(m)

    return medicines


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
# ADD MEDICINE (NEW OR RESTOCK)
# =========================================================

@router.post("/")
def add_medicine(
    data: dict,
    db: Session = Depends(get_db)
):
    medicine_name = data.get("Medicine_Name") or data.get("name")
    current_stock = int(data.get("Current_Stock", data.get("quantity", 0)))
    reorder_level = int(data.get("Reorder_Level", data.get("minimumStock", STOCK_THRESHOLD)))
    expiry_date = data.get("Expiry_Date") or data.get("expiryDate")
    supplier = data.get("Supplier") or data.get("supplier")
    phc_name = data.get("PHC_Name") or data.get("phcName") or "General PHC"

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
            WHERE LOWER(TRIM(Medicine_Name)) = LOWER(TRIM(:name))
        """),
        {"name": medicine_name}
    ).fetchone()

    # -----------------------------------------------------
    # IF EXISTS → UPDATE / ADD STOCK
    # -----------------------------------------------------
    if existing:
        # If explicitly restocking with absolute stock or adding:
        if data.get("set_absolute"):
            new_stock = current_stock
        else:
            new_stock = (existing.Current_Stock or 0) + current_stock

        if new_stock <= 0:
            stock_status = "OUT_OF_STOCK"
        elif new_stock <= STOCK_THRESHOLD:
            stock_status = "LOW_STOCK"
        else:
            stock_status = "AVAILABLE"

        update_params = {
            "stock": new_stock,
            "status": stock_status,
            "id": existing.Medicine_ID
        }

        sql_update = "UPDATE medicines SET Current_Stock = :stock, Stock_Status = :status"
        if expiry_date:
            sql_update += ", Expiry_Date = :expiry"
            update_params["expiry"] = expiry_date
        sql_update += " WHERE Medicine_ID = :id"

        db.execute(text(sql_update), update_params)
        db.commit()

        # Immediately recalculate active alerts
        evaluate_medicine_alerts(medicine_id=existing.Medicine_ID)

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
    elif current_stock <= STOCK_THRESHOLD:
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
    new_id = result.lastrowid

    # Immediately evaluate alerts for the new medicine
    evaluate_medicine_alerts(medicine_id=new_id)

    return {
        "status": "success",
        "message": "Medicine added successfully",
        "Medicine_ID": new_id,
        "Medicine_Name": medicine_name,
        "Current_Stock": current_stock,
        "Stock_Status": stock_status
    }


# =========================================================
# UPDATE MEDICINE DETAILS (Name, Expiry, Stock, Supplier)
# =========================================================

@router.put("/{medicine_id}")
def update_medicine(
    medicine_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    medicine = db.execute(
        text("SELECT * FROM medicines WHERE Medicine_ID = :id"),
        {"id": medicine_id}
    ).fetchone()

    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    name = data.get("Medicine_Name") or data.get("name") or medicine.Medicine_Name
    current_stock = data.get("Current_Stock") if data.get("Current_Stock") is not None else data.get("quantity")
    if current_stock is not None:
        new_stock = max(0, int(current_stock))
    else:
        new_stock = medicine.Current_Stock or 0

    expiry_date = data.get("Expiry_Date") or data.get("expiryDate") or medicine.Expiry_Date
    supplier = data.get("Supplier") or data.get("supplier") or medicine.Supplier
    phc_name = data.get("PHC_Name") or data.get("phcName") or medicine.PHC_Name

    if new_stock == 0:
        status = "OUT_OF_STOCK"
    elif new_stock <= STOCK_THRESHOLD:
        status = "LOW_STOCK"
    else:
        status = "AVAILABLE"

    db.execute(
        text("""
            UPDATE medicines
            SET
                Medicine_Name = :name,
                Current_Stock = :stock,
                Stock_Status = :status,
                Expiry_Date = :expiry,
                Supplier = :supplier,
                PHC_Name = :phc
            WHERE Medicine_ID = :id
        """),
        {
            "name": name,
            "stock": new_stock,
            "status": status,
            "expiry": expiry_date,
            "supplier": supplier,
            "phc": phc_name,
            "id": medicine_id
        }
    )
    db.commit()

    # Recalculate alerts
    evaluate_medicine_alerts(medicine_id=medicine_id)

    return {
        "status": "success",
        "message": "Medicine updated successfully",
        "Medicine_ID": medicine_id,
        "Current_Stock": new_stock,
        "Stock_Status": status
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
    medicine = db.execute(
        text("SELECT * FROM medicines WHERE Medicine_ID = :id"),
        {"id": medicine_id}
    ).fetchone()

    if not medicine:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    # Determine whether Quantity is a delta or absolute value
    if "Current_Stock" in data:
        new_stock = int(data["Current_Stock"])
    elif "quantity" in data and data.get("set_absolute"):
        new_stock = int(data["quantity"])
    elif "Quantity" in data and data.get("set_absolute"):
        new_stock = int(data["Quantity"])
    elif "Quantity" in data:
        # If is_delta is False or not specified, but Quantity >= 0:
        # Check if caller wants to set or add:
        if data.get("is_delta", True):
            new_stock = (medicine.Current_Stock or 0) + int(data["Quantity"])
        else:
            new_stock = int(data["Quantity"])
    elif "quantity" in data:
        new_stock = int(data["quantity"])
    else:
        raise HTTPException(status_code=400, detail="Stock quantity is required")

    if new_stock < 0:
        new_stock = 0

    if new_stock == 0:
        status = "OUT_OF_STOCK"
    elif new_stock <= STOCK_THRESHOLD:
        status = "LOW_STOCK"
    else:
        status = "AVAILABLE"

    expiry_date = data.get("Expiry_Date") or data.get("expiryDate")
    update_params = {
        "stock": new_stock,
        "status": status,
        "id": medicine_id
    }

    sql = "UPDATE medicines SET Current_Stock = :stock, Stock_Status = :status"
    if expiry_date:
        sql += ", Expiry_Date = :expiry"
        update_params["expiry"] = expiry_date
    sql += " WHERE Medicine_ID = :id"

    db.execute(text(sql), update_params)
    db.commit()

    # Recalculate medicine alerts immediately
    evaluate_medicine_alerts(medicine_id=medicine_id)

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
        "Dengue": ["Paracetamol", "ORS"],
        "Fever": ["Paracetamol"],
        "Diarrhoea": ["ORS"],
        "Cough": ["Cough Syrup"],
        "Common Cold": ["Cetirizine"],
        "Anaemia": ["Iron Tablets"],
        "Typhoid": ["Amoxicillin", "Paracetamol"],
        "Malaria": ["Chloroquine", "Paracetamol"],
        "Pneumonia": ["Amoxicillin", "Azithromycin"],
        "Asthma": ["Salbutamol"],
        "TB": ["Rifampicin"]
    }

    required = medicine_map.get(disease, ["Paracetamol"])

    return {
        "disease": disease,
        "required_medicines": required
    }