"""Chat API endpoint."""
import uuid
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.database.models import ChatRequest
from app.rag.graph import run_adaptive_rag, run_adaptive_rag_stream
from app.services.memory import get_or_create_conversation

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    """Handle chat request with adaptive RAG."""
    conversation_id = await get_or_create_conversation(request.conversation_id)
    result = await run_adaptive_rag(request.message, conversation_id)
    return result


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Handle chat request with streaming response."""
    conversation_id = await get_or_create_conversation(request.conversation_id)
    
    return StreamingResponse(
        run_adaptive_rag_stream(request.message, conversation_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
