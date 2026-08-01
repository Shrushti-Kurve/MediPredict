from pathlib import Path

# Project Root
BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================
# Models
# ==========================

MODEL_PATH = BASE_DIR / "models" / "disease_model.pkl"

ENCODER_PATH = BASE_DIR / "models" / "label_encoders.pkl"

# ==========================
# Dataset Output Files
# ==========================

FORECAST_PATH = (
    BASE_DIR
    / "dataset"
    / "output"
    / "disease_forecast.csv"
)

MEDICINE_REQUIREMENT_PATH = (
    BASE_DIR
    / "dataset"
    / "output"
    / "medicine_requirement.csv"
)

STOCK_ALERT_PATH = (
    BASE_DIR
    / "dataset"
    / "output"
    / "medicine_stock_alert.csv"
)

# ==========================
# Database
# ==========================

DATABASE_URL = "mysql+pymysql://root:password@localhost/phc_database"