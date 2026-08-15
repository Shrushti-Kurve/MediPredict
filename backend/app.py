from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router.prediction import router as prediction_router
from predict import predict_outbreak
from patients import router as patient_router
from sqlalchemy import text
from database import engine
from stock_alerts import generate_medicine_alerts
from alert_generator import generate_all_alerts

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

from router.alerts import router as alerts_router



app = FastAPI(
    title="MediPredict API",
    version="2.0"
)

@app.post("/alerts/generate")
def generate_alerts():

    return generate_all_alerts()
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

app.include_router(prediction_router)

app.include_router(alerts_router)


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


@app.post("/predict")
def run_prediction():

    result = predict_outbreak()

    return result


@app.post("/generate-stock-alerts")
def generate_stock_alerts():

    return generate_medicine_alerts()



@app.get("/predictions")
def get_predictions():

    query = text("""
        SELECT
            Prediction_ID,
            Village,
            Disease,
            Prediction_Date,
            Forecast_Date,
            Predicted_Cases,
            Risk_Level,
            Model_Run_ID,
            Trigger_Reason
        FROM outbreak_predictions
        ORDER BY Prediction_Date DESC
    """)

    with engine.connect() as connection:

        result = connection.execute(query).mappings().all()

        return [dict(row) for row in result]


    