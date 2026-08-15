from pydantic import BaseModel
from typing import Optional


# =========================================================
# ML PREDICTION
# =========================================================

from pydantic import BaseModel
from typing import Optional


class PredictionRequest(BaseModel):
    Village: Optional[str] = None
    Disease: Optional[str] = None
    Season: Optional[str] = None
    Year: Optional[int] = None
    Month: Optional[int] = None


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