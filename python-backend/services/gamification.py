"""
GamificationEngine — XP, Levels, Badges, Streaks, Daily Challenges.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from enum import Enum
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class BadgeCategory(str, Enum):
    LEARNING = "learning"
    STREAK = "streak"
    MASTERY = "mastery"
    SOCIAL = "social"
    SPECIAL = "special"
    CHALLENGE = "challenge"


XP_REWARDS: Dict[str, int] = {
    "lesson_complete": 50,
    "quiz_pass": 75,
    "quiz_perfect": 150,
    "game_win": 60,
    "streak_day": 25,
    "badge_earned": 100,
    "flashcard_mastered": 15,
    "challenge_complete": 50,
    "misconception_fixed": 100,
    "first_daily_login": 10,
}

LEVELS = [
    {"level": 1, "name": "مبتدئ / Beginner", "min_xp": 0, "max_xp": 99},
    {"level": 2, "name": "متعلم / Learner", "min_xp": 100, "max_xp": 299},
    {"level": 3, "name": "مستكشف / Explorer", "min_xp": 300, "max_xp": 599},
    {"level": 4, "name": "متقدم / Advanced", "min_xp": 600, "max_xp": 999},
    {"level": 5, "name": "خبير / Expert", "min_xp": 1000, "max_xp": 1499},
    {"level": 6, "name": "محترف / Professional", "min_xp": 1500, "max_xp": 2199},
    {"level": 7, "name": "أستاذ / Master", "min_xp": 2200, "max_xp": 2999},
    {"level": 8, "name": "عبقري / Genius", "min_xp": 3000, "max_xp": 3999},
    {"level": 9, "name": "أسطورة / Legend", "min_xp": 4000, "max_xp": 5499},
    {"level": 10, "name": "بطل منهجي / Manhaji Champion", "min_xp": 5500, "max_xp": 99999},
]

BADGE_DEFINITIONS = [
    {"id": "first_lesson", "name_ar": "بداية قوية 🚀", "name_en": "Strong Start 🚀", "description_ar": "أتممت أول درس", "description_en": "Completed first lesson", "icon": "🚀", "category": "learning", "xp_reward": 100, "condition_type": "lessons_completed", "condition_value": 1},
    {"id": "five_lessons", "name_ar": "متعلم نشيط 📚", "name_en": "Active Learner 📚", "description_ar": "أتممت 5 دروس", "description_en": "Completed 5 lessons", "icon": "📚", "category": "learning", "xp_reward": 200, "condition_type": "lessons_completed", "condition_value": 5},
    {"id": "streak_3", "name_ar": "بداية سلسلة 🔥", "name_en": "Streak Starter 🔥", "description_ar": "3 أيام متتالية", "description_en": "3-day streak", "icon": "🔥", "category": "streak", "xp_reward": 100, "condition_type": "streak_days", "condition_value": 3},
    {"id": "streak_7", "name_ar": "المواظب 💪", "name_en": "Consistent 💪", "description_ar": "7 أيام متتالية", "description_en": "7-day streak", "icon": "💪", "category": "streak", "xp_reward": 250, "condition_type": "streak_days", "condition_value": 7},
    {"id": "streak_30", "name_ar": "الأسطورة 🌟", "name_en": "Legend 🌟", "description_ar": "30 يوم متتالي", "description_en": "30-day streak", "icon": "🌟", "category": "streak", "xp_reward": 500, "condition_type": "streak_days", "condition_value": 30},
    {"id": "perfect_quiz", "name_ar": "درجة كاملة 💯", "name_en": "Perfect Score 💯", "description_ar": "100% في كويز", "description_en": "100% on a quiz", "icon": "💯", "category": "mastery", "xp_reward": 150, "condition_type": "perfect_quizzes", "condition_value": 1},
    {"id": "misconception_fixer", "name_ar": "صياد الأخطاء 🎯", "name_en": "Error Hunter 🎯", "description_ar": "صححت مفهوم خاطئ", "description_en": "Fixed a misconception", "icon": "🎯", "category": "challenge", "xp_reward": 100, "condition_type": "misconceptions_fixed", "condition_value": 1},
    {"id": "five_misconceptions", "name_ar": "خبير التصحيح 🔧", "name_en": "Fix Master 🔧", "description_ar": "صححت 5 مفاهيم خاطئة", "description_en": "Fixed 5 misconceptions", "icon": "🔧", "category": "challenge", "xp_reward": 300, "condition_type": "misconceptions_fixed", "condition_value": 5},
    {"id": "science_master", "name_ar": "عبقري العلوم 🧬", "name_en": "Science Whiz 🧬", "description_ar": "أتقنت وحدة علوم كاملة", "description_en": "Mastered a full science unit", "icon": "🧬", "category": "mastery", "xp_reward": 500, "condition_type": "subject_mastery", "condition_value": 1},
    {"id": "math_master", "name_ar": "عبقري الرياضيات 🔢", "name_en": "Math Genius 🔢", "description_ar": "أتقنت وحدة رياضيات كاملة", "description_en": "Mastered a math unit", "icon": "🔢", "category": "mastery", "xp_reward": 500, "condition_type": "subject_mastery", "condition_value": 1},
    {"id": "teach_ai", "name_ar": "المعلم الصغير 🧑‍🏫", "name_en": "Little Teacher 🧑‍🏫", "description_ar": "أكملت جلسة علّم الذكاء الاصطناعي", "description_en": "Completed a Teach-the-AI session", "icon": "🧑‍🏫", "category": "special", "xp_reward": 200, "condition_type": "teach_ai_sessions", "condition_value": 1},
    {"id": "level_5", "name_ar": "خبير منهجي ⭐", "name_en": "Manhaji Expert ⭐", "description_ar": "وصلت المستوى الخامس", "description_en": "Reached level 5", "icon": "⭐", "category": "special", "xp_reward": 300, "condition_type": "level_reached", "condition_value": 5},
    {"id": "ten_quizzes", "name_ar": "بطل الاختبارات 🏆", "name_en": "Quiz Champion 🏆", "description_ar": "أكملت 10 اختبارات", "description_en": "Completed 10 quizzes", "icon": "🏆", "category": "learning", "xp_reward": 250, "condition_type": "quizzes_completed", "condition_value": 10},
    {"id": "daily_challenger", "name_ar": "المتحدي اليومي 🎮", "name_en": "Daily Challenger 🎮", "description_ar": "أكملت 7 تحديات يومية", "description_en": "Completed 7 daily challenges", "icon": "🎮", "category": "challenge", "xp_reward": 200, "condition_type": "challenges_completed", "condition_value": 7},
]


class GamificationEngine:
    """Core gamification logic — no static data, everything computed from student behavior."""

    def calculate_level(self, total_xp: int) -> Dict[str, Any]:
        for lvl in LEVELS:
            if lvl["min_xp"] <= total_xp <= lvl["max_xp"]:
                progress = (total_xp - lvl["min_xp"]) / max(lvl["max_xp"] - lvl["min_xp"], 1) * 100
                return {**lvl, "progress": round(progress, 1)}
        return {**LEVELS[-1], "progress": 100}

    def check_earned_badges(self, student_data: Dict[str, Any]) -> List[Dict]:
        earned = []
        for badge in BADGE_DEFINITIONS:
            value = student_data.get(badge["condition_type"], 0)
            if value >= badge["condition_value"]:
                earned.append({**badge, "earned_at": datetime.now().isoformat()})
        return earned

    def award_xp(
        self,
        action_type: str,
        current_xp: int = 0,
        streak_days: int = 0,
    ) -> Dict[str, Any]:
        base = XP_REWARDS.get(action_type, 0)
        bonus_mult = min(streak_days * 0.05, 0.5)  # +5% per streak day, max 50%
        bonus = int(base * bonus_mult)
        total = current_xp + base + bonus
        return {
            "base_xp": base,
            "streak_bonus": bonus,
            "xp_earned": base + bonus,
            "total_xp": total,
        }

    def generate_daily_challenges(self, student_id: str) -> List[Dict]:
        tomorrow = datetime.now() + timedelta(days=1)
        expires = tomorrow.replace(hour=0, minute=0, second=0).isoformat()
        return [
            {"id": "dc_lessons", "name_ar": "متعلم اليوم 📖", "name_en": "Today's Learner 📖", "description_ar": "أكمل 3 دروس اليوم", "description_en": "Complete 3 lessons today", "xp_reward": 100, "icon": "📖", "target": 3, "current_progress": 0, "completed": False, "expires_at": expires},
            {"id": "dc_quiz", "name_ar": "اختبر نفسك 📝", "name_en": "Test Yourself 📝", "description_ar": "حل كويز واحد على الأقل", "description_en": "Complete at least one quiz", "xp_reward": 50, "icon": "📝", "target": 1, "current_progress": 0, "completed": False, "expires_at": expires},
            {"id": "dc_flashcards", "name_ar": "تمرين يومي 🃏", "name_en": "Daily Practice 🃏", "description_ar": "راجع 10 بطاقات تعليمية", "description_en": "Review 10 flashcards", "xp_reward": 75, "icon": "🃏", "target": 10, "current_progress": 0, "completed": False, "expires_at": expires},
        ]

    def build_profile(self, student_id: str, student_data: Dict[str, Any]) -> Dict[str, Any]:
        total_xp = student_data.get("total_xp", 0)
        level = self.calculate_level(total_xp)
        earned = self.check_earned_badges(student_data)
        earned_ids = {b["id"] for b in earned}
        available = [b for b in BADGE_DEFINITIONS if b["id"] not in earned_ids]
        challenges = self.generate_daily_challenges(student_id)
        return {
            "student_id": student_id,
            "total_xp": total_xp,
            "level": level,
            "level_progress": level.get("progress", 0),
            "streak": {
                "current_streak": student_data.get("streak_days", 0),
                "longest_streak": student_data.get("longest_streak", 0),
                "last_activity_date": student_data.get("last_activity_date"),
                "bonus_multiplier": min(student_data.get("streak_days", 0) * 0.05, 0.5),
            },
            "earned_badges": earned,
            "available_badges": available,
            "daily_challenges": challenges,
        }


# Singleton
gamification_engine = GamificationEngine()
