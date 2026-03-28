from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.llm import router as llm_router
from app.api.agent import router as agent_router
from app.api.media import router as media_router
from app.api.script import router as script_router
from app.api.media_search import router as media_search_router
from app.api.audio import router as audio_router
from app.api.conversational_editing import router as conversational_editing_router
from app.api.skill import router as skill_router
from app.api.media_enhanced import router as media_enhanced_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router, tags=["health"])
api_router.include_router(llm_router, prefix="/llm", tags=["llm"])
api_router.include_router(agent_router, prefix="/agent", tags=["agent"])
api_router.include_router(media_router, prefix="/media", tags=["media"])
api_router.include_router(script_router, prefix="/script", tags=["script"])
api_router.include_router(media_search_router, prefix="/media-search", tags=["media-search"])
api_router.include_router(audio_router, prefix="/audio", tags=["audio"])
api_router.include_router(conversational_editing_router, prefix="/editing", tags=["editing"])
api_router.include_router(skill_router, prefix="/skill", tags=["skill"])
api_router.include_router(media_enhanced_router, prefix="/media-enhanced", tags=["media-enhanced"])
