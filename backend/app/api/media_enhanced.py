from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.core.media_enhanced import (
    get_speech_system,
    get_enhanced_media_library,
    get_rough_cut_generator,
    EnhancedMediaAsset,
    MediaType,
    MediaQuality
)

router = APIRouter()


class TranscribeRequest(BaseModel):
    audio_path: str = Field(..., description="Path to audio file")
    language: Optional[str] = Field(None, description="Language code (optional)")
    task: str = Field("transcribe", description="Task type: transcribe or translate")


class RoughCutRequest(BaseModel):
    audio_path: str = Field(..., description="Path to audio file")
    remove_fillers: bool = Field(True, description="Remove filler words")
    remove_repeats: bool = Field(True, description="Remove repeated sentences")
    remove_disfluencies: bool = Field(True, description="Remove disfluencies")
    min_segment_duration: float = Field(0.5, description="Minimum segment duration in seconds")


class MediaAssetCreateRequest(BaseModel):
    file_path: str = Field(..., description="Path to media file")
    media_type: str = Field("image", description="Media type: image, video, audio, document")
    tags: Optional[List[str]] = Field(None, description="Optional tags")
    quality: str = Field("original", description="Quality: low, medium, high, original")


class MediaSearchRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search query")
    media_type: Optional[str] = Field(None, description="Media type filter")
    tags: Optional[List[str]] = Field(None, description="Tags filter")
    sentiment: Optional[str] = Field(None, description="Sentiment filter")
    limit: int = Field(50, description="Maximum results")


@router.post("/speech/transcribe")
async def transcribe_audio(request: TranscribeRequest):
    try:
        speech_system = get_speech_system()
        result = await speech_system.transcribe_audio(
            audio_path=request.audio_path,
            language=request.language,
            task=request.task
        )
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/speech/rough-cut")
async def generate_rough_cut(request: RoughCutRequest):
    try:
        speech_system = get_speech_system()
        rough_cut_gen = get_rough_cut_generator()
        
        asr_result = await speech_system.transcribe_audio(
            audio_path=request.audio_path
        )
        
        rough_cut = await rough_cut_gen.generate_rough_cut(
            audio_path=request.audio_path,
            asr_result=asr_result,
            remove_fillers=request.remove_fillers,
            remove_repeats=request.remove_repeats,
            remove_disfluencies=request.remove_disfluencies,
            min_segment_duration=request.min_segment_duration
        )
        
        return rough_cut
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rough cut generation failed: {str(e)}")


@router.post("/assets")
async def create_media_asset(request: MediaAssetCreateRequest):
    try:
        library = get_enhanced_media_library()
        
        media_type_enum = MediaType(request.media_type)
        quality_enum = MediaQuality(request.quality)
        
        asset = EnhancedMediaAsset(
            file_path=request.file_path,
            media_type=media_type_enum,
            tags=request.tags,
            quality=quality_enum
        )
        
        library.add_asset(asset)
        return asset.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create asset: {str(e)}")


@router.get("/assets/{asset_id}")
async def get_media_asset(asset_id: str):
    try:
        library = get_enhanced_media_library()
        asset = library.get_asset(asset_id)
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        return asset.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get asset: {str(e)}")


@router.post("/assets/search")
async def search_media_assets(request: MediaSearchRequest):
    try:
        library = get_enhanced_media_library()
        
        media_type = MediaType(request.media_type) if request.media_type else None
        
        assets = library.search_assets(
            query=request.query,
            media_type=media_type,
            tags=request.tags,
            sentiment=request.sentiment,
            limit=request.limit
        )
        
        return [asset.to_dict() for asset in assets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/assets")
async def list_all_assets():
    try:
        library = get_enhanced_media_library()
        assets = library.get_all_assets()
        return [asset.to_dict() for asset in assets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list assets: {str(e)}")
