import pandas as pd

from config import MEDICINE_REQUIREMENT_PATH

medicine_df = pd.read_csv(MEDICINE_REQUIREMENT_PATH)


def get_medicine_requirement(disease):

    result = medicine_df[
        medicine_df["Disease"] == disease
    ]

    return result.to_dict(orient="records")