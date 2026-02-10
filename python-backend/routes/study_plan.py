"""
Study Plan routes — AI-generated daily study plans.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

_study_planner = None


def init_study_planner(planner):
    global _study_planner
    _study_planner = planner


class PlanRequest(BaseModel):
    student_id: str
    grade: Optional[int] = 7
    lessons_completed: Optional[int] = 0
    last_lesson: Optional[str] = None
    last_quiz_score: Optional[float] = None
    misconceptions: Optional[List[str]] = []
    streak: Optional[int] = 0
    strongest_subject: Optional[str] = None
    weakest_subject: Optional[str] = None


@router.post("/api/study-plan/generate")
async def generate_plan(request: PlanRequest):
    """Generate a personalized AI study plan."""
    if not _study_planner:
        raise HTTPException(status_code=503, detail="Study planner not initialized")

    student_data = {
        "grade": request.grade,
        "lessons_completed": request.lessons_completed,
        "last_lesson": request.last_lesson,
        "last_quiz_score": request.last_quiz_score,
        "misconceptions": request.misconceptions or [],
        "streak": request.streak,
        "strongest_subject": request.strongest_subject,
        "weakest_subject": request.weakest_subject,
    }

    plan = _study_planner.generate_plan(request.student_id, student_data)
    return plan.model_dump()


@router.get("/api/study-plan/sample")
async def sample_plan():
    """Get a sample study plan for testing."""
    if not _study_planner:
        raise HTTPException(status_code=503, detail="Study planner not initialized")
    return _study_planner.get_sample_plan().model_dump()


@router.get("/api/study-plan/example")
async def realistic_example():
    """
    Get a realistic example plan:
    - Student excellent in Science
    - Low engagement in Arabic
    - Has misconceptions to fix
    
    This demonstrates the "Egyptian Coach" strategy in action.
    """
    if not _study_planner:
        raise HTTPException(status_code=503, detail="Study planner not initialized")
    return _study_planner.get_realistic_example_plan().model_dump()


@router.get("/api/study-plan/health")
async def health_check():
    """Check if study planner service is available."""
    if not _study_planner:
        return {"status": "unavailable", "message": "Study planner not initialized"}
    return {
        "status": "healthy",
        "message": "Study plan generator is ready",
        "model": "gemini-1.5-flash",
        "persona": "Egyptian Coach",
    }
