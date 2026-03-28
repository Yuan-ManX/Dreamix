from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import uuid
from app.core.llm import get_llm_service, LLMService
from app.core.tools import get_tool_registry, ToolRegistry, BaseTool
import json
from collections import deque


class Message:
    def __init__(self, role: str, content: str, timestamp: Optional[datetime] = None, metadata: Optional[Dict[str, Any]] = None):
        self.role = role
        self.content = content
        self.timestamp = timestamp or datetime.now()
        self.id = str(uuid.uuid4())
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }


class ConversationContext:
    def __init__(self):
        self.preferences: Dict[str, Any] = {}
        self.entities: List[Dict[str, Any]] = []
        self.topics: List[str] = []
        self.summaries: List[str] = []
        self.task_stack: List[Dict[str, Any]] = []

    def update_preferences(self, key: str, value: Any):
        self.preferences[key] = value

    def add_entity(self, entity_type: str, entity_value: str, metadata: Optional[Dict[str, Any]] = None):
        self.entities.append({
            "type": entity_type,
            "value": entity_value,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat()
        })

    def add_topic(self, topic: str):
        if topic not in self.topics:
            self.topics.append(topic)

    def push_task(self, task: Dict[str, Any]):
        self.task_stack.append({**task, "created_at": datetime.now().isoformat()})

    def pop_task(self) -> Optional[Dict[str, Any]]:
        if self.task_stack:
            return self.task_stack.pop()
        return None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "preferences": self.preferences,
            "entities": self.entities,
            "topics": self.topics,
            "summaries": self.summaries,
            "task_stack": self.task_stack
        }


