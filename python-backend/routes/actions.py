"""
Action Engine routes — Dynamic "Everything is a Prompt" API.
Replaces all static buttons and hardcoded paths with AI-driven decisions.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.action_engine import ActionEngine, StudentBehavior
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

_action_engine: Optional[ActionEngine] = None


def init_action_engine(engine: ActionEngine):
    global _action_engine
    _action_engine = engine


class BehaviorRequest(BaseModel):
    student_id: str
    last_lesson_id: Optional[str] = None
    last_lesson_subject: Optional[str] = None
    last_quiz_score: Optional[float] = None
    quiz_failure_count: int = 0
    active_misconceptions: List[str] = []
    streak_days: int = 0
    total_xp: int = 0
    lessons_completed: int = 0
    time_spent_today_minutes: int = 0
    last_activity: Optional[str] = None
    grade: int = 7


class InsightRequest(BaseModel):
    student_id: str
    name: Optional[str] = "الطالب"
    lessons_completed: int = 0
    streak: int = 0
    total_points: int = 0
    misconceptions: List[str] = []
    last_subject: Optional[str] = None
    progress_percent: float = 0
    time_spent_minutes: int = 0
    strongest_subject: Optional[str] = None
    weakest_subject: Optional[str] = None
    insight_type: str = "dashboard"  # dashboard | parent_report | parent_alert | next_action


class NotebookScanRequest(BaseModel):
    student_id: str
    notebook_text: str
    subject: str = "science"
    grade: int = 7


# ────────────────────────────────── Action Engine endpoints

@router.post("/api/actions/decide")
async def decide_action(request: BehaviorRequest):
    """Get the AI-recommended next action for a student. Replaces ALL static buttons."""
    if not _action_engine:
        raise HTTPException(status_code=503, detail="Action engine not initialized")

    behavior = StudentBehavior(**request.model_dump())
    action = _action_engine.decide(behavior)
    return action.model_dump()


@router.post("/api/actions/decide-multiple")
async def decide_multiple(request: BehaviorRequest):
    """Get multiple ranked action suggestions."""
    if not _action_engine:
        raise HTTPException(status_code=503, detail="Action engine not initialized")

    behavior = StudentBehavior(**request.model_dump())
    actions = _action_engine.decide_multiple(behavior, count=3)
    return {"actions": [a.model_dump() for a in actions]}


@router.post("/api/actions/dynamic-button")
async def dynamic_button(request: BehaviorRequest):
    """Get dynamic button configuration for the main CTA.
    The 'Plan' button target changes based on student behavior.
    """
    if not _action_engine:
        raise HTTPException(status_code=503, detail="Action engine not initialized")

    behavior = StudentBehavior(**request.model_dump())
    button = _action_engine.get_dynamic_button(behavior)
    return button


@router.post("/api/actions/learning-path")
async def get_learning_path(request: BehaviorRequest):
    """AI-driven learning path recommendation.
    Gemini analyzes student confusion and returns the exact content that fits this moment.
    """
    if not _action_engine:
        raise HTTPException(status_code=503, detail="Action engine not initialized")

    behavior = StudentBehavior(**request.model_dump())

    # Use AI-augmented decision if RAG is available
    action = await _action_engine.decide_with_ai(behavior)
    return action.model_dump()


# ────────────────────────────────── Live Insights (SSE)

@router.post("/api/insights/generate")
async def generate_insight(request: InsightRequest):
    """Generate a personalized AI insight. Replaces all static 'AI Insight' text."""
    if not _action_engine or not _action_engine.rag:
        # Fallback without RAG
        return {
            "insight_ar": "استمر يا بطل! أنت بتتحسن كل يوم 💪",
            "insight_en": "Keep going, champ! You're improving every day 💪",
            "type": request.insight_type,
        }

    student_data = request.model_dump(exclude={"student_id", "insight_type"})
    insight = _action_engine.rag.generate_insight(student_data, request.insight_type)
    return {
        "insight_ar": insight,
        "insight_en": insight,  # Gemini returns in requested language
        "type": request.insight_type,
    }


@router.post("/api/insights/stream")
async def stream_insight(request: InsightRequest):
    """SSE stream for real-time AI insight updates on the dashboard."""
    if not _action_engine or not _action_engine.rag:
        async def fallback():
            data = json.dumps({
                "text": "استمر يا بطل! أنت بتتحسن كل يوم 💪",
                "done": True,
            }, ensure_ascii=False)
            yield f"data: {data}\n\n"

        return StreamingResponse(
            fallback(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )

    student_data = request.model_dump(exclude={"student_id", "insight_type"})

    async def event_gen():
        prompt = (
            f"بيانات الطالب: {json.dumps(student_data, ensure_ascii=False)}\n"
            f"نوع: {request.insight_type}\n"
            "اكتب ملخص مشجع قصير بلهجة مصرية."
        )
        try:
            async for chunk in _action_engine.rag.generate_response_stream(prompt, ""):
                yield f"data: {json.dumps({'text': chunk, 'done': False}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'text': '', 'done': True}, ensure_ascii=False)}\n\n"
        except Exception as e:
            logger.error(f"Insight stream error: {e}")
            yield f"data: {json.dumps({'text': 'جاري التحليل...', 'done': True}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


# ────────────────────────────────── Socratic Quiz Controller

@router.post("/api/quiz/socratic")
async def socratic_question(request: dict):
    """Generate the next quiz question based on the student's previous reasoning.
    NOT from a fixed list — every question is dynamically generated by Gemini.
    """
    if not _action_engine or not _action_engine.rag:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    topic = request.get("topic", "")
    previous_answer = request.get("previous_answer")
    previous_reasoning = request.get("previous_reasoning")
    question_number = request.get("question_number", 1)
    difficulty = request.get("difficulty", "medium")
    grade = request.get("grade", 7)
    subject = request.get("subject", "science")

    # Get curriculum context for grounding
    context = ""
    if _action_engine.vector_store:
        context, _ = _action_engine.vector_store.retrieve(
            query=topic, grade=grade, subject=subject, top_k=3
        )

    question = _action_engine.rag.generate_socratic_question(
        topic=topic,
        previous_answer=previous_answer,
        previous_reasoning=previous_reasoning,
        question_number=question_number,
        difficulty=difficulty,
        context=context,
    )

    return question


@router.post("/api/quiz/evaluate-reasoning")
async def evaluate_reasoning(request: dict):
    """Evaluate student's reasoning for an answer (for Teach-the-AI mode)."""
    if not _action_engine or not _action_engine.rag:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    student_explanation = request.get("explanation", "")
    correct_concept = request.get("correct_concept", "")
    topic = request.get("topic", "")

    prompt = f"""
قيّم شرح الطالب ده:
الموضوع: {topic}
المفهوم الصحيح: {correct_concept}
شرح الطالب: {student_explanation}

قيّم بلهجة مصرية مشجعة وأرجع JSON:
{{
  "score": 0-100,
  "feedback_ar": "تعليق مشجع بالمصري",
  "feedback_en": "encouraging feedback",
  "is_correct": true/false,
  "missing_points": ["نقاط ناقصة"],
  "xp_earned": 0-100
}}
"""
    try:
        response = _action_engine.rag.model.generate_content(prompt)
        text = response.text or "{}"
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        return json.loads(text.strip())
    except Exception as e:
        logger.error(f"Evaluate reasoning error: {e}")
        return {"score": 50, "feedback_ar": "حاول تاني يا بطل!", "is_correct": False, "xp_earned": 25}


