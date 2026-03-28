import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from enum import Enum

try:
    from app.core.llm import get_llm_service, LLMService
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    get_llm_service = None
    LLMService = None


class EditCommandType(Enum):
    CUT_CLIP = "cut_clip"
    SWAP_CLIPS = "swap_clips"
    RESEQUENCE_CLIPS = "resequence_clips"
    MODIFY_SCRIPT = "modify_script"
    CHANGE_TONE = "change_tone"
    ADJUST_VISUAL = "adjust_visual"
    CHANGE_FONT = "change_font"
    CHANGE_COLOR = "change_color"
    ADJUST_POSITION = "adjust_position"
    ADD_TRANSITION = "add_transition"
    REMOVE_TRANSITION = "remove_transition"
    CHANGE_MUSIC = "change_music"
    CHANGE_VOICEOVER = "change_voiceover"
    ADJUST_VOLUME = "adjust_volume"
    TRIM_CLIP = "trim_clip"
    SPLIT_CLIP = "split_clip"
    SPEED_CHANGE = "speed_change"
    ADD_CAPTION = "add_caption"
    REMOVE_CAPTION = "remove_caption"
    APPLY_SKILL = "apply_skill"
    REMOVE_FILLERS = "remove_fillers"
    GENERATE_ROUGH_CUT = "generate_rough_cut"
    ADD_EFFECT = "add_effect"
    REMOVE_EFFECT = "remove_effect"
    CHANGE_ASPECT_RATIO = "change_aspect_ratio"
    ADD_WATERMARK = "add_watermark"
    REMOVE_WATERMARK = "remove_watermark"


class TransitionType(Enum):
    FADE = "fade"
    CUT = "cut"
    DISSOLVE = "dissolve"
    SLIDE = "slide"
    WIPE = "wipe"
    ZOOM = "zoom"


class VisualProperty(Enum):
    COLOR = "color"
    FONT = "font"
    SIZE = "size"
    POSITION = "position"
    OPACITY = "opacity"
    ROTATION = "rotation"


class EditAction:
    def __init__(
        self,
        action_id: Optional[str] = None,
        command_type: EditCommandType = EditCommandType.MODIFY_SCRIPT,
        parameters: Optional[Dict[str, Any]] = None,
        description: str = "",
        created_at: Optional[datetime] = None
    ):
        self.action_id = action_id or str(uuid.uuid4())
        self.command_type = command_type
        self.parameters = parameters or {}
        self.description = description
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "action_id": self.action_id,
            "command_type": self.command_type.value,
            "parameters": self.parameters,
            "description": self.description,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'EditAction':
        return cls(
            action_id=data.get("action_id"),
            command_type=EditCommandType(data.get("command_type", "modify_script")),
            parameters=data.get("parameters", {}),
            description=data.get("description", ""),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None
        )


