from sqlalchemy import Column, Integer, String, Enum, Float, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from app.database import Base

#Base = declarative_base()

# ------------------- Users Table -------------------
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(255), nullable=False)  # store hashed password
    role = Column(Enum('admin', 'user'), default='user', nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    predictions = relationship("Prediction", back_populates="user")
    logs = relationship("Log", back_populates="user")

# ------------------- Diseases Table -------------------
class Disease(Base):
    __tablename__ = "diseases"

    disease_id = Column(Integer, primary_key=True, index=True)
    disease_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    treatment = Column(Text)
    crop_type = Column(String(100))

    predictions = relationship("Prediction", back_populates="disease")

# ------------------- Predictions Table -------------------
class Prediction(Base):
    __tablename__ = "predictions"

    prediction_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    disease_id = Column(Integer, ForeignKey("diseases.disease_id", ondelete="SET NULL"), nullable=True)
    image_path = Column(String(255), nullable=False)
    predicted_label = Column(String(100), nullable=False)
    confidence_score = Column(Float, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="predictions")
    disease = relationship("Disease", back_populates="predictions")

# ------------------- Logs Table -------------------
class Log(Base):
    __tablename__ = "logs"

    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(Text)
    timestamp = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="logs")
