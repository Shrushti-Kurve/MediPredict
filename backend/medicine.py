import pandas as pd

from config import (
    MEDICINE_USAGE,
    MEDICINE_INVENTORY
)

medicine_usage = pd.read_csv(MEDICINE_USAGE)
medicine_inventory = pd.read_csv(MEDICINE_INVENTORY)


def calculate_medicine_demand(predicted_cases):

    """
    predicted_cases example:

    {
        "Dengue":120,
        "Malaria":80
    }

    """

    result = []

    for disease, cases in predicted_cases.items():

        medicines = medicine_usage[
            medicine_usage["disease_name"] == disease
        ]

        for _, row in medicines.iterrows():

            medicine = row["medicine_name"]

            qty_per_patient = row["quantity_per_patient"]

            total_required = cases * qty_per_patient

            stock = medicine_inventory[
                medicine_inventory["medicine_name"] == medicine
            ]

            if stock.empty:

                current_stock = 0

            else:

                current_stock = int(stock.iloc[0]["current_stock"])

            restock = max(total_required - current_stock, 0)

            result.append({

                "disease": disease,

                "medicine": medicine,

                "predicted_cases": int(cases),

                "required_quantity": int(total_required),

                "current_stock": current_stock,

                "restock_needed": int(restock),

                "status":
                "Restock Required"
                if restock > 0
                else
                "Stock Available"

            })

    return result