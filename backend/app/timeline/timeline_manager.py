import uuid
import json
import os
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pathlib import Path


class ClipType(Enum):
    VIDEO = "video"
    AUDIO = "audio"
    IMAGE = "image"
    TEXT = "text"
    EFFECT = "effect"


class TrackType(Enum):
    VIDEO = "video"
    AUDIO = "audio"
    TEXT = "text"
    EFFECT = "effect"


class TransitionType(Enum):
    CUT = "cut"
    FADE = "fade"
    DISSOLVE = "dissolve"
    SLIDE_LEFT = "slide_left"
    SLIDE_RIGHT = "slide_right"
    SLIDE_UP = "slide_up"
    SLIDE_DOWN = "slide_down"
    ZOOM_IN = "zoom_in"
    ZOOM_OUT = "zoom_out"
    WIPE_LEFT = "wipe_left"
    WIPE_RIGHT = "wipe_right"


class EffectType(Enum):
    BLUR = "blur"
    SHARPEN = "sharpen"
    SEPIA = "sepia"
    GRAYSCALE = "grayscale"
    BRIGHTNESS = "brightness"
    CONTRAST = "contrast"
    SATURATION = "saturation"
    VIGNETTE = "vignette"
    CHROMA_KEY = "chroma_key"


class TimelineClip:
    def __init__(
        self,
        clip_id: Optional[str] = None,
        clip_type: ClipType = ClipType.VIDEO,
        title: str = "",
        media_path: Optional[str] = None,
        start_time: float = 0.0,
        duration: float = 0.0,
        track_index: int = 0,
        properties: Optional[Dict[str, Any]] = None,
        effects: Optional[List[Dict[str, Any]]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.clip_id = clip_id or str(uuid.uuid4())
        self.clip_type = clip_type
        self.title = title
        self.media_path = media_path
        self.start_time = start_time
        self.duration = duration
        self.track_index = track_index
        self.properties = properties or {}
        self.effects = effects or []
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "clip_id": self.clip_id,
            "clip_type": self.clip_type.value,
            "title": self.title,
            "media_path": self.media_path,
            "start_time": self.start_time,
            "duration": self.duration,
            "track_index": self.track_index,
            "properties": self.properties,
            "effects": self.effects,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TimelineClip':
        return cls(
            clip_id=data.get("clip_id"),
            clip_type=ClipType(data.get("clip_type", "video")),
            title=data.get("title", ""),
            media_path=data.get("media_path"),
            start_time=data.get("start_time", 0.0),
            duration=data.get("duration", 0.0),
            track_index=data.get("track_index", 0),
            properties=data.get("properties", {}),
            effects=data.get("effects", []),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None,
            updated_at=datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else None
        )


class TimelineTrack:
    def __init__(
        self,
        track_id: Optional[str] = None,
        track_type: TrackType = TrackType.VIDEO,
        name: str = "",
        locked: bool = False,
        muted: bool = False,
        volume: float = 1.0,
        created_at: Optional[datetime] = None
    ):
        self.track_id = track_id or str(uuid.uuid4())
        self.track_type = track_type
        self.name = name
        self.locked = locked
        self.muted = muted
        self.volume = volume
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "track_id": self.track_id,
            "track_type": self.track_type.value,
            "name": self.name,
            "locked": self.locked,
            "muted": self.muted,
            "volume": self.volume,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TimelineTrack':
        return cls(
            track_id=data.get("track_id"),
            track_type=TrackType(data.get("track_type", "video")),
            name=data.get("name", ""),
            locked=data.get("locked", False),
            muted=data.get("muted", False),
            volume=data.get("volume", 1.0),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None
        )


class TimelineTransition:
    def __init__(
        self,
        transition_id: Optional[str] = None,
        transition_type: TransitionType = TransitionType.CUT,
        from_clip_id: Optional[str] = None,
        to_clip_id: Optional[str] = None,
        duration: float = 0.5,
        properties: Optional[Dict[str, Any]] = None
    ):
        self.transition_id = transition_id or str(uuid.uuid4())
        self.transition_type = transition_type
        self.from_clip_id = from_clip_id
        self.to_clip_id = to_clip_id
        self.duration = duration
        self.properties = properties or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "transition_id": self.transition_id,
            "transition_type": self.transition_type.value,
            "from_clip_id": self.from_clip_id,
            "to_clip_id": self.to_clip_id,
            "duration": self.duration,
            "properties": self.properties
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TimelineTransition':
        return cls(
            transition_id=data.get("transition_id"),
            transition_type=TransitionType(data.get("transition_type", "cut")),
            from_clip_id=data.get("from_clip_id"),
            to_clip_id=data.get("to_clip_id"),
            duration=data.get("duration", 0.5),
            properties=data.get("properties", {})
        )


class VideoProject:
    def __init__(
        self,
        project_id: Optional[str] = None,
        name: str = "Untitled Project",
        description: str = "",
        width: int = 1920,
        height: int = 1080,
        fps: float = 30.0,
        tracks: Optional[List[TimelineTrack]] = None,
        clips: Optional[List[TimelineClip]] = None,
        transitions: Optional[List[TimelineTransition]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.project_id = project_id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.width = width
        self.height = height
        self.fps = fps
        self.tracks = tracks or []
        self.clips = clips or []
        self.transitions = transitions or []
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    @property
    def total_duration(self) -> float:
        if not self.clips:
            return 0.0
        return max(clip.start_time + clip.duration for clip in self.clips)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "project_id": self.project_id,
            "name": self.name,
            "description": self.description,
            "width": self.width,
            "height": self.height,
            "fps": self.fps,
            "total_duration": self.total_duration,
            "tracks": [track.to_dict() for track in self.tracks],
            "clips": [clip.to_dict() for clip in self.clips],
            "transitions": [transition.to_dict() for transition in self.transitions],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'VideoProject':
        return cls(
            project_id=data.get("project_id"),
            name=data.get("name", "Untitled Project"),
            description=data.get("description", ""),
            width=data.get("width", 1920),
            height=data.get("height", 1080),
            fps=data.get("fps", 30.0),
            tracks=[TimelineTrack.from_dict(t) for t in data.get("tracks", [])],
            clips=[TimelineClip.from_dict(c) for c in data.get("clips", [])],
            transitions=[TimelineTransition.from_dict(t) for t in data.get("transitions", [])],
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None,
            updated_at=datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else None
        )


class TimelineManager:
    def __init__(self, storage_path: str):
        self.storage_path = Path(storage_path)
        self.projects_path = self.storage_path / "projects"
        self._ensure_directories()
        self._projects_cache: Dict[str, VideoProject] = {}

    def _ensure_directories(self):
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.projects_path.mkdir(parents=True, exist_ok=True)

    def create_project(
        self,
        name: str = "Untitled Project",
        description: str = "",
        width: int = 1920,
        height: int = 1080,
        fps: float = 30.0
    ) -> VideoProject:
        project = VideoProject(
            name=name,
            description=description,
            width=width,
            height=height,
            fps=fps
        )
        
        project.tracks = [
            TimelineTrack(track_type=TrackType.VIDEO, name="Video Track 1"),
            TimelineTrack(track_type=TrackType.AUDIO, name="Audio Track 1"),
            TimelineTrack(track_type=TrackType.TEXT, name="Text Track 1")
        ]
        
        self._save_project(project)
        self._projects_cache[project.project_id] = project
        return project

    def get_project(self, project_id: str) -> Optional[VideoProject]:
        if project_id in self._projects_cache:
            return self._projects_cache[project_id]
        
        project_file = self.projects_path / f"{project_id}.json"
        if project_file.exists():
            with open(project_file, 'r') as f:
                data = json.load(f)
                project = VideoProject.from_dict(data)
                self._projects_cache[project_id] = project
                return project
        return None

    def list_projects(self) -> List[Dict[str, Any]]:
        projects = []
        for project_file in self.projects_path.glob("*.json"):
            try:
                with open(project_file, 'r') as f:
                    data = json.load(f)
                    projects.append({
                        "project_id": data.get("project_id"),
                        "name": data.get("name"),
                        "description": data.get("description"),
                        "total_duration": data.get("total_duration", 0),
                        "created_at": data.get("created_at"),
                        "updated_at": data.get("updated_at")
                    })
            except Exception:
                continue
        return sorted(projects, key=lambda p: p["updated_at"], reverse=True)

    def save_project(self, project: VideoProject) -> bool:
        project.updated_at = datetime.now()
        self._save_project(project)
        self._projects_cache[project.project_id] = project
        return True

    def _save_project(self, project: VideoProject):
        project_file = self.projects_path / f"{project.project_id}.json"
        with open(project_file, 'w') as f:
            json.dump(project.to_dict(), f, indent=2)

    def delete_project(self, project_id: str) -> bool:
        project_file = self.projects_path / f"{project_id}.json"
        if project_file.exists():
            project_file.unlink()
            if project_id in self._projects_cache:
                del self._projects_cache[project_id]
            return True
        return False

    def add_clip(self, project_id: str, clip: TimelineClip) -> Optional[TimelineClip]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        clip.updated_at = datetime.now()
        project.clips.append(clip)
        self.save_project(project)
        return clip

    def update_clip(self, project_id: str, clip_id: str, **kwargs) -> Optional[TimelineClip]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        clip = next((c for c in project.clips if c.clip_id == clip_id), None)
        if not clip:
            return None
        
        for key, value in kwargs.items():
            if hasattr(clip, key):
                setattr(clip, key, value)
        
        clip.updated_at = datetime.now()
        self.save_project(project)
        return clip

    def delete_clip(self, project_id: str, clip_id: str) -> bool:
        project = self.get_project(project_id)
        if not project:
            return False
        
        initial_count = len(project.clips)
        project.clips = [c for c in project.clips if c.clip_id != clip_id]
        project.transitions = [t for t in project.transitions 
                               if t.from_clip_id != clip_id and t.to_clip_id != clip_id]
        
        if len(project.clips) < initial_count:
            self.save_project(project)
            return True
        return False

    def split_clip(self, project_id: str, clip_id: str, split_time: float) -> Optional[List[TimelineClip]]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        clip = next((c for c in project.clips if c.clip_id == clip_id), None)
        if not clip:
            return None
        
        if split_time <= clip.start_time or split_time >= clip.start_time + clip.duration:
            return None
        
        first_duration = split_time - clip.start_time
        second_duration = clip.duration - first_duration
        
        first_clip = TimelineClip(
            clip_type=clip.clip_type,
            title=f"{clip.title} (Part 1)",
            media_path=clip.media_path,
            start_time=clip.start_time,
            duration=first_duration,
            track_index=clip.track_index,
            properties=clip.properties.copy(),
            effects=clip.effects.copy()
        )
        
        second_clip = TimelineClip(
            clip_type=clip.clip_type,
            title=f"{clip.title} (Part 2)",
            media_path=clip.media_path,
            start_time=split_time,
            duration=second_duration,
            track_index=clip.track_index,
            properties=clip.properties.copy(),
            effects=clip.effects.copy()
        )
        
        project.clips = [c for c in project.clips if c.clip_id != clip_id]
        project.clips.extend([first_clip, second_clip])
        self.save_project(project)
        
        return [first_clip, second_clip]

    def add_transition(self, project_id: str, transition: TimelineTransition) -> Optional[TimelineTransition]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        project.transitions.append(transition)
        self.save_project(project)
        return transition

    def add_track(self, project_id: str, track: TimelineTrack) -> Optional[TimelineTrack]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        project.tracks.append(track)
        self.save_project(project)
        return track

    def update_track(self, project_id: str, track_id: str, **kwargs) -> Optional[TimelineTrack]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        track = next((t for t in project.tracks if t.track_id == track_id), None)
        if not track:
            return None
        
        for key, value in kwargs.items():
            if hasattr(track, key):
                setattr(track, key, value)
        
        self.save_project(project)
        return track

    def delete_track(self, project_id: str, track_id: str) -> bool:
        project = self.get_project(project_id)
        if not project:
            return False
        
        track_index = next((i for i, t in enumerate(project.tracks) if t.track_id == track_id), -1)
        if track_index == -1:
            return False
        
        project.tracks = [t for t in project.tracks if t.track_id != track_id]
        project.clips = [c for c in project.clips if c.track_index != track_index]
        
        self.save_project(project)
        return True

    def duplicate_project(self, project_id: str, new_name: Optional[str] = None) -> Optional[VideoProject]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        import copy
        new_project = copy.deepcopy(project)
        new_project.project_id = str(uuid.uuid4())
        new_project.name = new_name or f"{project.name} (Copy)"
        new_project.created_at = datetime.now()
        new_project.updated_at = datetime.now()
        
        self._save_project(new_project)
        self._projects_cache[new_project.project_id] = new_project
        return new_project

    def merge_clips(self, project_id: str, clip_ids: List[str]) -> Optional[TimelineClip]:
        project = self.get_project(project_id)
        if not project or len(clip_ids) < 2:
            return None
        
        clips_to_merge = sorted(
            [c for c in project.clips if c.clip_id in clip_ids],
            key=lambda c: c.start_time
        )
        
        if len(clips_to_merge) < 2:
            return None
        
        first_clip = clips_to_merge[0]
        last_clip = clips_to_merge[-1]
        
        merged_clip = TimelineClip(
            clip_type=first_clip.clip_type,
            title=f"{first_clip.title} (Merged)",
            media_path=first_clip.media_path,
            start_time=first_clip.start_time,
            duration=(last_clip.start_time + last_clip.duration) - first_clip.start_time,
            track_index=first_clip.track_index,
            properties={**first_clip.properties, "merged_clips": clip_ids}
        )
        
        project.clips = [c for c in project.clips if c.clip_id not in clip_ids]
        project.clips.append(merged_clip)
        
        self.save_project(project)
        return merged_clip

    def copy_clip(self, project_id: str, clip_id: str, new_start_time: Optional[float] = None) -> Optional[TimelineClip]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        original_clip = next((c for c in project.clips if c.clip_id == clip_id), None)
        if not original_clip:
            return None
        
        import copy
        new_clip = copy.deepcopy(original_clip)
        new_clip.clip_id = str(uuid.uuid4())
        new_clip.title = f"{original_clip.title} (Copy)"
        new_clip.created_at = datetime.now()
        new_clip.updated_at = datetime.now()
        
        if new_start_time is not None:
            new_clip.start_time = new_start_time
        else:
            new_clip.start_time = original_clip.start_time + original_clip.duration
        
        project.clips.append(new_clip)
        self.save_project(project)
        return new_clip

    def reorder_clips(self, project_id: str, clip_order: List[str]) -> bool:
        project = self.get_project(project_id)
        if not project:
            return False
        
        clip_map = {c.clip_id: c for c in project.clips}
        new_clips = []
        
        for clip_id in clip_order:
            if clip_id in clip_map:
                new_clips.append(clip_map[clip_id])
        
        for clip in project.clips:
            if clip.clip_id not in clip_order:
                new_clips.append(clip)
        
        project.clips = new_clips
        self.save_project(project)
        return True

    def get_clips_by_track(self, project_id: str, track_index: int) -> List[TimelineClip]:
        project = self.get_project(project_id)
        if not project:
            return []
        
        return sorted(
            [c for c in project.clips if c.track_index == track_index],
            key=lambda c: c.start_time
        )

    def trim_clip(self, project_id: str, clip_id: str, trim_start: float = 0, trim_end: float = 0) -> Optional[TimelineClip]:
        project = self.get_project(project_id)
        if not project:
            return None
        
        clip = next((c for c in project.clips if c.clip_id == clip_id), None)
        if not clip:
            return None
        
        new_start_time = clip.start_time + trim_start
        new_duration = clip.duration - trim_start - trim_end
        
        if new_duration <= 0:
            return None
        
        clip.start_time = new_start_time
        clip.duration = new_duration
        clip.updated_at = datetime.now()
        
        self.save_project(project)
        return clip


_timeline_manager_instance: Optional[TimelineManager] = None


def get_timeline_manager() -> TimelineManager:
    global _timeline_manager_instance
    from app.config.config import get_settings
    if _timeline_manager_instance is None:
        settings = get_settings()
        storage_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage")
        _timeline_manager_instance = TimelineManager(storage_path)
    return _timeline_manager_instance
