from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth, predict, admin
from fastapi.middleware.cors import CORSMiddleware
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

# app.include_router(auth.router)
# app.include_router(predict.router)
# app.include_router(admin.router)

@app.get("/ping")
async def ping():
    return {"message": "pong!"}