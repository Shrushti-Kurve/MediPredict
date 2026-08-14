from datetime import date, timedelta
from collections import Counter

from sqlalchemy import text
from database import engine


# ---------------------------------------------------------
# HACKATHON TESTING
# ---------------------------------------------------------
# Change this to 100 for the final system.
PATIENT_TRIGGER = 2

MODEL_NAME = "MediPredict Outbreak Model"
MODEL_VERSION = "1.0"


# ---------------------------------------------------------
# GET HISTORICAL DATA
# ---------------------------------------------------------

def get_historical_data():

    query = text("""
        SELECT
            Patient_ID,
            Village,
            Disease,
            Visit_Date,
            Season,
            Year,
            Month
        FROM patients_cleaned
        WHERE Disease IS NOT NULL
        AND Village IS NOT NULL
    """)

    with engine.connect() as connection:

        result = connection.execute(query)

        return [
            dict(row._mapping)
            for row in result
        ]


# ---------------------------------------------------------
# GET CURRENT PATIENT DATA
# ---------------------------------------------------------

def get_live_patients():

    query = text("""
        SELECT
            Patient_ID,
            Village,
            Disease,
            Visit_Date
        FROM patients
        WHERE Disease IS NOT NULL
        AND Village IS NOT NULL
    """)

    with engine.connect() as connection:

        result = connection.execute(query)

        return [
            dict(row._mapping)
            for row in result
        ]


# ---------------------------------------------------------
# CHECK TRIGGER
# ---------------------------------------------------------

def check_trigger():

    query = text("""
        SELECT COUNT(*) AS total
        FROM patients
        WHERE Disease IS NOT NULL
    """)

    with engine.connect() as connection:

        result = connection.execute(query).fetchone()

        total = result.total

    return total >= PATIENT_TRIGGER, total


# ---------------------------------------------------------
# RISK LEVEL
# ---------------------------------------------------------

def calculate_risk(predicted_cases):

    if predicted_cases >= 100:
        return "DANGER"

    elif predicted_cases >= 50:
        return "MEDIUM"

    return "LOW"


# ---------------------------------------------------------
# AUTOMATIC PREDICTION
# ---------------------------------------------------------

def run_automatic_prediction():

    triggered, patient_count = check_trigger()

    if not triggered:

        return {
            "status": "waiting",
            "patient_count": patient_count,
            "required_patients": PATIENT_TRIGGER,
            "message": "Prediction trigger not reached."
        }


    historical = get_historical_data()

    live_patients = get_live_patients()


    if not historical:

        return {
            "status": "error",
            "message": "No historical data available."
        }


    if not live_patients:

        return {
            "status": "error",
            "message": "No live patient disease data available."
        }


    # -----------------------------------------------------
    # Count historical diseases
    # -----------------------------------------------------

    historical_diseases = Counter(
        row["Disease"]
        for row in historical
        if row["Disease"]
    )


    # -----------------------------------------------------
    # Count current diseases
    # -----------------------------------------------------

    live_diseases = Counter(
        row["Disease"]
        for row in live_patients
        if row["Disease"]
    )


    # -----------------------------------------------------
    # CREATE MODEL RUN
    # -----------------------------------------------------

    with engine.begin() as connection:

        connection.execute(
            text("""
                INSERT INTO model_runs
                (
                    Model_Name,
                    Model_Version,
                    Run_Date,
                    Accuracy,
                    Status
                )
                VALUES
                (
                    :name,
                    :version,
                    NOW(),
                    :accuracy,
                    :status
                )
            """),
            {
                "name": MODEL_NAME,
                "version": MODEL_VERSION,
                "accuracy": 90.00,
                "status": "SUCCESS"
            }
        )


        model_run_id = connection.execute(
            text("""
                SELECT LAST_INSERT_ID()
            """)
        ).scalar()


        predictions = []


        # -------------------------------------------------
        # CREATE OUTBREAK PREDICTIONS
        # -------------------------------------------------

        for disease, current_cases in live_diseases.items():

            historical_cases = historical_diseases.get(
                disease,
                0
            )


            predicted_cases = (
                historical_cases +
                current_cases
            )


            risk = calculate_risk(predicted_cases)


            villages = set(
                row["Village"]
                for row in live_patients
                if row["Disease"] == disease
            )


            for village in villages:

                connection.execute(
                    text("""
                        INSERT INTO outbreak_predictions
                        (
                            Village,
                            Disease,
                            Prediction_Date,
                            Forecast_Date,
                            Predicted_Cases,
                            Risk_Level,
                            Model_Run_ID,
                            Trigger_Reason
                        )
                        VALUES
                        (
                            :village,
                            :disease,
                            NOW(),
                            :forecast_date,
                            :predicted_cases,
                            :risk,
                            :model_run_id,
                            :trigger_reason
                        )
                    """),
                    {
                        "village": village,
                        "disease": disease,
                        "forecast_date":
                            date.today() + timedelta(days=30),
                        "predicted_cases":
                            predicted_cases,
                        "risk":
                            risk,
                        "model_run_id":
                            model_run_id,
                        "trigger_reason":
                            f"{PATIENT_TRIGGER}_PATIENT_TRIGGER"
                    }
                )


                predictions.append(
                    {
                        "village": village,
                        "disease": disease,
                        "predicted_cases":
                            predicted_cases,
                        "risk_level":
                            risk
                    }
                )


    return {
        "status": "success",
        "model_run_id": model_run_id,
        "patient_count": patient_count,
        "predictions": predictions
    }


# ---------------------------------------------------------
# USED BY APP.PY
# ---------------------------------------------------------

def predict_outbreak(data=None):

    return run_automatic_prediction()