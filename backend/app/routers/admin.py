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

# ---------------- Response Model ----------------
class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    role: str
    created_at: str

    class Config:
        orm_mode = True

# ---------------- Get All Users ----------------
@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    users = db.query(User).all()
    # Convert datetime to string for validation
    for user in users:
        if hasattr(user, "created_at") and user.created_at:
            user.created_at = user.created_at.strftime("%Y-%m-%d %H:%M:%S")
    return users

# ---------------- Delete User ----------------
@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="Admin cannot delete themselves")

    db.delete(user)
    db.commit()
    return {"message": f"User {user.name} deleted successfully"}

# ---------------- Promote User ----------------
@router.put("/users/{user_id}/promote")
def promote_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = "admin"
    db.commit()
    return {"message": f"{user.name} promoted to admin"}

# ---------------- Demote User ----------------
@router.put("/users/{user_id}/demote")
def demote_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="Admin cannot demote themselves")

    user.role = "user"
    db.commit()
    return {"message": f"{user.name} demoted to user"}