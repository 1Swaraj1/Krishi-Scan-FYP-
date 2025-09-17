from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# Replace with your MySQL credentials
DATABASE_URL = "mysql+mysqlconnector://root:swaraj@localhost/krishiscan"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
# Call this once to create tables in DB
def init_db():
    Base.metadata.create_all(bind=engine)
