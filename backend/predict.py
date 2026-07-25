import joblib
import pandas as pd

from config import MODEL_PATH, ENCODER_PATH


# Load trained model
model = joblib.load(MODEL_PATH)

# Load label encoders
label_encoders = joblib.load(ENCODER_PATH)


def predict_disease(data):
    """
    data example:
    {
        "year":2026,
        "month":8,
        "state":"Maharashtra",
        "disease_name":"Dengue"
    }
    """

    try:

        state = label_encoders["state"].transform(
            [data["state"]]
        )[0]

        disease = label_encoders["disease_name"].transform(
            [data["disease_name"]]
        )[0]

        input_df = pd.DataFrame({
            "year":[data["year"]],
            "month":[data["month"]],
            "state":[state],
            "disease_name":[disease]
        })

        prediction = model.predict(input_df)[0]

        return {
            "status":"success",
            "predicted_cases":int(round(prediction))
        }

    except Exception as e:

        return {
            "status":"error",
            "message":str(e)
        }