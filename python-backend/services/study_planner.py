"""
StudyPlanGenerator — AI-driven study plan that adapts to student behavior.
Uses Egyptian Coach persona. Every plan is grounded in MOETE curriculum.
"""
import google.generativeai as genai
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)

STUDY_PLAN_SYSTEM = """
أنت "كوتش منهجي"، مخطط دراسي ذكي للطلاب المصريين.

## مهمتك:
- بتعمل خطط دراسية شخصية بناءً على أداء الطالب ونقاط ضعفه.
- كل خطوة في الخطة لازم تكون من المنهج المصري (MOETE).
- بتوزن بين: التعلم → التمرين → المراجعة → التحسين.

## قواعد الـ XP:
- درس جديد: 50 XP
- كويز ناجح: 75 XP  
- كويز 100%: 150 XP
- مراجعة بطاقات: 30 XP
- إصلاح مفهوم خاطئ: 100 XP
- تحدي يومي: 50 XP

## لهجتك: مصرية مشجعة ودافئة.
"""


class StudyTask(BaseModel):
    id: str
    title_ar: str
    title_en: str
    description_ar: str
    task_type: str  # lesson, quiz, review, game, challenge, flashcard
    subject: str
    duration_minutes: int
    xp_reward: int
    priority: str  # high, medium, low
    is_misconception_fix: bool = False
    misconception_id: Optional[str] = None


class StudyPlan(BaseModel):
    student_id: str
    date: str
    greeting_ar: str
    greeting_en: str
    insight_ar: str
    insight_en: str
    tasks: List[StudyTask]
    motivation_ar: str
    motivation_en: str


class StudyPlanGenerator:
    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=STUDY_PLAN_SYSTEM,
        )

    def generate_plan(
        self,
        student_id: str,
        student_data: Dict[str, Any],
    ) -> StudyPlan:
        """Generate a personalized daily study plan using Gemini."""
        prompt = f"""
اعمل خطة دراسية يومية للطالب ده:

## بيانات الطالب:
- الصف: {student_data.get('grade', 7)}
- الدروس المكتملة: {student_data.get('lessons_completed', 0)}
- آخر درس: {student_data.get('last_lesson', 'لم يبدأ')}
- نتيجة آخر كويز: {student_data.get('last_quiz_score', 'لم يختبر')}
- المفاهيم الخاطئة: {json.dumps(student_data.get('misconceptions', []), ensure_ascii=False)}
- سلسلة التعلم: {student_data.get('streak', 0)} أيام
- أقوى مادة: {student_data.get('strongest_subject', '')}
- أضعف مادة: {student_data.get('weakest_subject', '')}

أرجع JSON بالشكل ده:
{{
  "greeting_ar": "تحية مصرية مشجعة",
  "greeting_en": "encouraging greeting",
  "insight_ar": "ملاحظة ذكية عن أداء الطالب",
  "insight_en": "AI insight about performance",
  "tasks": [
    {{
      "id": "task_1",
      "title_ar": "عنوان المهمة",
      "title_en": "task title",
      "description_ar": "وصف قصير",
      "task_type": "lesson|quiz|review|game|challenge|flashcard",
      "subject": "science|math|arabic",
      "duration_minutes": 15,
      "xp_reward": 50,
      "priority": "high|medium|low",
      "is_misconception_fix": false,
      "misconception_id": null
    }}
  ],
  "motivation_ar": "جملة تحفيزية ختامية",
  "motivation_en": "closing motivational quote"
}}

القواعد:
1. لو فيه مفاهيم خاطئة → أول مهمة لازم تكون إصلاحها.
2. لا تزيد عن 5 مهام يومياً.
3. نوّع بين أنواع المهام (درس + كويز + مراجعة).
4. كل مهمة لازم تكون محددة وواقعية.
"""
        try:
            response = self.model.generate_content(prompt)
            text = response.text or "{}"
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]

            data = json.loads(text.strip())

            tasks = [StudyTask(**t) for t in data.get("tasks", [])]

            return StudyPlan(
                student_id=student_id,
                date=datetime.now().strftime("%Y-%m-%d"),
                greeting_ar=data.get("greeting_ar", "يا بطل!"),
                greeting_en=data.get("greeting_en", "Hey champ!"),
                insight_ar=data.get("insight_ar", ""),
                insight_en=data.get("insight_en", ""),
                tasks=tasks,
                motivation_ar=data.get("motivation_ar", "استمر يا بطل!"),
                motivation_en=data.get("motivation_en", "Keep going, champ!"),
            )

        except Exception as e:
            logger.error(f"Study plan generation error: {e}")
            return self._fallback_plan(student_id)

    def _fallback_plan(self, student_id: str) -> StudyPlan:
        """Return a sensible default plan if AI generation fails."""
        return StudyPlan(
            student_id=student_id,
            date=datetime.now().strftime("%Y-%m-%d"),
            greeting_ar="يا بطل! يلا نبدأ يومنا 💪",
            greeting_en="Hey champ! Let's start our day 💪",
            insight_ar="استمر في التعلم كل يوم — الثبات هو مفتاح النجاح!",
            insight_en="Keep learning every day — consistency is the key to success!",
            tasks=[
                StudyTask(
                    id="task_1",
                    title_ar="📚 تابع الدرس الجديد",
                    title_en="📚 Continue next lesson",
                    description_ar="كمّل الدرس التالي في المنهج",
                    task_type="lesson",
                    subject="science",
                    duration_minutes=20,
                    xp_reward=50,
                    priority="high",
                ),
                StudyTask(
                    id="task_2",
                    title_ar="📝 اختبر نفسك",
                    title_en="📝 Test yourself",
                    description_ar="حل كويز سريع على آخر درس",
                    task_type="quiz",
                    subject="science",
                    duration_minutes=10,
                    xp_reward=75,
                    priority="medium",
                ),
                StudyTask(
                    id="task_3",
                    title_ar="🃏 مراجعة البطاقات",
                    title_en="🃏 Flashcard review",
                    description_ar="راجع 10 بطاقات تعليمية",
                    task_type="flashcard",
                    subject="science",
                    duration_minutes=8,
                    xp_reward=30,
                    priority="low",
                ),
            ],
            motivation_ar="كل يوم بتقرب أكتر من هدفك! 🌟",
            motivation_en="Every day brings you closer to your goal! 🌟",
        )

    def get_sample_plan(self) -> StudyPlan:
        """Return a demo plan for testing."""
        return self._fallback_plan("demo_student")
