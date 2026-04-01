from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.timeline.timeline_manager import (
    get_timeline_manager,
    TimelineClip,
    TimelineTrack,
    TimelineTransition,
    ClipType,
    TrackType,
    TransitionType
)

router = APIRouter()


class CreateProjectRequest(BaseModel):
    name: str = "Untitled Project"
    description: str = ""
    width: int = 1920
    height: int = 1080
    fps: float = 30.0


class UpdateProjectRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    fps: Optional[float] = None


class AddClipRequest(BaseModel):
    clip_type: str = "video"
    title: str = ""
    media_path: Optional[str] = None
    start_time: float = 0.0
    duration: float = 0.0
    track_index: int = 0
    properties: Optional[Dict[str, Any]] = None


class UpdateClipRequest(BaseModel):
    title: Optional[str] = None
    start_time: Optional[float] = None
    duration: Optional[float] = None
    track_index: Optional[int] = None
    properties: Optional[Dict[str, Any]] = None


class SplitClipRequest(BaseModel):
    split_time: float


class AddTransitionRequest(BaseModel):
    transition_type: str = "cut"
    from_clip_id: Optional[str] = None
    to_clip_id: Optional[str] = None
    duration: float = 0.5
    properties: Optional[Dict[str, Any]] = None


class AddTrackRequest(BaseModel):
    track_type: str = "video"
    name: str = ""


class CopyClipRequest(BaseModel):
    new_start_time: Optional[float] = None


class MergeClipsRequest(BaseModel):
    clip_ids: List[str]


class ReorderClipsRequest(BaseModel):
    clip_order: List[str]


class TrimClipRequest(BaseModel):
    trim_start: float = 0
    trim_end: float = 0


class DuplicateProjectRequest(BaseModel):
    new_name: Optional[str] = None


@router.post("/projects")
async def create_project(request: CreateProjectRequest):
    manager = get_timeline_manager()
    project = manager.create_project(
        name=request.name,
        description=request.description,
        width=request.width,
        height=request.height,
        fps=request.fps
    )
    return {"success": True, "project": project.to_dict()}


@router.get("/projects")
async def list_projects():
    manager = get_timeline_manager()
    projects = manager.list_projects()
    return {"success": True, "projects": projects}


@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    manager = get_timeline_manager()
    project = manager.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True, "project": project.to_dict()}


@router.put("/projects/{project_id}")
async def update_project(project_id: str, request: UpdateProjectRequest):
    manager = get_timeline_manager()
    project = manager.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if request.name is not None:
        project.name = request.name
    if request.description is not None:
        project.description = request.description
    if request.width is not None:
        project.width = request.width
    if request.height is not None:
        project.height = request.height
    if request.fps is not None:
        project.fps = request.fps
    
    manager.save_project(project)
    return {"success": True, "project": project.to_dict()}


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    manager = get_timeline_manager()
    success = manager.delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True}


