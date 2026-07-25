from alerts import generate_alerts

prediction = {

    "Dengue":250,

    "Malaria":140,

    "COVID-19":60

}

alerts = generate_alerts(prediction)

for alert in alerts:

    print(alert)