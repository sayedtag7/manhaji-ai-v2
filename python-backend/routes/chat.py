"""
Chat routes — RAG-powered conversational endpoint with SSE streaming.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Will be initialized from main.py
_rag_system = None
_vector_store = None
_misconception_detector = None


def init_chat(rag_system, vector_store, misconception_detector):
    global _rag_system, _vector_store, _misconception_detector
    _rag_system = rag_system
    _vector_store = vector_store
    _misconception_detector = misconception_detector


class ChatRequest(BaseModel):
    message: str
    student_id: Optional[str] = None
    lesson_id: Optional[str] = None
    grade: Optional[int] = None
    subject: Optional[str] = None
    stream: bool = False


class ChatResponse(BaseModel):
    text: str
    misconception_flag: bool = False
    misconception_type: Optional[str] = None
    sources: List[str] = []
    sentiment: str = "neutral"


@router.post("/query")
async def chat_query(request: ChatRequest):
    """Standard chat query with RAG."""
    if not _rag_system or not _vector_store:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    # Retrieve relevant curriculum context
    context, sources = _vector_store.retrieve(
        query=request.message,
        grade=request.grade,
        subject=request.subject,
        top_k=5,
    )

    # Detect misconceptions
    misconception_flag = False
    misconception_type = None
    if _misconception_detector:
        misconception_flag, misconception_type = _misconception_detector.detect(
            student_input=request.message,
            retrieved_context=context,
            subject=request.subject or "",
        )

    # Generate response
    response_text, sentiment = _rag_system.generate_response(
        query=request.message,
        context=context,
        misconception_flag=misconception_flag,
        misconception_type=misconception_type,
    )

    return ChatResponse(
        text=response_text,
        misconception_flag=misconception_flag,
        misconception_type=misconception_type,
        sources=sources,
        sentiment=sentiment,
    )


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """SSE streaming chat response."""
    if not _rag_system or not _vector_store:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    context, sources = _vector_store.retrieve(
        query=request.message,
        grade=request.grade,
        subject=request.subject,
        top_k=5,
    )

    async def event_generator():
        try:
            async for chunk in _rag_system.generate_response_stream(request.message, context):
                data = json.dumps({"text": chunk, "done": False}, ensure_ascii=False)
                yield f"data: {data}\n\n"
            # Final event
            yield f"data: {json.dumps({'text': '', 'done': True, 'sources': sources}, ensure_ascii=False)}\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f"data: {json.dumps({'text': 'عذراً حصل خطأ', 'done': True}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
