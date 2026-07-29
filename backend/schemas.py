from pydantic import BaseModel


class PredictionRequest(BaseModel):

    Village: str
    Disease: str
    Season: str
    Year: int
    Month: int