"""
Gamification routes — Badges, XP, levels, streaks, daily challenges.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.gamification import gamification_engine, BADGE_DEFINITIONS, LEVELS, XP_REWARDS
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class ProfileRequest(BaseModel):
    student_id: str
    total_xp: Optional[int] = 0
    lessons_completed: Optional[int] = 0
    streak_days: Optional[int] = 0
    perfect_quizzes: Optional[int] = 0
    misconceptions_fixed: Optional[int] = 0
    subjects_mastered: Optional[int] = 0
    last_activity_date: Optional[str] = None
    longest_streak: Optional[int] = 0
    quizzes_completed: Optional[int] = 0
    challenges_completed: Optional[int] = 0
    teach_ai_sessions: Optional[int] = 0
    level_reached: Optional[int] = 1


class XPRequest(BaseModel):
    student_id: str
    action_type: str
    current_xp: int = 0
    current_streak: int = 0


class TaskCompleteRequest(BaseModel):
    student_id: str
    task_id: str
    task_type: str
    current_xp: int = 0
    current_streak: int = 0


@router.get("/api/gamification/badges")
async def get_badges():
    return {"badges": BADGE_DEFINITIONS}


@router.get("/api/gamification/levels")
async def get_levels():
    return {"levels": LEVELS}


@router.get("/api/gamification/xp-rewards")
async def get_xp_rewards():
    return {"rewards": XP_REWARDS}


@router.post("/api/gamification/profile")
async def get_profile(request: ProfileRequest):
    data = request.model_dump(exclude={"student_id"})
    profile = gamification_engine.build_profile(request.student_id, data)
    return profile


@router.post("/api/gamification/award-xp")
async def award_xp(request: XPRequest):
    result = gamification_engine.award_xp(
        request.action_type, request.current_xp, request.current_streak
    )
    return result


@router.post("/api/gamification/task-complete")
async def task_complete(request: TaskCompleteRequest):
    xp_result = gamification_engine.award_xp(
        request.task_type, request.current_xp, request.current_streak
    )
    return {
        "success": True,
        "xp_earned": xp_result["xp_earned"],
        "streak_bonus": xp_result["streak_bonus"],
        "total_xp": xp_result["total_xp"],
        "new_badges": [],
    }


@router.post("/api/gamification/daily-challenges")
async def daily_challenges(request: dict):
    student_id = request.get("student_id", "unknown")
    challenges = gamification_engine.generate_daily_challenges(student_id)
    return {"challenges": challenges}


@router.get("/api/gamification/sample-profile")
async def sample_profile():
    sample_data = {
        "total_xp": 1250,
        "lessons_completed": 12,
        "streak_days": 7,
        "perfect_quizzes": 3,
        "misconceptions_fixed": 2,
        "subjects_mastered": 0,
        "longest_streak": 14,
        "quizzes_completed": 8,
        "challenges_completed": 3,
        "teach_ai_sessions": 1,
        "level_reached": 5,
    }
    return gamification_engine.build_profile("demo_student", sample_data)
