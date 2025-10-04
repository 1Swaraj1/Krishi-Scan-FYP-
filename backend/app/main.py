from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth, predict, admin

# Create DB tables from models
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Krishi-Scan API")


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
