import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pathlib import Path


class SkillType(Enum):
    EDITING = "editing"
    STYLING = "styling"
    EFFECTS = "effects"
    TRANSITIONS = "transitions"
    AUDIO = "audio"
    COMPLETE = "complete"


class SkillDifficulty(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class WorkflowStep:
    def __init__(
        self,
        step_id: Optional[str] = None,
        step_type: str = "",
        parameters: Optional[Dict[str, Any]] = None,
        description: str = "",
        order: int = 0
    ):
        self.step_id = step_id or str(uuid.uuid4())
        self.step_type = step_type
        self.parameters = parameters or {}
        self.description = description
        self.order = order

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_id": self.step_id,
            "step_type": self.step_type,
            "parameters": self.parameters,
            "description": self.description,
            "order": self.order
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'WorkflowStep':
        return cls(
            step_id=data.get("step_id"),
            step_type=data.get("step_type", ""),
            parameters=data.get("parameters", {}),
            description=data.get("description", ""),
            order=data.get("order", 0)
        )


class Skill:
    def __init__(
        self,
        skill_id: Optional[str] = None,
        name: str = "",
        description: str = "",
        skill_type: SkillType = SkillType.COMPLETE,
        difficulty: SkillDifficulty = SkillDifficulty.BEGINNER,
        tags: Optional[List[str]] = None,
        workflow_steps: Optional[List[WorkflowStep]] = None,
        style_parameters: Optional[Dict[str, Any]] = None,
        is_builtin: bool = False,
        author: str = "",
        version: str = "1.0.0",
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.skill_id = skill_id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.skill_type = skill_type
        self.difficulty = difficulty
        self.tags = tags or []
        self.workflow_steps = workflow_steps or []
        self.style_parameters = style_parameters or {}
        self.is_builtin = is_builtin
        self.author = author
        self.version = version
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    def add_step(self, step: WorkflowStep) -> None:
        step.order = len(self.workflow_steps)
        self.workflow_steps.append(step)
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "skill_id": self.skill_id,
            "name": self.name,
            "description": self.description,
            "skill_type": self.skill_type.value,
            "difficulty": self.difficulty.value,
            "tags": self.tags,
            "workflow_steps": [s.to_dict() for s in self.workflow_steps],
            "style_parameters": self.style_parameters,
            "is_builtin": self.is_builtin,
            "author": self.author,
            "version": self.version,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Skill':
        return cls(
            skill_id=data.get("skill_id"),
            name=data.get("name", ""),
            description=data.get("description", ""),
            skill_type=SkillType(data.get("skill_type", "complete")),
            difficulty=SkillDifficulty(data.get("difficulty", "beginner")),
            tags=data.get("tags", []),
            workflow_steps=[WorkflowStep.from_dict(s) for s in data.get("workflow_steps", [])],
            style_parameters=data.get("style_parameters", {}),
            is_builtin=data.get("is_builtin", False),
            author=data.get("author", ""),
            version=data.get("version", "1.0.0"),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None,
            updated_at=datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else None
        )

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)

    @classmethod
    def from_json(cls, json_str: str) -> 'Skill':
        data = json.loads(json_str)
        return cls.from_dict(data)

    def save_to_file(self, file_path: str) -> None:
        Path(file_path).parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(self.to_json())

    @classmethod
    def load_from_file(cls, file_path: str) -> 'Skill':
        with open(file_path, 'r', encoding='utf-8') as f:
            return cls.from_json(f.read())


class WorkflowCapture:
    def __init__(self, capture_id: Optional[str] = None):
        self.capture_id = capture_id or str(uuid.uuid4())
        self.steps: List[WorkflowStep] = []
        self.is_recording = False
        self.started_at: Optional[datetime] = None
        self.ended_at: Optional[datetime] = None

    def start_capture(self) -> None:
        self.is_recording = True
        self.started_at = datetime.now()
        self.steps = []

    def capture_step(self, step_type: str, parameters: Dict[str, Any], description: str = "") -> None:
        if not self.is_recording:
            return
        
        step = WorkflowStep(
            step_type=step_type,
            parameters=parameters,
            description=description,
            order=len(self.steps)
        )
        self.steps.append(step)

    def end_capture(self) -> None:
        self.is_recording = False
        self.ended_at = datetime.now()

    def create_skill(
        self,
        name: str,
        description: str,
        skill_type: SkillType = SkillType.COMPLETE,
        difficulty: SkillDifficulty = SkillDifficulty.BEGINNER,
        tags: Optional[List[str]] = None,
        author: str = ""
    ) -> Skill:
        skill = Skill(
            name=name,
            description=description,
            skill_type=skill_type,
            difficulty=difficulty,
            tags=tags,
            workflow_steps=self.steps.copy(),
            is_builtin=False,
            author=author
        )
        return skill


class SkillApplication:
    def __init__(self):
        pass

    def apply_skill(
        self,
        skill: Skill,
        target_media: Optional[Dict[str, Any]] = None,
        target_timeline: Optional[Any] = None,
        override_parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        results = {
            "skill_applied": skill.name,
            "skill_id": skill.skill_id,
            "steps_executed": len(skill.workflow_steps),
            "applied_at": datetime.now().isoformat(),
            "results": []
        }

        for step in skill.workflow_steps:
            step_result = self._execute_step(step, target_media, target_timeline, override_parameters)
            results["results"].append({
                "step_id": step.step_id,
                "step_type": step.step_type,
                "result": step_result
            })

        return results

    def _execute_step(
        self,
        step: WorkflowStep,
        target_media: Optional[Dict[str, Any]],
        target_timeline: Optional[Any],
        override_parameters: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        params = {**step.parameters}
        if override_parameters:
            params.update(override_parameters)
        
        return {
            "status": "simulated",
            "step_type": step.step_type,
            "parameters_used": params
        }


class SkillLibrary:
    def __init__(self):
        self.skills: Dict[str, Skill] = {}
        self._initialize_builtin_skills()

    def _initialize_builtin_skills(self):
        quick_intro = Skill(
            name="Quick Intro",
            description="Create a quick 10-second intro with title and music",
            skill_type=SkillType.COMPLETE,
            difficulty=SkillDifficulty.BEGINNER,
            tags=["intro", "title", "quick"],
            is_builtin=True,
            author="Dreamix"
        )
        quick_intro.add_step(WorkflowStep(
            step_type="add_title",
            parameters={"text": "Your Title Here", "duration": 3.0},
            description="Add title card"
        ))
        quick_intro.add_step(WorkflowStep(
            step_type="add_music",
            parameters={"mood": "energetic"},
            description="Add background music"
        ))
        self.skills[quick_intro.skill_id] = quick_intro

        cinematic_style = Skill(
            name="Cinematic Style",
            description="Apply cinematic color grading and transitions",
            skill_type=SkillType.STYLING,
            difficulty=SkillDifficulty.INTERMEDIATE,
            tags=["cinematic", "color", "movie"],
            is_builtin=True,
            author="Dreamix"
        )
        cinematic_style.add_step(WorkflowStep(
            step_type="color_grading",
            parameters={"contrast": 1.2, "saturation": 0.9, "vignette": True},
            description="Apply cinematic color grading"
        ))
        cinematic_style.add_step(WorkflowStep(
            step_type="add_transitions",
            parameters={"type": "fade", "duration": 1.0},
            description="Add smooth transitions"
        ))
        self.skills[cinematic_style.skill_id] = cinematic_style

        vlog_style = Skill(
            name="Vlog Style",
            description="Create engaging vlog-style content",
            skill_type=SkillType.COMPLETE,
            difficulty=SkillDifficulty.BEGINNER,
            tags=["vlog", "casual", "social"],
            is_builtin=True,
            author="Dreamix"
        )
        vlog_style.add_step(WorkflowStep(
            step_type="add_intro",
            parameters={"duration": 2.0, "style": "modern"},
            description="Add vlog intro"
        ))
        vlog_style.add_step(WorkflowStep(
            step_type="add_music",
            parameters={"mood": "happy", "genre": "pop"},
            description="Add upbeat background music"
        ))
        vlog_style.add_step(WorkflowStep(
            step_type="add_transitions",
            parameters={"type": "cut", "frequency": "high"},
            description="Add quick cuts"
        ))
        self.skills[vlog_style.skill_id] = vlog_style
        
        speech_rough_cut = Skill(
            name="Speech Rough Cut",
            description="Auto-remove filler words, disfluencies, and repeated sentences for clean speech editing",
            skill_type=SkillType.EDITING,
            difficulty=SkillDifficulty.INTERMEDIATE,
            tags=["speech", "asr", "cleanup", "filler", "rough cut"],
            is_builtin=True,
            author="Dreamix"
        )
        speech_rough_cut.add_step(WorkflowStep(
            step_type="transcribe_audio",
            parameters={"model_size": "base"},
            description="Transcribe speech to text"
        ))
        speech_rough_cut.add_step(WorkflowStep(
            step_type="remove_fillers",
            parameters={"remove_fillers": True, "remove_repeats": True, "remove_disfluencies": True},
            description="Remove filler words and disfluencies"
        ))
        speech_rough_cut.add_step(WorkflowStep(
            step_type="generate_rough_cut",
            parameters={"min_segment_duration": 0.5},
            description="Generate cleaned rough cut"
        ))
        self.skills[speech_rough_cut.skill_id] = speech_rough_cut
        
        product_review = Skill(
            name="Product Review",
            description="Create professional product review videos with structured format",
            skill_type=SkillType.COMPLETE,
            difficulty=SkillDifficulty.BEGINNER,
            tags=["product", "review", "demo", "marketing"],
            is_builtin=True,
            author="Dreamix"
        )
        product_review.add_step(WorkflowStep(
            step_type="add_intro",
            parameters={"duration": 3.0, "show_product": True},
            description="Add product intro"
        ))
        product_review.add_step(WorkflowStep(
            step_type="show_features",
            parameters={"highlight_key_features": True},
            description="Highlight key product features"
        ))
        product_review.add_step(WorkflowStep(
            step_type="add_demo",
            parameters={"show_in_action": True},
            description="Show product in action"
        ))
        product_review.add_step(WorkflowStep(
            step_type="add_music",
            parameters={"mood": "positive", "volume": 0.3},
            description="Add background music"
        ))
        product_review.add_step(WorkflowStep(
            step_type="add_cta",
            parameters={"text": "Buy Now", "position": "end"},
            description="Add call-to-action"
        ))
        self.skills[product_review.skill_id] = product_review
        
        educational_content = Skill(
            name="Educational Content",
            description="Create engaging educational and tutorial videos",
            skill_type=SkillType.COMPLETE,
            difficulty=SkillDifficulty.INTERMEDIATE,
            tags=["education", "tutorial", "learning", "explainer"],
            is_builtin=True,
            author="Dreamix"
        )
        educational_content.add_step(WorkflowStep(
            step_type="add_title",
            parameters={"style": "educational", "clear": True},
            description="Add clear title"
        ))
        educational_content.add_step(WorkflowStep(
            step_type="add_outline",
            parameters={"show_agenda": True},
            description="Show lesson outline"
        ))
        educational_content.add_step(WorkflowStep(
            step_type="add_visuals",
            parameters={"use_animations": True, "highlight_key_points": True},
            description="Add explanatory visuals"
        ))
        educational_content.add_step(WorkflowStep(
            step_type="add_summary",
            parameters={"recap_key_points": True},
            description="Add summary and recap"
        ))
        self.skills[educational_content.skill_id] = educational_content
        
        social_media_optimized = Skill(
            name="Social Media Optimized",
            description="Create videos optimized for social media platforms",
            skill_type=SkillType.STYLING,
            difficulty=SkillDifficulty.BEGINNER,
            tags=["social", "instagram", "tiktok", "youtube", "reels"],
            is_builtin=True,
            author="Dreamix"
        )
        social_media_optimized.add_step(WorkflowStep(
            step_type="optimize_aspect_ratio",
            parameters={"ratio": "9:16", "platform": "general"},
            description="Optimize for vertical viewing"
        ))
        social_media_optimized.add_step(WorkflowStep(
            step_type="add_captions",
            parameters={"auto_generated": True, "large_text": True},
            description="Add prominent captions"
        ))
        social_media_optimized.add_step(WorkflowStep(
            step_type="add_music",
            parameters={"trending": True, "beat_sync": True},
            description="Add trending music with beat sync"
        ))
        social_media_optimized.add_step(WorkflowStep(
            step_type="add_hook",
            parameters={"position": "start", "duration": 3.0},
            description="Add attention-grabbing hook"
        ))
        self.skills[social_media_optimized.skill_id] = social_media_optimized
        
        documentary_style = Skill(
            name="Documentary Style",
            description="Create professional documentary-style videos",
            skill_type=SkillType.COMPLETE,
            difficulty=SkillDifficulty.ADVANCED,
            tags=["documentary", "serious", "informative", "news"],
            is_builtin=True,
            author="Dreamix"
        )
        documentary_style.add_step(WorkflowStep(
            step_type="color_grading",
            parameters={"mood": "serious", "contrast": 1.1},
            description="Apply documentary color grading"
        ))
        documentary_style.add_step(WorkflowStep(
            step_type="add_voiceover",
            parameters={"tone": "serious", "pace": "moderate"},
            description="Add professional voiceover"
        ))
        documentary_style.add_step(WorkflowStep(
            step_type="add_transitions",
            parameters={"type": "dissolve", "duration": 1.5},
            description="Add smooth dissolves"
        ))
        documentary_style.add_step(WorkflowStep(
            step_type="add_music",
            parameters={"genre": "instrumental", "volume": 0.2},
            description="Add subtle background music"
        ))
        self.skills[documentary_style.skill_id] = documentary_style

    def add_skill(self, skill: Skill) -> None:
        self.skills[skill.skill_id] = skill

    def get_skill(self, skill_id: str) -> Optional[Skill]:
        return self.skills.get(skill_id)

    def search_skills(
        self,
        query: Optional[str] = None,
        skill_type: Optional[SkillType] = None,
        difficulty: Optional[SkillDifficulty] = None,
        tags: Optional[List[str]] = None,
        include_builtin: bool = True,
        include_custom: bool = True
    ) -> List[Skill]:
        results = list(self.skills.values())

        if not include_builtin:
            results = [s for s in results if not s.is_builtin]
        if not include_custom:
            results = [s for s in results if s.is_builtin]

        if query:
            query_lower = query.lower()
            results = [
                s for s in results
                if query_lower in s.name.lower() or query_lower in s.description.lower()
            ]

        if skill_type:
            results = [s for s in results if s.skill_type == skill_type]

        if difficulty:
            results = [s for s in results if s.difficulty == difficulty]

        if tags:
            results = [s for s in results if any(tag in s.tags for tag in tags)]

        return results

    def list_all_skills(self) -> List[Skill]:
        return list(self.skills.values())


class SkillSystem:
    def __init__(self):
        self.library = SkillLibrary()
        self.application = SkillApplication()
        self.workflow_captures: Dict[str, WorkflowCapture] = {}

    def create_capture(self, capture_id: Optional[str] = None) -> WorkflowCapture:
        capture = WorkflowCapture(capture_id)
        self.workflow_captures[capture.capture_id] = capture
        return capture

    def get_capture(self, capture_id: str) -> Optional[WorkflowCapture]:
        return self.workflow_captures.get(capture_id)

    def start_capture(self, capture_id: str) -> bool:
        capture = self.workflow_captures.get(capture_id)
        if capture:
            capture.start_capture()
            return True
        return False

    def end_capture(self, capture_id: str) -> bool:
        capture = self.workflow_captures.get(capture_id)
        if capture:
            capture.end_capture()
            return True
        return False

    def save_skill_to_file(self, skill: Skill, directory: str = "./skills") -> str:
        file_name = f"{skill.name.lower().replace(' ', '_')}_{skill.skill_id[:8]}.json"
        file_path = Path(directory) / file_name
        skill.save_to_file(str(file_path))
        return str(file_path)

    def load_skill_from_file(self, file_path: str) -> Optional[Skill]:
        try:
            skill = Skill.load_from_file(file_path)
            self.library.add_skill(skill)
            return skill
        except Exception as e:
            print(f"Error loading skill from file: {e}")
            return None


_skill_system: Optional[SkillSystem] = None


def get_skill_system() -> SkillSystem:
    global _skill_system
    if _skill_system is None:
        _skill_system = SkillSystem()
    return _skill_system
