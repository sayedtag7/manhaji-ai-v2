"""
Chat routes — Socratic Orchestrator with RAG context injection, conversation memory,
and Egyptian Tutor persona. SSE streaming for real-time responses.

Architecture:
  1. Every query first retrieves NotebookEntries + StudentMisconceptions context.
  2. Socratic Gate: rejects direct answers if quiz_attempts < 2 for that topic.
  3. Conversation memory stored per-session for coherent multi-turn dialogue.
  4. Citations appended from RAG sources.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from collections import defaultdict
import asyncio
import json
import logging
import time

logger = logging.getLogger(__name__)
router = APIRouter()

# Will be initialized from main.py
_rag_system = None
_vector_store = None
_misconception_detector = None

# ──────────────────────────── In-memory session stores ────────────────────
# Conversation memory: student_id → list of {role, content, timestamp}
_conversation_memory: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
MAX_MEMORY_TURNS = 20

# Student context: student_id → {notebook_entries, misconceptions, quiz_attempts}
_student_context: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
    "notebook_entries": [],
    "active_misconceptions": [],
    "quiz_attempts": {},   # topic → attempt_count
    "last_activity": None,
})


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
    # New: student context for Socratic gate
    notebook_text: Optional[str] = None
    quiz_attempts_on_topic: int = 0
    topic: Optional[str] = None


class ChatResponse(BaseModel):
    text: str
    misconception_flag: bool = False
    misconception_type: Optional[str] = None
    sources: List[str] = []
    citations: List[str] = []
    sentiment: str = "neutral"
    socratic_hint: bool = False


# ──────────────────── Context injection helpers ───────────────────────────

def _build_session_context(student_id: str, request: ChatRequest) -> str:
    """Build rich context from notebook entries, misconceptions, and conversation history."""
    parts = []

    # 1. Conversation history (last N turns)
    memory = _conversation_memory.get(student_id, [])
    if memory:
        history_text = "\n".join([
            f"{'الطالب' if m['role'] == 'user' else 'المعلم'}: {m['content'][:200]}"
            for m in memory[-6:]  # last 3 exchanges
        ])
        parts.append(f"## سجل المحادثة الأخيرة:\n{history_text}")

    # 2. Student's notebook entries (if provided)
    ctx = _student_context[student_id]
    if request.notebook_text:
        ctx["notebook_entries"].append(request.notebook_text[:500])
        ctx["notebook_entries"] = ctx["notebook_entries"][-5:]  # keep last 5

    if ctx["notebook_entries"]:
        parts.append(f"## ملاحظات الطالب من الدفتر:\n" + "\n".join(ctx["notebook_entries"][-3:]))

    # 3. Active misconceptions
    if ctx["active_misconceptions"]:
        parts.append(f"## مفاهيم خاطئة مكتشفة:\n" + "\n".join(ctx["active_misconceptions"][-3:]))

    # 4. Quiz attempt tracking
    topic = request.topic or request.subject or "general"
    attempts = ctx["quiz_attempts"].get(topic, request.quiz_attempts_on_topic)
    if attempts > 0:
        parts.append(f"## محاولات الكويز على هذا الموضوع: {attempts}")

    return "\n\n".join(parts)


def _apply_socratic_gate(message: str, student_id: str, topic: str, quiz_attempts: int) -> Optional[str]:
    """
    Socratic Gate Logic:
    - If student asks for direct answer AND quiz_attempts < 2 → reject with guidance
    - If quiz_attempts >= 2 → provide hint, not full answer
    - Otherwise → allow normal response
    """
    # Detect "give me the answer" patterns
    direct_answer_patterns = [
        "الإجابة", "الجواب", "حلها", "قولي الحل", "إيه الإجابة",
        "what's the answer", "tell me the answer", "give me the solution",
        "مش عارف", "مش فاهم حاجة", "قولي بس",
    ]

    is_asking_direct = any(p in message.lower() for p in direct_answer_patterns)

    if not is_asking_direct:
        return None  # Allow normal flow

    ctx = _student_context[student_id]
    attempts = ctx["quiz_attempts"].get(topic, quiz_attempts)

    if attempts < 2:
        return (
            "يا بطل، أنا مش هديك الإجابة على طول — ده مش هيفيدك! 🙅‍♂️\n\n"
            "جرب تفكر فيها الأول وحاول تحلها. لو غلطت مرتين، "
            "هساعدك بتلميحات تفصيلية. الهدف إنك تفهم مش تحفظ!\n\n"
            "💡 **نصيحة**: ارجع للدرس واقرأ الجزء المتعلق بالسؤال، "
            "وبعدين جرب تاني. أنا هنا لو عايز أوجهك."
        )

    if attempts >= 2:
        return None  # Allow hint-based response (handled in prompt)

    return None


def _format_citations(sources: List[str]) -> List[str]:
    """Format RAG source labels into proper citations."""
    citations = []
    for i, src in enumerate(sources):
        if src and src != f"doc-{i}":
            citations.append(f"(المصدر: {src})")
    return citations


def _store_memory(student_id: str, role: str, content: str):
    """Store a conversation turn in memory."""
    _conversation_memory[student_id].append({
        "role": role,
        "content": content[:500],
        "timestamp": time.time(),
    })
    # Trim to max
    if len(_conversation_memory[student_id]) > MAX_MEMORY_TURNS:
        _conversation_memory[student_id] = _conversation_memory[student_id][-MAX_MEMORY_TURNS:]


# ──────────────────── Student context update endpoints ────────────────────

@router.post("/update-context")
async def update_student_context(request: dict):
    """Update student context for richer AI responses.
    Called by frontend when notebook changes, quiz results come in, etc.
    """
    student_id = request.get("student_id", "anonymous")
    ctx = _student_context[student_id]

    if "notebook_text" in request:
        ctx["notebook_entries"].append(request["notebook_text"][:500])
        ctx["notebook_entries"] = ctx["notebook_entries"][-5:]

    if "misconception" in request:
        if request["misconception"] not in ctx["active_misconceptions"]:
            ctx["active_misconceptions"].append(request["misconception"])

    if "resolve_misconception" in request:
        mc = request["resolve_misconception"]
        ctx["active_misconceptions"] = [m for m in ctx["active_misconceptions"] if m != mc]

    if "quiz_topic" in request and "quiz_score" in request:
        topic = request["quiz_topic"]
        ctx["quiz_attempts"][topic] = ctx["quiz_attempts"].get(topic, 0) + 1
        # If they scored well, reset the counter
        if request["quiz_score"] >= 80:
            ctx["quiz_attempts"][topic] = 0

    return {"status": "updated", "context_keys": list(ctx.keys())}


@router.get("/memory/{student_id}")
async def get_conversation_memory(student_id: str):
    """Get conversation history for a student (for UI display)."""
    memory = _conversation_memory.get(student_id, [])
    return {"turns": memory[-10:], "total": len(memory)}


@router.delete("/memory/{student_id}")
async def clear_conversation_memory(student_id: str):
    """Clear conversation history for a student."""
    _conversation_memory[student_id] = []
    return {"status": "cleared"}


# ──────────────────── Main chat endpoints ─────────────────────────────────

@router.post("/query")
async def chat_query(request: ChatRequest):
    """Socratic chat query with full context injection and conversation memory."""
    if not _rag_system or not _vector_store:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    student_id = request.student_id or "anonymous"
    topic = request.topic or request.subject or "general"

    # Store user message in memory
    _store_memory(student_id, "user", request.message)

    # 1. Socratic Gate Check
    gate_response = _apply_socratic_gate(
        request.message, student_id, topic, request.quiz_attempts_on_topic
    )
    if gate_response:
        _store_memory(student_id, "assistant", gate_response)
        return ChatResponse(
            text=gate_response,
            socratic_hint=True,
            sentiment="encouraging",
        )

    # 2. Retrieve curriculum context via RAG
    context, sources = _vector_store.retrieve(
        query=request.message,
        grade=request.grade,
        subject=request.subject,
        top_k=5,
    )

    # 3. Build session context (notebook + misconceptions + history)
    session_context = _build_session_context(student_id, request)

    # 4. Detect misconceptions in student's message
    misconception_flag = False
    misconception_type = None
    if _misconception_detector:
        misconception_flag, misconception_type = _misconception_detector.detect(
            student_input=request.message,
            retrieved_context=context,
            subject=request.subject or "",
        )
        # Track detected misconception
        if misconception_flag and misconception_type:
            _student_context[student_id]["active_misconceptions"].append(misconception_type)

    # 5. Combine all context for the AI
    full_context = context
    if session_context:
        full_context = f"{session_context}\n\n---\n\n## محتوى المنهج:\n{context}"

    # 6. Check if we should give hints vs full answer (Socratic logic)
    quiz_attempts = _student_context[student_id]["quiz_attempts"].get(topic, request.quiz_attempts_on_topic)
    if quiz_attempts >= 2:
        full_context += (
            "\n\n## تعليمات سقراطية:\n"
            "الطالب حاول مرتين أو أكثر. اديله تلميح واضح يساعده يوصل للإجابة بنفسه، "
            "لكن متديلوش الإجابة الكاملة مباشرة. استخدم أسلوب سقراطي: اسأله أسئلة توجيهية."
        )

    # 7. Generate response
    response_text, sentiment = _rag_system.generate_response(
        query=request.message,
        context=full_context,
        misconception_flag=misconception_flag,
        misconception_type=misconception_type,
    )

    # 8. Append citations
    citations = _format_citations(sources)
    if citations:
        response_text += "\n\n---\n📚 " + " | ".join(citations)

    # 9. Store assistant response in memory
    _store_memory(student_id, "assistant", response_text)

    return ChatResponse(
        text=response_text,
        misconception_flag=misconception_flag,
        misconception_type=misconception_type,
        sources=sources,
        citations=citations,
        sentiment=sentiment,
        socratic_hint=quiz_attempts >= 2,
    )


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """SSE streaming Socratic chat with full context injection."""
    if not _rag_system or not _vector_store:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    student_id = request.student_id or "anonymous"
    topic = request.topic or request.subject or "general"

    # Store user message
    _store_memory(student_id, "user", request.message)

    # Socratic Gate
    gate_response = _apply_socratic_gate(
        request.message, student_id, topic, request.quiz_attempts_on_topic
    )
    if gate_response:
        _store_memory(student_id, "assistant", gate_response)
        async def gate_gen():
            data = json.dumps({"text": gate_response, "done": False, "socratic_hint": True}, ensure_ascii=False)
            yield f"data: {data}\n\n"
            yield f"data: {json.dumps({'text': '', 'done': True}, ensure_ascii=False)}\n\n"
        return StreamingResponse(gate_gen(), media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache", "Connection": "keep-alive"})

    # RAG retrieval
    context, sources = _vector_store.retrieve(
        query=request.message,
        grade=request.grade,
        subject=request.subject,
        top_k=5,
    )

    # Session context injection
    session_context = _build_session_context(student_id, request)
    full_context = context
    if session_context:
        full_context = f"{session_context}\n\n---\n\n## محتوى المنهج:\n{context}"

    # Socratic hint instructions
    quiz_attempts = _student_context[student_id]["quiz_attempts"].get(topic, request.quiz_attempts_on_topic)
    if quiz_attempts >= 2:
        full_context += (
            "\n\n## تعليمات سقراطية:\n"
            "الطالب حاول مرتين أو أكثر. اديله تلميح واضح لكن متديلوش الإجابة الكاملة."
        )

    citations = _format_citations(sources)

    async def event_generator():
        collected_text = []
        try:
            async for chunk in _rag_system.generate_response_stream(request.message, full_context):
                collected_text.append(chunk)
                data = json.dumps({"text": chunk, "done": False}, ensure_ascii=False)
                yield f"data: {data}\n\n"
            # Append citations at the end
            if citations:
                citation_text = "\n\n---\n📚 " + " | ".join(citations)
                yield f"data: {json.dumps({'text': citation_text, 'done': False}, ensure_ascii=False)}\n\n"
            # Store full response in memory
            full_response = "".join(collected_text)
            _store_memory(student_id, "assistant", full_response)
            # Final event
            yield f"data: {json.dumps({'text': '', 'done': True, 'sources': sources, 'socratic_hint': quiz_attempts >= 2}, ensure_ascii=False)}\n\n"
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
