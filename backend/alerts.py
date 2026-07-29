import pandas as pd

from config import STOCK_ALERT_PATH


def get_alerts():

    alerts = pd.read_csv(STOCK_ALERT_PATH)

    return alerts.to_dict(
        orient="records"
    )