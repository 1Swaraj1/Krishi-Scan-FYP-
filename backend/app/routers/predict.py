from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import User, Disease, Prediction, Log
from jose import jwt, JWTError
import tensorflow as tf
import numpy as np
import os
import shutil
from datetime import datetime

# ---------------- Router ----------------
router = APIRouter(prefix="/predict", tags=["Prediction"])

# ---------------- Model Path ----------------
# Go back two levels from app/routers/ to reach project root where model is stored
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../plant_disease_cnn_model.keras"))

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f" Model loaded successfully from: {MODEL_PATH}")
except Exception as e:
    print(f" Error loading model from {MODEL_PATH}: {e}")
    model = None  # fallback to prevent server crash

# ---------------- Upload Folder ----------------
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "../uploads"))
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- JWT Config ----------------
SECRET_KEY = "your_secret_key_here"  # must match auth.py
ALGORITHM = "HS256"

# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- Logging ----------------
def log_action(db, user_id, action, details=None):
    log = Log(user_id=user_id, action=action, details=details)
    db.add(log)
    db.commit()

# ---------------- JWT Auth Dependency ----------------
def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    """
    Decode JWT and return the current user.
    """
    try:
        token = authorization.split(" ")[1]  # Expecting "Bearer <token>"
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except (JWTError, IndexError):
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------- Prediction API ----------------
@router.post("/", summary="Predict plant disease from uploaded image")
async def predict(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a leaf image, predict disease, and return description + treatment.
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server")

    user_id = current_user.user_id

    # Save uploaded file
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{user_id}_{timestamp}{file_ext}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Preprocess image
    try:
        img = tf.keras.preprocessing.image.load_img(file_path, target_size=(256,256))
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {e}")

    # Predict
    predictions = model.predict(img_array)
    predicted_index = int(np.argmax(predictions[0]))
    confidence_score = float(np.max(predictions[0]))

    # Replace with your actual labels
    class_labels = ["Early Blight", "Late Blight", "Healthy"]
    predicted_label = class_labels[predicted_index]

    # Get disease details from DB
    disease = db.query(Disease).filter(Disease.disease_name == predicted_label).first()
    disease_id = disease.disease_id if disease else None

    # Save prediction in DB
    new_pred = Prediction(
        user_id=user_id,
        disease_id=disease_id,
        image_path=file_path,
        predicted_label=predicted_label,
        confidence_score=confidence_score
    )
    db.add(new_pred)
    db.commit()
    db.refresh(new_pred)

    # Log prediction
    log_action(db, user_id, "Prediction made", details=f"Prediction ID: {new_pred.prediction_id}")

    # Build response
    return {
        "prediction_id": new_pred.prediction_id,
        "predicted_label": predicted_label,
        "confidence_score": confidence_score,
        "disease_description": disease.description if disease else "Description not found.",
        "disease_treatment": disease.treatment if disease else "Treatment not available."
    }
