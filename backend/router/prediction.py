from fastapi import APIRouter

from predict import run_automatic_prediction


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


@router.post("/run")
def run_prediction():

    return run_automatic_prediction()