# ────────────────────────────────── Notebook Intelligence

@router.post("/api/notebook/scan")
async def scan_notebook(request: NotebookScanRequest):
    """Real-time misconception detection from student notebook text.
    Returns misconceptions and updates parent dashboard alerts.
    """
    if not _action_engine or not _action_engine.rag:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    result = _action_engine.rag.scan_notebook_for_misconceptions(
        notebook_text=request.notebook_text,
        subject=request.subject,
        grade=request.grade,
    )
    return result


@router.post("/api/notebook/scan-stream")
async def scan_notebook_stream(request: NotebookScanRequest):
    """SSE stream for real-time notebook scanning as the student types."""
    if not _action_engine or not _action_engine.rag:
        async def fallback():
            yield f"data: {json.dumps({'has_misconceptions': False, 'done': True}, ensure_ascii=False)}\n\n"
        return StreamingResponse(fallback(), media_type="text/event-stream")

    async def event_gen():
        # First: quick pattern-based check
        if _action_engine.vector_store:
            from utils.misconceptions import MisconceptionDetector
            detector = MisconceptionDetector()
            flag, mtype = detector.detect(request.notebook_text, subject=request.subject)
            if flag:
                quick_result = {
                    "has_misconceptions": True,
                    "quick_detect": mtype,
                    "done": False,
                }
                yield f"data: {json.dumps(quick_result, ensure_ascii=False)}\n\n"

        # Then: deep AI analysis
        result = _action_engine.rag.scan_notebook_for_misconceptions(
            notebook_text=request.notebook_text,
            subject=request.subject,
            grade=request.grade,
        )
        yield f"data: {json.dumps({**result, 'done': True}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


# ────────────────────────────────── Parent Dashboard Intelligence

@router.post("/api/parent/report")
async def parent_report(request: InsightRequest):
    """Generate AI-powered parent report. Replaces static parent alerts."""
    request_copy = request.model_copy()
    request_copy.insight_type = "parent_report"
    return await generate_insight(request_copy)


@router.post("/api/parent/alert")
async def parent_alert(request: InsightRequest):
    """Generate real-time parent alert based on student behavior."""
    request_copy = request.model_copy()
    request_copy.insight_type = "parent_alert"
    return await generate_insight(request_copy)
