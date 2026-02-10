"""
Agentic Action Engine — The brain of Manhaji.
Interprets student behavior in real-time and decides the next best action.

Principles:
  • "Everything is a Prompt" — No static button targets, no hardcoded paths.
  • Every action is grounded in MOETE curriculum via RAG.
  • Egyptian Tutor persona in every output string.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from enum import Enum
import logging
import json

logger = logging.getLogger(__name__)


# ────────────────────────────────────────────── Enums & Models
class ActionType(str, Enum):
    LESSON = "lesson"
    QUIZ = "quiz"
    TEACH_AI = "teach_ai"        # Student teaches the AI (metacognitive)
    REVIEW = "review"            # Targeted review of weak concepts
    GAME = "game"                # Educational game
    CHALLENGE = "challenge"      # Daily challenge
    MICRO_VIDEO = "micro_video"  # Short targeted video
    FLASHCARD = "flashcard"      # Spaced repetition review
    MISCONCEPTION_FIX = "misconception_fix"


class ActionPriority(str, Enum):
    CRITICAL = "critical"   # Misconception detected — must fix
    HIGH = "high"           # Failed quiz twice
    MEDIUM = "medium"       # Normal progression
    LOW = "low"             # Optional enrichment


class StudentAction(BaseModel):
    """The recommended next action for a student."""
    action_type: ActionType
    content_id: Optional[str] = None
    title_ar: str
    title_en: str
    description_ar: str
    description_en: str
    reason_ar: str
    reason_en: str
    priority: ActionPriority
    estimated_minutes: int = 15
    xp_reward: int = 50
    button_label_ar: str = "يلا نبدأ"
    button_label_en: str = "Let's go"
    metadata: Dict[str, Any] = {}


class StudentBehavior(BaseModel):
    """Snapshot of student's recent behavior for the engine to analyze."""
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


