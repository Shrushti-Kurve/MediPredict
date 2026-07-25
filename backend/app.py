from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict

from predict import predict_disease
from medicine import calculate_medicine_demand

app = FastAPI(title="MediPredict API", version="1.0.0")


class PredictionInput(BaseModel):
    year: int
    month: int
    state: str
    disease_name: str


class MedicineRequest(BaseModel):
    predicted_cases: Dict[str, int]


@app.get("/")
def home():
    return {"message": "MediPredict Backend Running"}


@app.post("/predict-disease")
def predict_disease_route(data: PredictionInput):
    try:
        result = predict_disease(data.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/medicine-demand")
def medicine_demand_route(data: MedicineRequest):
    try:
        result = calculate_medicine_demand(data.predicted_cases)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))