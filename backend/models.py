from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date
)

from database import Base


# =========================================================
# PATIENTS
# =========================================================

class Patient(Base):

    __tablename__ = "patients"

    Patient_ID = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    Patient_Name = Column(
        String(100),
        nullable=False
    )

    Age = Column(
        Integer,
        nullable=True
    )

    Gender = Column(
        String(20),
        nullable=True
    )

    Village = Column(
        String(100),
        nullable=True
    )

    Visit_Date = Column(
        Date,
        nullable=True
    )

    Disease = Column(
        String(100),
        nullable=True
    )

    Symptoms = Column(
        Text,
        nullable=True
    )

    Doctor = Column(
        String(100),
        nullable=True
    )

    Doctor_User_ID = Column(
        Integer,
        nullable=True
    )


# =========================================================
# MEDICINES
# =========================================================

class Medicine(Base):

    __tablename__ = "medicines"

    Medicine_ID = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    Medicine_Name = Column(
        String(100),
        nullable=False,
        unique=True
    )

    Current_Stock = Column(
        Integer,
        default=0
    )

    Reorder_Level = Column(
        Integer,
        default=0
    )

    Stock_Status = Column(
        String(50),
        nullable=True
    )

    Expiry_Date = Column(
        Date,
        nullable=True
    )

    Supplier = Column(
        String(100),
        nullable=True
    )

    PHC_Name = Column(
        String(100),
        nullable=True
    )