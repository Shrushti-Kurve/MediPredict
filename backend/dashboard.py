from predict import predict_outbreak
from medicine import get_medicine_requirement
from alerts import get_alerts


def dashboard(data):

    prediction = predict_outbreak(data)

    medicines = get_medicine_requirement(
        prediction["Disease"]
    )

    alerts = get_alerts()

    return {
        "prediction": prediction,
        "medicines": medicines,
        "alerts": alerts
    }