class VideoTimeline:
    def __init__(
        self,
        timeline_id: Optional[str] = None,
        clips: Optional[List[Dict[str, Any]]] = None,
        transitions: Optional[List[Dict[str, Any]]] = None,
        audio_tracks: Optional[List[Dict[str, Any]]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.timeline_id = timeline_id or str(uuid.uuid4())
        self.clips = clips or []
        self.transitions = transitions or []
        self.audio_tracks = audio_tracks or []
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    def add_clip(self, clip: Dict[str, Any]) -> None:
        self.clips.append(clip)
        self.updated_at = datetime.now()

    def remove_clip(self, clip_index: int) -> bool:
        if 0 <= clip_index < len(self.clips):
            self.clips.pop(clip_index)
            self.updated_at = datetime.now()
            return True
        return False

    def swap_clips(self, index1: int, index2: int) -> bool:
        if 0 <= index1 < len(self.clips) and 0 <= index2 < len(self.clips):
            self.clips[index1], self.clips[index2] = self.clips[index2], self.clips[index1]
            self.updated_at = datetime.now()
            return True
        return False

    def resequence_clips(self, new_order: List[int]) -> bool:
        if all(0 <= i < len(self.clips) for i in new_order) and len(set(new_order)) == len(self.clips):
            self.clips = [self.clips[i] for i in new_order]
            self.updated_at = datetime.now()
            return True
        return False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "timeline_id": self.timeline_id,
            "clips": self.clips,
            "transitions": self.transitions,
            "audio_tracks": self.audio_tracks,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'VideoTimeline':
        return cls(
            timeline_id=data.get("timeline_id"),
            clips=data.get("clips", []),
            transitions=data.get("transitions", []),
            audio_tracks=data.get("audio_tracks", []),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None,
            updated_at=datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else None
        )


class EditHistory:
    def __init__(
        self,
        history_id: Optional[str] = None,
        actions: Optional[List[EditAction]] = None,
        current_index: int = -1,
        created_at: Optional[datetime] = None
    ):
        self.history_id = history_id or str(uuid.uuid4())
        self.actions = actions or []
        self.current_index = current_index
        self.created_at = created_at or datetime.now()

    def add_action(self, action: EditAction) -> None:
        if self.current_index < len(self.actions) - 1:
            self.actions = self.actions[:self.current_index + 1]
        self.actions.append(action)
        self.current_index = len(self.actions) - 1

    def undo(self) -> Optional[EditAction]:
        if self.current_index >= 0:
            action = self.actions[self.current_index]
            self.current_index -= 1
            return action
        return None

    def redo(self) -> Optional[EditAction]:
        if self.current_index < len(self.actions) - 1:
            self.current_index += 1
            return self.actions[self.current_index]
        return None

    def get_history(self, limit: int = 10) -> List[EditAction]:
        start = max(0, len(self.actions) - limit)
        return self.actions[start:]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "history_id": self.history_id,
            "actions": [a.to_dict() for a in self.actions],
            "current_index": self.current_index,
            "created_at": self.created_at.isoformat()
        }


class EditCommandParser:
    def __init__(self, llm_service: Optional[Any] = None):
        self.llm_service = llm_service
        if LLM_AVAILABLE and self.llm_service is None:
            try:
                self.llm_service = get_llm_service()
            except Exception:
                pass

    async def parse_edit_command(self, user_input: str) -> Optional[EditAction]:
        try:
            if not self.llm_service:
                return EditAction(
                    command_type=EditCommandType.MODIFY_SCRIPT,
                    parameters={"user_input": user_input},
                    description=user_input
                )

            prompt = f"""Parse the following video edit command and extract structured data.

User input: "{user_input}"

Possible command types:
- cut_clip: Cut or remove a clip
- swap_clips: Swap the order of two clips
- resequence_clips: Change the order of multiple clips
- modify_script: Modify the script content
- change_tone: Change the overall tone/mood
- adjust_visual: Adjust visual properties (color, font, etc.)
- change_font: Change font style or size
- change_color: Change color scheme
- adjust_position: Adjust element position
- add_transition: Add a transition effect
- remove_transition: Remove a transition effect
- change_music: Change background music
- change_voiceover: Change voiceover
- adjust_volume: Adjust audio volume
- trim_clip: Trim a clip to specific start/end times
- split_clip: Split a clip at a specific time
- speed_change: Change playback speed of a clip
- add_caption: Add captions or subtitles
- remove_caption: Remove captions
- apply_skill: Apply a predefined skill/workflow
- remove_fillers: Remove filler words from speech
- generate_rough_cut: Generate a rough cut with automatic cleanup
- add_effect: Add visual or audio effects
- remove_effect: Remove effects
- change_aspect_ratio: Change video aspect ratio
- add_watermark: Add a watermark
- remove_watermark: Remove watermark

Respond in JSON format:
{{
    "command_type": "one of the above types",
    "parameters": {{
        "clip_index": null or number,
        "clip_indices": null or array of numbers,
        "new_order": null or array of numbers,
        "tone": null or string,
        "property": null or string,
        "value": null or any,
        "transition_type": null or string,
        "music_track": null or string,
        "voice_profile": null or string,
        "volume_level": null or number,
        "start_time": null or number,
        "end_time": null or number,
        "split_time": null or number,
        "speed_multiplier": null or number,
        "caption_text": null or string,
        "skill_name": null or string,
        "skill_id": null or string,
        "effect_type": null or string,
        "aspect_ratio": null or string,
        "watermark_text": null or string,
        "remove_fillers": null or boolean,
        "remove_repeats": null or boolean,
        "remove_disfluencies": null or boolean
    }},
    "description": "brief description of the edit"
}}

Only return the JSON, no other text."""

            messages = [{"role": "user", "content": prompt}]
            response = await self.llm_service.generate_completion(
                messages=messages,
                max_tokens=500,
                temperature=0.3
            )
            response_content = response["content"]

            try:
                json_start = response_content.find('{')
                json_end = response_content.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = response_content[json_start:json_end]
                    parsed = json.loads(json_str)
                    
                    command_type = EditCommandType(parsed.get("command_type", "modify_script"))
                    parameters = parsed.get("parameters", {})
                    description = parsed.get("description", user_input)
                    
                    return EditAction(
                        command_type=command_type,
                        parameters=parameters,
                        description=description
                    )
            except Exception as e:
                print(f"Error parsing JSON: {e}")
                pass

            return EditAction(
                command_type=EditCommandType.MODIFY_SCRIPT,
                parameters={"user_input": user_input},
                description=user_input
            )

        except Exception as e:
            print(f"Error parsing edit command: {e}")
            return None


class EditExecutor:
    def __init__(self):
        pass

    def execute_edit(
        self,
        timeline: VideoTimeline,
        action: EditAction
    ) -> bool:
        try:
            command_type = action.command_type
            params = action.parameters

            if command_type == EditCommandType.CUT_CLIP:
                clip_index = params.get("clip_index")
                if clip_index is not None:
                    return timeline.remove_clip(clip_index)

            elif command_type == EditCommandType.SWAP_CLIPS:
                clip_indices = params.get("clip_indices", [])
                if len(clip_indices) == 2:
                    return timeline.swap_clips(clip_indices[0], clip_indices[1])

            elif command_type == EditCommandType.RESEQUENCE_CLIPS:
                new_order = params.get("new_order", [])
                if new_order:
                    return timeline.resequence_clips(new_order)

            elif command_type in [
                EditCommandType.MODIFY_SCRIPT,
                EditCommandType.CHANGE_TONE,
                EditCommandType.ADJUST_VISUAL,
                EditCommandType.CHANGE_FONT,
                EditCommandType.CHANGE_COLOR,
                EditCommandType.ADJUST_POSITION,
                EditCommandType.ADD_TRANSITION,
                EditCommandType.REMOVE_TRANSITION,
                EditCommandType.CHANGE_MUSIC,
                EditCommandType.CHANGE_VOICEOVER,
                EditCommandType.ADJUST_VOLUME,
                EditCommandType.TRIM_CLIP,
                EditCommandType.SPLIT_CLIP,
                EditCommandType.SPEED_CHANGE,
                EditCommandType.ADD_CAPTION,
                EditCommandType.REMOVE_CAPTION,
                EditCommandType.APPLY_SKILL,
                EditCommandType.REMOVE_FILLERS,
                EditCommandType.GENERATE_ROUGH_CUT,
                EditCommandType.ADD_EFFECT,
                EditCommandType.REMOVE_EFFECT,
                EditCommandType.CHANGE_ASPECT_RATIO,
                EditCommandType.ADD_WATERMARK,
                EditCommandType.REMOVE_WATERMARK
            ]:
                timeline.updated_at = datetime.now()
                return True

            return False
        except Exception as e:
            print(f"Error executing edit: {e}")
            return False


class ConversationalEditingSystem:
    def __init__(self):
        self.parser = EditCommandParser()
        self.executor = EditExecutor()
        self.timelines: Dict[str, VideoTimeline] = {}
        self.histories: Dict[str, EditHistory] = {}

    def create_timeline(self, timeline_id: Optional[str] = None) -> VideoTimeline:
        timeline = VideoTimeline(timeline_id=timeline_id)
        self.timelines[timeline.timeline_id] = timeline
        self.histories[timeline.timeline_id] = EditHistory()
        return timeline

    def get_timeline(self, timeline_id: str) -> Optional[VideoTimeline]:
        return self.timelines.get(timeline_id)

    async def process_edit_request(
        self,
        timeline_id: str,
        user_input: str
    ) -> Optional[EditAction]:
        timeline = self.timelines.get(timeline_id)
        if not timeline:
            return None

        action = await self.parser.parse_edit_command(user_input)
        if not action:
            return None

        history = self.histories.get(timeline_id)
        if history:
            history.add_action(action)

        success = self.executor.execute_edit(timeline, action)
        if success:
            return action
        return None

    def undo_edit(self, timeline_id: str) -> Optional[EditAction]:
        history = self.histories.get(timeline_id)
        if history:
            return history.undo()
        return None

    def redo_edit(self, timeline_id: str) -> Optional[EditAction]:
        history = self.histories.get(timeline_id)
        if history:
            return history.redo()
        return None

    def get_edit_history(self, timeline_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        history = self.histories.get(timeline_id)
        if history:
            return [a.to_dict() for a in history.get_history(limit)]
        return []


_editing_system: Optional[ConversationalEditingSystem] = None


def get_conversational_editing_system() -> ConversationalEditingSystem:
    global _editing_system
    if _editing_system is None:
        _editing_system = ConversationalEditingSystem()
    return _editing_system
