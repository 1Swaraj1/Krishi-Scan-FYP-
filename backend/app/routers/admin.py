from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.models import User, Log
from jose import jwt, JWTError

router = APIRouter()

SECRET_KEY = "your_secret_key_here"  # same as auth.py
ALGORITHM = "HS256"

# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- JWT Auth & Admin Check ----------------
def get_current_admin(authorization: str = Header(...), db: Session = Depends(get_db)):
    try:
        token = authorization.split(" ")[1]  # Bearer <token>
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user or user.role != 'admin':
            raise HTTPException(status_code=403, detail="Admin access required")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------- Get All Logs ----------------
@router.get("/logs", response_model=List[dict])
def get_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    logs = db.query(Log).order_by(Log.timestamp.desc()).offset(skip).limit(limit).all()
    return [
        {
            "log_id": log.log_id,
            "user_id": log.user_id,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp
        }
        for log in logs
    ]
