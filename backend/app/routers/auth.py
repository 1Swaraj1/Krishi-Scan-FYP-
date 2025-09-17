from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import User
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
from app.models.models import Log
router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your_secret_key_here"  # Change this


def log_action(db, user_id, action, details=None):
    log = Log(user_id=user_id, action=action, details=details)
    db.add(log)
    db.commit()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------- Signup -----------------
@router.post("/signup")
def signup(name: str, email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = pwd_context.hash(password)
    new_user = User(name=name, email=email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log the signup action
    log_action(db, new_user.user_id, "User signed up")
    return {"message": "User created successfully", "user_id": new_user.user_id}

# ----------------- Login -----------------
@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Generate JWT token
    payload = {
        "user_id": user.user_id,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    # Log the login action
    log_action(db, user.user_id, "User logged in")
    return {"access_token": token, "token_type": "bearer"}
