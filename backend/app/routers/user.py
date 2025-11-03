from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import Prediction, User
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# ✅ Pydantic schema (you can keep it here if schemas.py doesn't exist)
class PredictionResponse(BaseModel):
    prediction_id: int
    image_path: str
    predicted_label: str
    confidence_score: float
    created_at: datetime

    class Config:
        orm_mode = True


# ✅ Fetch user prediction history
@router.get("/{user_id}/history", response_model=List[PredictionResponse])
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch predictions for the given user
    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    if not predictions:
        raise HTTPException(status_code=404, detail="No predictions found for this user")

    return predictions
