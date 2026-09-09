from predict import PATIENT_TRIGGER
from notifications import build_notification_record
from schemas import PatientCreate


def test_demo_thresholds():
    assert PATIENT_TRIGGER == 2


def test_patient_create_keeps_disease_for_trigger():
    payload = PatientCreate(Patient_Name="Asha", Disease="Asthma", Village="Mohanwadi")
    assert payload.Disease == "Asthma"
    assert payload.Village == "Mohanwadi"


def test_build_notification_record_includes_alert_link_and_expiry():
    payload = build_notification_record(
        alert_id=7,
        title="Disease outbreak",
        message="Dengue alert in village A",
        severity="HIGH",
    )

    assert payload["Alert_ID"] == 7
    assert payload["Title"] == "Disease outbreak"
    assert payload["Severity"] == "HIGH"
    assert payload["link"] == "/alerts"
    assert payload["expires_at"] is not None
