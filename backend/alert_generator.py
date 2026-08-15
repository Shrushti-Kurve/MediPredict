from predict import run_automatic_prediction
from stock_alerts import generate_medicine_alerts


def generate_all_alerts():

    disease_result = run_automatic_prediction()

    medicine_result = generate_medicine_alerts()

    return {
        "disease_alerts": disease_result,
        "medicine_alerts": medicine_result
    }