class Conversation:
    def __init__(self, conversation_id: Optional[str] = None, max_messages: int = 100):
        self.conversation_id = conversation_id or str(uuid.uuid4())
        self.messages: List[Message] = []
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.context = ConversationContext()
        self.max_messages = max_messages
        self.title: str = ""

    def add_message(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> Message:
        message = Message(role, content, metadata=metadata)
        self.messages.append(message)
        self.updated_at = datetime.now()
        
        if len(self.messages) > self.max_messages:
            self._trim_old_messages()
        
        return message

    def _trim_old_messages(self):
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]

    def get_messages(self) -> List[Message]:
        return self.messages

    def get_recent_messages(self, count: int = 10) -> List[Message]:
        return self.messages[-count:]

    def generate_summary(self) -> str:
        if not self.title and self.messages:
            first_user_msg = next((m for m in self.messages if m.role == "user"), None)
            if first_user_msg:
                self.title = first_user_msg.content[:50] + ("..." if len(first_user_msg.content) > 50 else "")
        return self.title

    def to_dict(self) -> Dict[str, Any]:
        return {
            "conversation_id": self.conversation_id,
            "title": self.title,
            "messages": [msg.to_dict() for msg in self.messages],
            "context": self.context.to_dict(),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class ConversationStore:
    _conversations: Dict[str, Conversation] = {}
    _recent_conversations: deque = deque(maxlen=50)

    @classmethod
    def create_conversation(cls, conversation_id: Optional[str] = None) -> Conversation:
        conversation = Conversation(conversation_id)
        cls._conversations[conversation.conversation_id] = conversation
        cls._recent_conversations.append(conversation.conversation_id)
        return conversation

    @classmethod
    def get_conversation(cls, conversation_id: str) -> Optional[Conversation]:
        return cls._conversations.get(conversation_id)

    @classmethod
    def get_or_create_conversation(cls, conversation_id: Optional[str] = None) -> Conversation:
        if conversation_id:
            conversation = cls.get_conversation(conversation_id)
            if conversation:
                return conversation
        return cls.create_conversation(conversation_id)

    @classmethod
    def list_conversations(cls, limit: int = 50) -> List[Dict[str, Any]]:
        conversations = list(cls._conversations.values())
        conversations.sort(key=lambda x: x.updated_at, reverse=True)
        return [
            {
                "conversation_id": conv.conversation_id,
                "title": conv.generate_summary(),
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat(),
                "message_count": len(conv.messages)
            }
            for conv in conversations[:limit]
        ]

    @classmethod
    def delete_conversation(cls, conversation_id: str) -> bool:
        if conversation_id in cls._conversations:
            del cls._conversations[conversation_id]
            return True
        return False

    @classmethod
    def cleanup_old_conversations(cls, max_age_hours: int = 24) -> int:
        cutoff = datetime.now() - timedelta(hours=max_age_hours)
        to_delete = [
            cid for cid, conv in cls._conversations.items()
            if conv.updated_at < cutoff
        ]
        for cid in to_delete:
            del cls._conversations[cid]
        return len(to_delete)


class SecurityContext:
    def __init__(self):
        self.allowed_tools: Optional[List[str]] = None
        self.max_tool_executions: int = 10
        self.tool_executions: int = 0
        self.sensitive_operations: List[str] = ["command_executor", "file_manager"]
        self.requires_approval: bool = False

    def can_execute_tool(self, tool_name: str) -> bool:
        if self.allowed_tools is not None:
            return tool_name in self.allowed_tools
        
        if self.tool_executions >= self.max_tool_executions:
            return False
        
        return True

    def record_tool_execution(self):
        self.tool_executions += 1

    def is_sensitive_operation(self, tool_name: str) -> bool:
        return tool_name in self.sensitive_operations


class Agent:
    def __init__(
        self,
        llm_service: Optional[LLMService] = None,
        tool_registry: Optional[ToolRegistry] = None,
        system_prompt: Optional[str] = None,
        agent_name: str = "Dreamix Assistant",
        agent_role: str = "general"
    ):
        self.llm_service = llm_service or get_llm_service()
        self.tool_registry = tool_registry or get_tool_registry()
        self.system_prompt = system_prompt or self._get_default_system_prompt()
        self.agent_name = agent_name
        self.agent_role = agent_role
        self.security_context = SecurityContext()

    def _get_default_system_prompt(self) -> str:
        tools_description = "\n".join([
            f"- {tool.name}: {tool.description}"
            for tool in self.tool_registry.get_all_tools()
        ])
        return f"""You are {self.agent_name}, a sophisticated AI assistant built on the Dreamix platform. 
Your role is to help users with various tasks, leveraging your capabilities in intelligent analysis, 
media creation, and problem-solving.

You have access to the following tools:

{tools_description}

When you need to use a tool, respond with a JSON object in the following format:
{{
    "tool_call": {{
        "name": "tool_name",
        "parameters": {{
            "param1": "value1",
            "param2": "value2"
        }}
    }}
}}

Always use tools when appropriate. If no tool is needed, respond normally with text.
Remember to:
1. Maintain context from previous messages
2. Ask for clarification when needed
3. Break complex tasks into manageable steps
4. Provide helpful, informative responses
"""

    def _format_messages_for_llm(self, conversation: Conversation, include_context: bool = True) -> List[Dict[str, str]]:
        messages = [{"role": "system", "content": self.system_prompt}]
        
        if include_context and conversation.context.preferences:
            context_msg = f"User preferences: {json.dumps(conversation.context.preferences)}"
            messages.append({"role": "system", "content": context_msg})
        
        for msg in conversation.get_messages():
            messages.append({"role": msg.role, "content": msg.content})
        
        return messages

    async def _process_tool_call(self, tool_call: Dict[str, Any]) -> Dict[str, Any]:
        tool_name = tool_call.get("name")
        parameters = tool_call.get("parameters", {})

        if not self.security_context.can_execute_tool(tool_name):
            return {"error": f"Tool execution not allowed: {tool_name}"}

        if self.security_context.is_sensitive_operation(tool_name):
            pass

        tool = self.tool_registry.get_tool(tool_name)
        if not tool:
            return {"error": f"Tool not found: {tool_name}"}

        try:
            self.security_context.record_tool_execution()
            result = await tool.execute(**parameters)
            return {"tool": tool_name, "result": result}
        except Exception as e:
            return {"tool": tool_name, "error": str(e)}

    def _extract_tool_call(self, content: str) -> Optional[Dict[str, Any]]:
        try:
            parsed = json.loads(content)
            if isinstance(parsed, dict) and "tool_call" in parsed:
                return parsed["tool_call"]
        except json.JSONDecodeError:
            pass
        
        try:
            start = content.find('{')
            end = content.rfind('}') + 1
            if start >= 0 and end > start:
                parsed = json.loads(content[start:end])
                if isinstance(parsed, dict) and "tool_call" in parsed:
                    return parsed["tool_call"]
        except (json.JSONDecodeError, ValueError):
            pass
        
        return None

    async def process_message(
        self,
        user_message: str,
        conversation_id: Optional[str] = None,
        use_tools: bool = True,
        max_tool_iterations: int = 5
    ) -> Dict[str, Any]:
        conversation = ConversationStore.get_or_create_conversation(conversation_id)
        conversation.add_message("user", user_message)

        if not conversation.title:
            conversation.generate_summary()

        llm_messages = self._format_messages_for_llm(conversation)
        
        tool_calls = []
        tool_results = []
        final_response = None

        try:
            for iteration in range(max_tool_iterations):
                response = await self.llm_service.generate_completion(
                    messages=llm_messages,
                    temperature=0.7
                )
                assistant_content = response["content"]

                tool_call = self._extract_tool_call(assistant_content) if use_tools else None

                if not tool_call or iteration >= max_tool_iterations - 1:
                    final_response = assistant_content
                    break

                tool_result = await self._process_tool_call(tool_call)
                tool_calls.append(tool_call)
                tool_results.append(tool_result)

                conversation.add_message("assistant", assistant_content)
                tool_message = f"Tool execution result: {json.dumps(tool_result)}"
                conversation.add_message("user", tool_message, metadata={"tool_result": True})

                llm_messages = self._format_messages_for_llm(conversation)

            conversation.add_message("assistant", final_response or "I'm unable to complete that task.")

            return {
                "conversation_id": conversation.conversation_id,
                "message": final_response or "I'm unable to complete that task.",
                "tool_used": len(tool_calls) > 0,
                "tool_calls": tool_calls,
                "tool_results": tool_results,
                "usage": response.get("usage"),
                "model": response.get("model"),
                "agent_name": self.agent_name,
                "agent_role": self.agent_role
            }

        except Exception as e:
            error_message = f"Error processing message: {str(e)}"
            conversation.add_message("assistant", error_message)
            return {
                "conversation_id": conversation.conversation_id,
                "message": error_message,
                "error": str(e)
            }

    async def process_multi_turn(
        self,
        messages: List[Dict[str, str]],
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        conversation = ConversationStore.get_or_create_conversation(conversation_id)
        
        for msg in messages:
            conversation.add_message(msg["role"], msg["content"])
        
        last_user_msg = next((m for m in reversed(messages) if m["role"] == "user"), None)
        if last_user_msg:
            return await self.process_message(
                last_user_msg["content"],
                conversation_id=conversation_id,
                use_tools=True
            )
        
        return {"error": "No user message found"}


_agent: Optional[Agent] = None


def get_agent() -> Agent:
    global _agent
    if _agent is None:
        _agent = Agent(agent_name="Dreamix Assistant", agent_role="video_creation")
    return _agent


def create_specialized_agent(agent_role: str, system_prompt: Optional[str] = None) -> Agent:
    role_configs = {
        "video_creation": {
            "name": "Dreamix Video Creator",
            "prompt": None
        },
        "researcher": {
            "name": "Dreamix Researcher",
            "prompt": None
        },
        "analyst": {
            "name": "Dreamix Analyst",
            "prompt": None
        }
    }
    
    config = role_configs.get(agent_role, role_configs["video_creation"])
    return Agent(
        agent_name=config["name"],
        agent_role=agent_role,
        system_prompt=system_prompt or config["prompt"]
    )
