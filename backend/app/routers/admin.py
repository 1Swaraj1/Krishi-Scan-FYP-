from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import jwt, JWTError
from app.database import SessionLocal
from app.models.models import User, Log
from pydantic import BaseModel

router = APIRouter()

# ---------------- Constants ----------------
SECRET_KEY = "your_secret_key_here"  # must match the one in auth.py
ALGORITHM = "HS256"


# ---------------- Pydantic Response Model ----------------
class LogResponse(BaseModel):
    log_id: int
    user_id: int
    action: str
    details: Optional[str] = None
    timestamp: str

    class Config:
        orm_mode = True


# ---------------- Database Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- JWT Auth & Admin Check ----------------
def get_current_admin(authorization: str = Header(...), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing or invalid")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    return user


# ---------------- Get All Logs ----------------
@router.get("/logs", response_model=List[LogResponse])
def get_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    logs = (
        db.query(Log)
        .order_by(Log.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    for log in logs:
        log.timestamp = log.timestamp.strftime("%Y-%m-%d %H:%M:%S")
    return logs
