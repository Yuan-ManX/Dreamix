from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.core.agent import get_agent, ConversationStore
from app.core.tools import get_tool_registry

router = APIRouter()


class AgentMessageRequest(BaseModel):
    message: str = Field(..., description="The message to send to the agent")
    conversation_id: Optional[str] = Field(None, description="Optional conversation ID for multi-turn conversations")
    use_tools: bool = Field(True, description="Whether to allow the agent to use tools")


class AgentMessageResponse(BaseModel):
    conversation_id: str
    message: str
    tool_used: bool
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_results: Optional[List[Dict[str, Any]]] = None
    usage: Optional[Dict[str, int]] = None
    model: Optional[str] = None
    agent_name: Optional[str] = None
    agent_role: Optional[str] = None
    error: Optional[str] = None


class ConversationResponse(BaseModel):
    conversation_id: str
    messages: List[Dict[str, Any]]
    created_at: str
    updated_at: str


class ConversationListResponse(BaseModel):
    conversations: List[Dict[str, Any]]


class ToolListResponse(BaseModel):
    tools: List[Dict[str, Any]]


@router.post("/messages", response_model=AgentMessageResponse)
async def send_message_to_agent(request: AgentMessageRequest):
    try:
        agent = get_agent()
        result = await agent.process_message(
            user_message=request.message,
            conversation_id=request.conversation_id,
            use_tools=request.use_tools
        )
        return AgentMessageResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations():
    try:
        conversations = ConversationStore.list_conversations()
        return ConversationListResponse(conversations=conversations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str):
    try:
        conversation = ConversationStore.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return ConversationResponse(**conversation.to_dict())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    try:
        success = ConversationStore.delete_conversation(conversation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"status": "success", "message": "Conversation deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tools", response_model=ToolListResponse)
async def list_tools():
    try:
        registry = get_tool_registry()
        tools = registry.list_tools()
        return ToolListResponse(tools=tools)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
