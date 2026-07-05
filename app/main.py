from fastapi import FastAPI

from app.api.routes import router

app = FastAPI(title="AITOL API")

app.include_router(router, prefix="/api")


@app.get("/")
def home():
    return {"message": "AITOL Backend Running 🚀"}