from pydantic import BaseModel


class Patient(BaseModel):

    age: int

    gender: str

    state: str

    city: str

    season: str

    symptoms: str

    bmi: float

    smoking_status: str

    alcohol_use: str

    comorbidity: str