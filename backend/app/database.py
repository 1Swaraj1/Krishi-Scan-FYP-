from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

# Replace with your MySQL credentials
DATABASE_URL = "mysql+mysqlconnector://root:password@localhost/krishiscan"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Call this once to create tables in DB
def init_db():
    Base.metadata.create_all(bind=engine)