@router.post("/projects/{project_id}/clips")
async def add_clip(project_id: str, request: AddClipRequest):
    manager = get_timeline_manager()
    project = manager.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        clip_type = ClipType(request.clip_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid clip type")
    
    clip = TimelineClip(
        clip_type=clip_type,
        title=request.title,
        media_path=request.media_path,
        start_time=request.start_time,
        duration=request.duration,
        track_index=request.track_index,
        properties=request.properties or {}
    )
    
    added_clip = manager.add_clip(project_id, clip)
    if not added_clip:
        raise HTTPException(status_code=500, detail="Failed to add clip")
    
    return {"success": True, "clip": added_clip.to_dict()}


@router.put("/projects/{project_id}/clips/{clip_id}")
async def update_clip(project_id: str, clip_id: str, request: UpdateClipRequest):
    manager = get_timeline_manager()
    update_kwargs = {}
    if request.title is not None:
        update_kwargs["title"] = request.title
    if request.start_time is not None:
        update_kwargs["start_time"] = request.start_time
    if request.duration is not None:
        update_kwargs["duration"] = request.duration
    if request.track_index is not None:
        update_kwargs["track_index"] = request.track_index
    if request.properties is not None:
        update_kwargs["properties"] = request.properties
    
    clip = manager.update_clip(project_id, clip_id, **update_kwargs)
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    
    return {"success": True, "clip": clip.to_dict()}


@router.delete("/projects/{project_id}/clips/{clip_id}")
async def delete_clip(project_id: str, clip_id: str):
    manager = get_timeline_manager()
    success = manager.delete_clip(project_id, clip_id)
    if not success:
        raise HTTPException(status_code=404, detail="Clip not found")
    return {"success": True}


@router.post("/projects/{project_id}/clips/{clip_id}/split")
async def split_clip(project_id: str, clip_id: str, request: SplitClipRequest):
    manager = get_timeline_manager()
    clips = manager.split_clip(project_id, clip_id, request.split_time)
    if not clips:
        raise HTTPException(status_code=400, detail="Failed to split clip")
    return {"success": True, "clips": [c.to_dict() for c in clips]}


@router.post("/projects/{project_id}/transitions")
async def add_transition(project_id: str, request: AddTransitionRequest):
    manager = get_timeline_manager()
    project = manager.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        transition_type = TransitionType(request.transition_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transition type")
    
    transition = TimelineTransition(
        transition_type=transition_type,
        from_clip_id=request.from_clip_id,
        to_clip_id=request.to_clip_id,
        duration=request.duration,
        properties=request.properties or {}
    )
    
    added_transition = manager.add_transition(project_id, transition)
    if not added_transition:
        raise HTTPException(status_code=500, detail="Failed to add transition")
    
    return {"success": True, "transition": added_transition.to_dict()}


@router.post("/projects/{project_id}/tracks")
async def add_track(project_id: str, request: AddTrackRequest):
    manager = get_timeline_manager()
    project = manager.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        track_type = TrackType(request.track_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid track type")
    
    track = TimelineTrack(
        track_type=track_type,
        name=request.name or f"{track_type.value.capitalize()} Track {len(project.tracks) + 1}"
    )
    
    added_track = manager.add_track(project_id, track)
    if not added_track:
        raise HTTPException(status_code=500, detail="Failed to add track")
    
    return {"success": True, "track": added_track.to_dict()}


@router.get("/projects/{project_id}/preview")
async def get_preview_info(project_id: str):
    manager = get_timeline_manager()
    project = manager.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        "success": True,
        "preview": {
            "project_id": project.project_id,
            "name": project.name,
            "width": project.width,
            "height": project.height,
            "fps": project.fps,
            "total_duration": project.total_duration,
            "clip_count": len(project.clips),
            "track_count": len(project.tracks)
        }
    }


@router.post("/projects/{project_id}/clips/{clip_id}/copy")
async def copy_clip(project_id: str, clip_id: str, request: CopyClipRequest):
    manager = get_timeline_manager()
    clip = manager.copy_clip(project_id, clip_id, request.new_start_time)
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    return {"success": True, "clip": clip.to_dict()}


@router.post("/projects/{project_id}/clips/merge")
async def merge_clips(project_id: str, request: MergeClipsRequest):
    manager = get_timeline_manager()
    clip = manager.merge_clips(project_id, request.clip_ids)
    if not clip:
        raise HTTPException(status_code=400, detail="Failed to merge clips")
    return {"success": True, "clip": clip.to_dict()}


@router.post("/projects/{project_id}/clips/reorder")
async def reorder_clips(project_id: str, request: ReorderClipsRequest):
    manager = get_timeline_manager()
    success = manager.reorder_clips(project_id, request.clip_order)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True}


@router.get("/projects/{project_id}/tracks/{track_index}/clips")
async def get_clips_by_track(project_id: str, track_index: int):
    manager = get_timeline_manager()
    clips = manager.get_clips_by_track(project_id, track_index)
    return {"success": True, "clips": [c.to_dict() for c in clips]}


@router.post("/projects/{project_id}/clips/{clip_id}/trim")
async def trim_clip(project_id: str, clip_id: str, request: TrimClipRequest):
    manager = get_timeline_manager()
    clip = manager.trim_clip(project_id, clip_id, request.trim_start, request.trim_end)
    if not clip:
        raise HTTPException(status_code=400, detail="Failed to trim clip")
    return {"success": True, "clip": clip.to_dict()}


@router.post("/projects/{project_id}/duplicate")
async def duplicate_project(project_id: str, request: DuplicateProjectRequest):
    manager = get_timeline_manager()
    project = manager.duplicate_project(project_id, request.new_name)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True, "project": project.to_dict()}
