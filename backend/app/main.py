from fastapi import FastAPI
from app import database
from app.models import user_model, prediction_model, chat_model
from app.routers import auth, predict, chat

# Create DB tables
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Krishi-Scan API")

# Register routers
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(chat.router)
