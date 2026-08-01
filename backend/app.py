from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from schemas import PredictionRequest
from predict import predict_outbreak
from medicine import get_medicine_requirement
from alerts import get_alerts
from dashboard import dashboard

app = FastAPI(
    title="MediPredict API",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "MediPredict Backend Running"}


@app.post("/predict-outbreak")
def predict(data: PredictionRequest):
    return predict_outbreak(data.model_dump())


@app.get("/medicine/{disease}")
def medicine(disease: str):
    return get_medicine_requirement(disease)


@app.get("/alerts")
def alerts():
    return get_alerts()


@app.post("/dashboard")
def dashboard_api(data: PredictionRequest):
    return dashboard(data.model_dump())