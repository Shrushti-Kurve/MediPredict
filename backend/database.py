from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# IMPORTANT:
# Use the password that actually works when you connect with:
# mysql -h 127.0.0.1 -P 3306 -u root -p
#
# If your root password is blank, leave it as "".
DB_PASSWORD = ""

DATABASE_URL = (
    f"mysql+pymysql://root:{DB_PASSWORD}"
    "@127.0.0.1:3306/hospital"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()