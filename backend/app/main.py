from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth, predict, admin, user
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Create DB tables from models
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Krishi-Scan API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(user.router, prefix="/user", tags=["User"])

# app.include_router(auth.router)
# app.include_router(predict.router)
# app.include_router(admin.router)
# Path to your uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ✅ Serve files under http://localhost:8000/uploads/<filename>
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
@app.get("/ping")
async def ping():
    return {"message": "pong!"}