from medicine import calculate_medicine_demand


def generate_alerts(predicted_cases):

    alerts = []

    # -------------------------
    # Disease Outbreak Alerts
    # -------------------------
    for disease, cases in predicted_cases.items():

        if cases >= 200:
            alerts.append({
                "type": "Disease Outbreak",
                "severity": "High",
                "message": f"High risk of {disease} outbreak. Predicted cases: {cases}"
            })

        elif cases >= 100:
            alerts.append({
                "type": "Disease Outbreak",
                "severity": "Medium",
                "message": f"{disease} cases are increasing. Predicted cases: {cases}"
            })

    # -------------------------
    # Medicine Stock Alerts
    # -------------------------
    medicines = calculate_medicine_demand(predicted_cases)

    for item in medicines:

        if item["restock_needed"] > 0:

            alerts.append({

                "type": "Medicine Stock",

                "severity": "High",

                "message":
                f"{item['medicine']} requires restocking. "
                f"Need {item['restock_needed']} more units."

            })

    return alerts