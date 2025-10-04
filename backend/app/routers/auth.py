from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import User, Log
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt  # PyJWT

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your_secret_key_here"  # Change this

# ----------------- Pydantic Schemas -----------------
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ----------------- DB Dependency -----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------- Logging -----------------
def log_action(db: Session, user_id: int, action: str, details: str = None):
    log = Log(user_id=user_id, action=action, details=details)
    db.add(log)
    db.commit()

# ----------------- Signup -----------------
@router.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(request.password)
    new_user = User(name=request.name, email=request.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_action(db, new_user.user_id, "User signed up")
    return {"message": "User created successfully", "user_id": new_user.user_id}

# ----------------- Login -----------------
@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not pwd_context.verify(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload = {
        "user_id": user.user_id,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    log_action(db, user.user_id, "User logged in")
    return {"access_token": token, "token_type": "bearer"}
