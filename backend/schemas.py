from pydantic import BaseModel
from typing import Optional


# =========================================================
# ML PREDICTION
# =========================================================

class PredictionRequest(BaseModel):

    Village: str
    Disease: str
    Season: str
    Year: int
    Month: int


# =========================================================
# STAFF → ADD PATIENT
# =========================================================

class PatientCreate(BaseModel):

    Patient_Name: str
    Age: Optional[int] = None
    Gender: Optional[str] = None
    Village: Optional[str] = None
    Visit_Date: Optional[str] = None


# =========================================================
# DOCTOR → UPDATE PATIENT
# =========================================================

class PatientUpdate(BaseModel):

    Disease: Optional[str] = None
    Symptoms: Optional[str] = None
    Doctor: Optional[str] = None
    Doctor_User_ID: Optional[int] = None


# =========================================================
# PHARMACIST → ADD MEDICINE
# =========================================================

class MedicineCreate(BaseModel):

    Medicine_Name: str

    Current_Stock: int = 0

    Reorder_Level: int = 0

    Expiry_Date: Optional[str] = None

    Supplier: Optional[str] = None

    PHC_Name: Optional[str] = None


# =========================================================
# PHARMACIST → ADD / REMOVE STOCK
# =========================================================

class MedicineStockUpdate(BaseModel):

    quantity: int