from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def api_home():
    return {"message": "AITOL API is working 🚀"}