# ────────────────────────────────────────────── Decision Rules
class ActionEngine:
    """
    Rule-based + AI-augmented decision engine.
    Evaluates student behavior and returns the optimal next action.
    """

    def __init__(self, rag_system=None, vector_store=None):
        self.rag = rag_system
        self.vector_store = vector_store

    def decide(self, behavior: StudentBehavior) -> StudentAction:
        """
        Main decision method. Evaluates rules in priority order:
        1. Active misconception? → Fix it.
        2. Failed quiz ≥ 2 times? → Teach-the-AI session.
        3. Failed quiz once? → Targeted review.
        4. Normal progression → Next lesson or quiz.
        5. Completed unit? → Challenge / Game.
        """

        # ─── Rule 1: Misconception Fix (CRITICAL)
        if behavior.active_misconceptions:
            misconception = behavior.active_misconceptions[0]
            return StudentAction(
                action_type=ActionType.MISCONCEPTION_FIX,
                content_id=behavior.last_lesson_id,
                title_ar="🔍 خلينا نصلح المفهوم ده",
                title_en="🔍 Let's fix this concept",
                description_ar=f"رصدنا إنك ممكن تكون فاهم '{misconception}' غلط. يلا نوضحها سوا!",
                description_en=f"We noticed a potential misunderstanding about '{misconception}'. Let's clarify it!",
                reason_ar="الذكاء الاصطناعي رصد مفهوم خاطئ — لازم نصلحه الأول",
                reason_en="AI detected a misconception — must fix it first",
                priority=ActionPriority.CRITICAL,
                estimated_minutes=10,
                xp_reward=100,
                button_label_ar="يلا نصلحها 🛠️",
                button_label_en="Let's fix it 🛠️",
                metadata={"misconception": misconception},
            )

        # ─── Rule 2: Failed Quiz ≥ 2 → Teach-the-AI
        if behavior.quiz_failure_count >= 2:
            return StudentAction(
                action_type=ActionType.TEACH_AI,
                content_id=behavior.last_lesson_id,
                title_ar="🧑‍🏫 علّمني! (جلسة علّم الذكاء الاصطناعي)",
                title_en="🧑‍🏫 Teach Me! (Teach-the-AI session)",
                description_ar="بدل ما تحل كويز تاني، جرب تشرحلي الدرس أنت! ده بيثبت المعلومة.",
                description_en="Instead of another quiz, try explaining the lesson to me! This cements understanding.",
                reason_ar="الكويز صعب شوية — طريقة 'علّم الذكاء الاصطناعي' بتساعدك تفهم أعمق",
                reason_en="Quiz was tough — the 'Teach AI' method helps deeper understanding",
                priority=ActionPriority.HIGH,
                estimated_minutes=15,
                xp_reward=150,
                button_label_ar="علّمني يا بطل 🎓",
                button_label_en="Teach me, champ 🎓",
                metadata={"trigger": "quiz_failures", "failure_count": behavior.quiz_failure_count},
            )

        # ─── Rule 3: Failed Quiz Once → Targeted Review
        if behavior.last_quiz_score is not None and behavior.last_quiz_score < 60:
            return StudentAction(
                action_type=ActionType.REVIEW,
                content_id=behavior.last_lesson_id,
                title_ar="📖 مراجعة مركزة",
                title_en="📖 Focused Review",
                description_ar="عاش يا بطل! محتاج تراجع النقط دي قبل ما تكمل. برومس هتفهمها.",
                description_en="Nice try! Let's review these key points before moving on.",
                reason_ar="نتيجة الكويز محتاجة تحسين — خلينا نراجع النقط الأساسية",
                reason_en="Quiz result needs improvement — let's review the basics",
                priority=ActionPriority.HIGH,
                estimated_minutes=12,
                xp_reward=75,
                button_label_ar="يلا نراجع 📚",
                button_label_en="Let's review 📚",
                metadata={"last_score": behavior.last_quiz_score},
            )

        # ─── Rule 4: Streak bonus — Daily Challenge
        if behavior.streak_days > 0 and behavior.time_spent_today_minutes < 5:
            return StudentAction(
                action_type=ActionType.CHALLENGE,
                title_ar="🔥 تحدي اليوم",
                title_en="🔥 Daily Challenge",
                description_ar=f"سلسلتك {behavior.streak_days} أيام! يلا خلص تحدي اليوم وحافظ عليها!",
                description_en=f"Your streak is {behavior.streak_days} days! Complete today's challenge to keep it!",
                reason_ar="حافظ على سلسلة التعلم",
                reason_en="Maintain your learning streak",
                priority=ActionPriority.MEDIUM,
                estimated_minutes=10,
                xp_reward=50,
                button_label_ar="قبلت التحدي! 💪",
                button_label_en="Challenge accepted! 💪",
                metadata={"streak": behavior.streak_days},
            )

        # ─── Rule 5: Normal progression → Next lesson
        return StudentAction(
            action_type=ActionType.LESSON,
            content_id=self._get_next_lesson_id(behavior),
            title_ar="📚 تابع المنهج",
            title_en="📚 Continue Curriculum",
            description_ar="يلا نكمل الدرس الجديد. أنت ماشي تمام يا بطل!",
            description_en="Let's continue with the next lesson. You're doing great, champ!",
            reason_ar="مفيش مشاكل — استمر في التقدم",
            reason_en="No issues — keep progressing",
            priority=ActionPriority.MEDIUM,
            estimated_minutes=20,
            xp_reward=50,
            button_label_ar="يلا نتعلم 🚀",
            button_label_en="Let's learn 🚀",
        )

    def decide_multiple(self, behavior: StudentBehavior, count: int = 3) -> List[StudentAction]:
        """Return multiple action suggestions ranked by priority."""
        actions: List[StudentAction] = []

        # Primary action
        primary = self.decide(behavior)
        actions.append(primary)

        # Secondary actions (lower priority alternatives)
        if primary.action_type != ActionType.QUIZ and behavior.lessons_completed > 0:
            actions.append(StudentAction(
                action_type=ActionType.QUIZ,
                content_id=behavior.last_lesson_id,
                title_ar="📝 اختبر نفسك",
                title_en="📝 Test Yourself",
                description_ar="جرب كويز سريع على آخر درس درسته!",
                description_en="Try a quick quiz on your latest lesson!",
                reason_ar="الاختبار بيثبت المعلومة",
                reason_en="Quizzing reinforces learning",
                priority=ActionPriority.LOW,
                estimated_minutes=10,
                xp_reward=75,
                button_label_ar="يلا نختبر 📝",
                button_label_en="Let's quiz 📝",
            ))

        if primary.action_type != ActionType.FLASHCARD:
            actions.append(StudentAction(
                action_type=ActionType.FLASHCARD,
                title_ar="🃏 بطاقات المراجعة",
                title_en="🃏 Flashcard Review",
                description_ar="راجع بطاقاتك التعليمية — المراجعة المتكررة هي سر الحفظ!",
                description_en="Review your flashcards — spaced repetition is the key to retention!",
                reason_ar="المراجعة المتكررة مهمة",
                reason_en="Spaced repetition matters",
                priority=ActionPriority.LOW,
                estimated_minutes=8,
                xp_reward=30,
                button_label_ar="راجع البطاقات 🃏",
                button_label_en="Review cards 🃏",
            ))

        return actions[:count]

    def get_dynamic_button(self, behavior: StudentBehavior) -> Dict[str, Any]:
        """Return dynamic button config for the 'Plan' / main CTA button."""
        action = self.decide(behavior)
        return {
            "label_ar": action.button_label_ar,
            "label_en": action.button_label_en,
            "action_type": action.action_type.value,
            "content_id": action.content_id,
            "tooltip_ar": action.reason_ar,
            "tooltip_en": action.reason_en,
            "priority": action.priority.value,
            "xp_reward": action.xp_reward,
        }

    # ─── AI-augmented decision (uses Gemini)
    async def decide_with_ai(self, behavior: StudentBehavior) -> StudentAction:
        """Enhance decision with Gemini reasoning (for complex cases)."""
        if not self.rag:
            return self.decide(behavior)

        # Get curriculum context for the student's current position
        context = ""
        if self.vector_store and behavior.last_lesson_subject:
            context, _ = self.vector_store.retrieve(
                query=behavior.last_lesson_subject or "next lesson",
                grade=behavior.grade,
            )

        path = self.rag.get_learning_path(
            student_data={
                "last_lesson": behavior.last_lesson_id,
                "last_quiz_score": behavior.last_quiz_score,
                "quiz_failures": behavior.quiz_failure_count,
                "active_misconceptions": behavior.active_misconceptions,
            },
            available_content=[],
        )

        # Map AI response to StudentAction
        action_type = ActionType.LESSON
        try:
            action_type = ActionType(path.get("action_type", "lesson"))
        except ValueError:
            pass

        return StudentAction(
            action_type=action_type,
            content_id=path.get("content_id"),
            title_ar=path.get("reason_ar", "الخطوة التالية"),
            title_en=path.get("reason_en", "Next Step"),
            description_ar=path.get("reason_ar", ""),
            description_en=path.get("reason_en", ""),
            reason_ar=path.get("reason_ar", ""),
            reason_en=path.get("reason_en", ""),
            priority=ActionPriority.MEDIUM,
            estimated_minutes=path.get("estimated_duration_minutes", 15),
            xp_reward=50,
        )

    # ─── Helpers
    @staticmethod
    def _get_next_lesson_id(behavior: StudentBehavior) -> Optional[str]:
        """Simple logic to determine next lesson ID from current position."""
        if not behavior.last_lesson_id:
            return "l1"
        # Increment lesson number
        try:
            prefix = ""
            num_part = behavior.last_lesson_id
            if "_" in behavior.last_lesson_id:
                parts = behavior.last_lesson_id.rsplit("_", 1)
                prefix = parts[0] + "_"
                num_part = parts[1]
            num = int(num_part.replace("l", ""))
            return f"{prefix}l{num + 1}"
        except (ValueError, IndexError):
            return None
