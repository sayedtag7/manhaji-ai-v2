"""
Analytics routes — Living Dashboard API.
Provides real-time student analytics and AI-generated Daily Pitch insights.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

_analytics = None
_rag = None


def init_analytics(analytics_service, rag_system):
    global _analytics, _rag
    _analytics = analytics_service
    _rag = rag_system


class LogEventRequest(BaseModel):
    student_id: str
    event_type: str  # lesson_start, lesson_end, quiz_attempt, chat, notebook_edit, game_played
    data: Dict[str, Any] = {}


class DailyPitchRequest(BaseModel):
    student_id: str
    student_name: str = "الطالب"


@router.post("/api/analytics/log")
async def log_event(request: LogEventRequest):
    """Log a student interaction event for real-time analytics."""
    if not _analytics:
        return {"status": "analytics_disabled"}

    _analytics.log_event(request.student_id, request.event_type, request.data)

    # Track misconception events specially
    if request.event_type == "misconception_detected":
        _analytics.log_misconception_detected(request.student_id)
    elif request.event_type == "misconception_resolved":
        _analytics.log_misconception_resolved(request.student_id)

    return {"status": "logged", "event_type": request.event_type}


@router.get("/api/analytics/stats/{student_id}")
async def get_stats(student_id: str):
    """Get real-time session stats for the living dashboard."""
    if not _analytics:
        return {
            "session_minutes": 0, "lessons_today": 0, "quizzes_today": 0,
            "engagement_score": 0, "weekly_activity": [],
        }
    return _analytics.get_session_stats(student_id)


@router.post("/api/analytics/daily-pitch")
async def daily_pitch(request: DailyPitchRequest):
    """Generate AI-powered Daily Pitch insight for the dashboard.
    Gemini receives real aggregated analytics and generates a personalized message.
    """
    if not _analytics or not _rag:
        return {
            "pitch_ar": "يلا يا بطل! ابدأ يومك وشوف الإنجازات بتاعتك 💪",
            "pitch_en": "Let's go champ! Start your day and see your achievements 💪",
        }

    pitch_data = _analytics.get_daily_pitch_data(request.student_id, request.student_name)
    insight = _rag.generate_insight(pitch_data, "dashboard")
    return {"pitch_ar": insight, "pitch_en": insight}


@router.post("/api/analytics/daily-pitch-stream")
async def daily_pitch_stream(request: DailyPitchRequest):
    """SSE-stream the Daily Pitch so it appears word-by-word on the dashboard."""
    if not _analytics or not _rag:
        async def fallback():
            data = json.dumps({
                "text": "يلا يا بطل! ابدأ يومك وشوف الإنجازات 💪",
                "done": True,
            }, ensure_ascii=False)
            yield f"data: {data}\n\n"
        return StreamingResponse(fallback(), media_type="text/event-stream")

    pitch_data = _analytics.get_daily_pitch_data(request.student_id, request.student_name)

    async def event_gen():
        prompt = (
            f"بيانات الطالب اليومية: {json.dumps(pitch_data, ensure_ascii=False)}\n\n"
            "اكتب 'Daily Pitch' مشجع بلهجة مصرية (3-4 جمل). "
            "اذكر إنجازات اليوم وشجع الطالب يكمل. "
            "لو الطالب مدخلش النهارده، شجعه يبدأ."
        )
        try:
            async for chunk in _rag.generate_response_stream(prompt, ""):
                yield f"data: {json.dumps({'text': chunk, 'done': False}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'text': '', 'done': True}, ensure_ascii=False)}\n\n"
        except Exception as e:
            logger.error(f"Daily pitch stream error: {e}")
            yield f"data: {json.dumps({'text': 'يلا يا بطل!', 'done': True}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )
