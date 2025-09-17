from fastapi import APIRouter, UploadFile, File
from PIL import Image
import io
import numpy as np
from app.models.plant_model import model, CLASS_NAMES
from app.utils.preprocess import preprocess_image

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read uploaded file
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")

    # Preprocess image
    img_array = preprocess_image(img)

    # Make prediction
    preds = model.predict(img_array)
    predicted_class = CLASS_NAMES[np.argmax(preds[0])]
    confidence = float(np.max(preds[0]))

    return {
        "disease": predicted_class,
        "confidence": round(confidence * 100, 2)
    }
