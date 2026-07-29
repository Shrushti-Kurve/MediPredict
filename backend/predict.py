import joblib
import pandas as pd

from config import MODEL_PATH, ENCODER_PATH

# Load model
model = joblib.load(MODEL_PATH)

# Load encoders
label_encoders = joblib.load(ENCODER_PATH)


def predict_outbreak(data):

    try:

        village = label_encoders["Village"].transform(
            [data["Village"]]
        )[0]

        disease = label_encoders["Disease"].transform(
            [data["Disease"]]
        )[0]

        season = label_encoders["Season"].transform(
            [data["Season"]]
        )[0]

        input_df = pd.DataFrame({
            "Village": [village],
            "Disease": [disease],
            "Season": [season],
            "Year": [data["Year"]],
            "Month": [data["Month"]]
        })

        prediction = model.predict(input_df)[0]

        return {
            "Village": data["Village"],
            "Disease": data["Disease"],
            "Predicted_Cases": int(round(prediction))
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }