from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from patients import router as patient_router

from medicines import (
    router as medicine_router,
    get_medicine_requirement
)

from notifications import router as notification_router

from schemas import PredictionRequest

from predict import predict_outbreak

from alerts import router as alert_router

from dashboard import dashboard

from prescriptions import router as prescription_router


app = FastAPI(
    title="MediPredict API",
    version="2.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(patient_router)

app.include_router(medicine_router)

app.include_router(notification_router)

app.include_router(prescription_router)

app.include_router(alert_router)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "MediPredict Backend Running"
    }


# =========================================================
# ML PREDICTION
# =========================================================

@app.post("/predict-outbreak")
def predict(
    data: PredictionRequest
):

    return predict_outbreak(
        data.model_dump()
    )


# =========================================================
# MEDICINE REQUIREMENT
# =========================================================

@app.get("/medicine/{disease}")
def medicine(
    disease: str
):

    return get_medicine_requirement(disease)


# =========================================================
# ALERTS
# =========================================================


# =========================================================
# DASHBOARD
# =========================================================

@app.post("/dashboard")
def dashboard_api(
    data: PredictionRequest
):
    return dashboard(
        data.model_dump()
    )