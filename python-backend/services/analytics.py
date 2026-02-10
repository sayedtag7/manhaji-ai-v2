"""
Analytics Service — Aggregates student interaction data for the Living Dashboard.
Computes session durations, misconception resolution rates, engagement scores,
and passes aggregates to Gemini for "Daily Pitch" generation.

Principles:
  • All analytics are real-time, computed from in-memory interaction logs.
  • The "Daily Pitch" is a streaming AI insight shown on the Dashboard.
  • No hardcoded analytics text — everything is AI-generated.
"""
from typing import Dict, Any, List, Optional
from collections import defaultdict
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)


class InteractionLog:
    """A single student interaction event."""
    def __init__(self, event_type: str, data: Dict[str, Any] = None):
        self.event_type = event_type     # lesson_start, lesson_end, quiz_attempt, chat, notebook_edit, game_played
        self.data = data or {}
        self.timestamp = datetime.now()


class AnalyticsService:
    """
    Real-time analytics aggregation engine.
    Stores interaction logs per student and computes live metrics.
    """

    def __init__(self):
        # student_id → list of InteractionLog
        self._logs: Dict[str, List[InteractionLog]] = defaultdict(list)
        # student_id → resolved misconceptions count
        self._resolved_misconceptions: Dict[str, int] = defaultdict(int)
        # student_id → total misconceptions detected
        self._detected_misconceptions: Dict[str, int] = defaultdict(int)

    def log_event(self, student_id: str, event_type: str, data: Dict[str, Any] = None):
        """Record a student interaction event."""
        self._logs[student_id].append(InteractionLog(event_type, data))
        # Keep last 500 events per student
        if len(self._logs[student_id]) > 500:
            self._logs[student_id] = self._logs[student_id][-500:]

    def log_misconception_detected(self, student_id: str):
        self._detected_misconceptions[student_id] += 1

    def log_misconception_resolved(self, student_id: str):
        self._resolved_misconceptions[student_id] += 1

    def get_session_stats(self, student_id: str) -> Dict[str, Any]:
        """Compute real-time session stats for the dashboard."""
        logs = self._logs.get(student_id, [])
        now = datetime.now()
        today = now.date()

        # Today's events
        today_logs = [l for l in logs if l.timestamp.date() == today]

        # Session duration (time between first and last event today)
        if today_logs:
            session_start = today_logs[0].timestamp
            session_end = today_logs[-1].timestamp
            session_minutes = max(1, int((session_end - session_start).total_seconds() / 60))
        else:
            session_minutes = 0

        # Event counts
        lessons_today = sum(1 for l in today_logs if l.event_type == "lesson_end")
        quizzes_today = sum(1 for l in today_logs if l.event_type == "quiz_attempt")
        chats_today = sum(1 for l in today_logs if l.event_type == "chat")
        games_today = sum(1 for l in today_logs if l.event_type == "game_played")
        notebook_edits = sum(1 for l in today_logs if l.event_type == "notebook_edit")

        # Quiz performance
        quiz_events = [l for l in today_logs if l.event_type == "quiz_attempt"]
        quiz_scores = [l.data.get("score", 0) for l in quiz_events if "score" in l.data]
        avg_quiz_score = sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0

        # Weekly trend (last 7 days)
        weekly_activity = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_logs = [l for l in logs if l.timestamp.date() == day]
            weekly_activity.append({
                "date": day.isoformat(),
                "events": len(day_logs),
                "lessons": sum(1 for l in day_logs if l.event_type == "lesson_end"),
                "minutes": self._day_duration(day_logs),
            })

        # Misconception resolution rate
        detected = self._detected_misconceptions.get(student_id, 0)
        resolved = self._resolved_misconceptions.get(student_id, 0)
        resolution_rate = (resolved / detected * 100) if detected > 0 else 100

        # Engagement score (0-100)
        engagement = min(100, (
            lessons_today * 20 +
            quizzes_today * 15 +
            chats_today * 5 +
            games_today * 10 +
            notebook_edits * 10 +
            min(session_minutes, 60)  # cap at 60 min contribution
        ))

        return {
            "session_minutes": session_minutes,
            "lessons_today": lessons_today,
            "quizzes_today": quizzes_today,
            "chats_today": chats_today,
            "games_today": games_today,
            "notebook_edits": notebook_edits,
            "avg_quiz_score": round(avg_quiz_score, 1),
            "weekly_activity": weekly_activity,
            "misconception_resolution_rate": round(resolution_rate, 1),
            "engagement_score": engagement,
            "total_events_today": len(today_logs),
        }

    def get_daily_pitch_data(self, student_id: str, student_name: str = "الطالب") -> Dict[str, Any]:
        """Aggregate data for Gemini to generate the 'Daily Pitch' insight."""
        stats = self.get_session_stats(student_id)
        return {
            "student_name": student_name,
            "session_minutes_today": stats["session_minutes"],
            "lessons_completed_today": stats["lessons_today"],
            "quizzes_taken_today": stats["quizzes_today"],
            "avg_quiz_score": stats["avg_quiz_score"],
            "engagement_score": stats["engagement_score"],
            "misconception_resolution_rate": stats["misconception_resolution_rate"],
            "weekly_trend": stats["weekly_activity"],
            "active_today": stats["total_events_today"] > 0,
        }

    @staticmethod
    def _day_duration(logs: list) -> int:
        if not logs:
            return 0
        start = logs[0].timestamp
        end = logs[-1].timestamp
        return max(1, int((end - start).total_seconds() / 60))
