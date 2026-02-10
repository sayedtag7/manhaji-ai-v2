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
أنت "كوتش منهجي"، مخطط دراسي ذكي للطلاب المصريين. شخصيتك زي المدرب المصري اللي بيشجع وبيدفع للأمام.

## مهمتك:
- بتعمل خطط دراسية شخصية بناءً على أداء الطالب ونقاط ضعفه.
- كل خطوة في الخطة لازم تكون من المنهج المصري (MOETE).
- بتوزن بين: التعلم → التمرين → المراجعة → التحسين.
- **قاعدة التوازن**: لو الطالب متفوق في مادة، خليه يحافظ عليها بس ركز على المواد الضعيفة.

## قواعد الـ XP:
- درس جديد: 50 XP
- كويز ناجح: 75 XP  
- كويز 100%: 150 XP
- مراجعة بطاقات: 30 XP
- إصلاح مفهوم خاطئ: 100 XP
- تحدي يومي: 50 XP
- تحدي "Fix-the-mistake": 80 XP

## استراتيجية التوازن الأكاديمي:
- لو الطالب قوي في مادة: 1 مهمة صيانة (مراجعة أو كويز خفيف)
- لو الطالب ضعيف في مادة: 2-3 مهام مركزة (درس + تمرين + كويز)
- لو فيه مفاهيم خاطئة: أولوية قصوى — أول مهمة دايماً هتكون إصلاحها

## أنواع المهام المطلوبة:
1. **lesson**: درس تعليمي جديد
2. **quiz**: اختبار تقييمي
3. **review**: مراجعة سريعة
4. **flashcard**: بطاقات تعليمية
5. **fix-mistake**: تحدي لإصلاح مفهوم خاطئ (النوع ده أولوية)
6. **game**: لعبة تعليمية
7. **challenge**: تحدي يومي ممتع

## لهجتك: 
- مصرية مشجعة ودافئة زي: "عاش يا بطل"، "بص بقى"، "يلا نفهمها سوا"، "ماشي يا نجم"
- متستخدمش اللهجة الفصحى الجامدة، استخدم العامية المصرية الطبيعية
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
        """
        Generate a personalized daily study plan using Gemini.
        Implements the "Egyptian Coach" strategy:
        - Prioritizes misconception fixes
        - Balances subjects (maintain strong, focus on weak)
        - Creates understanding-focused tasks
        """
        
        # Extract student performance metrics
        grade = student_data.get('grade', 7)
        lessons_completed = student_data.get('lessons_completed', 0)
        last_lesson = student_data.get('last_lesson', 'لم يبدأ')
        last_quiz_score = student_data.get('last_quiz_score', 'لم يختبر')
        misconceptions = student_data.get('misconceptions', [])
        streak = student_data.get('streak', 0)
        strongest_subject = student_data.get('strongest_subject', '')
        weakest_subject = student_data.get('weakest_subject', '')
        
        # Build intelligent insights for the AI
        performance_insight = ""
        if strongest_subject and weakest_subject:
            performance_insight = f"""
💡 **ملاحظة مهمة**: الطالب ده متفوق في {strongest_subject}، لكن محتاج دعم في {weakest_subject}.
استراتيجية الخطة:
- {strongest_subject}: 1 مهمة صيانة فقط (مراجعة سريعة)
- {weakest_subject}: 2-3 مهام مركزة لتقوية الأساسيات
"""
        
        misconception_priority = ""
        if misconceptions:
            misconception_priority = f"""
⚠️ **أولوية قصوى**: الطالب عنده {len(misconceptions)} مفاهيم خاطئة لازم تتصلح!
المفاهيم الخاطئة: {json.dumps(misconceptions, ensure_ascii=False)}
🎯 أول مهمة في الخطة لازم تكون: "fix-mistake" challenge
"""
        
        prompt = f"""
اعمل خطة دراسية يومية للطالب ده باستخدام استراتيجية "الكوتش المصري":

## 📊 بيانات الطالب:
- الصف الدراسي: الصف {grade}
- الدروس المكتملة: {lessons_completed} درس
- آخر درس: {last_lesson}
- نتيجة آخر كويز: {last_quiz_score}
- سلسلة التعلم: {streak} يوم متواصل 🔥
- أقوى مادة: {strongest_subject or 'لا توجد بيانات'}
- أضعف مادة: {weakest_subject or 'لا توجد بيانات'}
- عدد المفاهيم الخاطئة: {len(misconceptions)}

{performance_insight}

{misconception_priority}

## 📝 المطلوب منك:
أرجع JSON بالشكل الدقيق ده (مهم جداً تلتزم بالهيكل):

{{
  "greeting_ar": "تحية مصرية مشجعة وحماسية (استخدم: يا بطل، عاش، يلا بينا)",
  "greeting_en": "Encouraging Egyptian-style greeting",
  "insight_ar": "ملاحظة ذكية عن أداء الطالب وتوازن المواد (2-3 جمل)",
  "insight_en": "Smart observation about student performance balance",
  "tasks": [
    {{
      "id": "task_1",
      "title_ar": "عنوان المهمة بالعربية",
      "title_en": "Task title in English",
      "description_ar": "وصف واضح ومحدد للمهمة",
      "task_type": "lesson|quiz|review|flashcard|fix-mistake|game|challenge",
      "subject": "science|math|arabic|physics|chemistry",
      "duration_minutes": 15,
      "xp_reward": 50,
      "priority": "high|medium|low",
      "is_misconception_fix": false,
      "misconception_id": null
    }}
  ],
  "motivation_ar": "جملة تحفيزية ختامية مصرية (استخدم: انت قدها، استمر، فخور بيك)",
  "motivation_en": "Closing motivational quote"
}}

## ⚠️ قواعد إنشاء المهام (مهمة جداً):

1. **لو فيه مفاهيم خاطئة** (misconceptions):
   - أول مهمة لازم تكون: task_type = "fix-mistake"
   - is_misconception_fix = true
   - misconception_id = "misconception_1"
   - priority = "high"
   - xp_reward = 100

2. **التوازن الأكاديمي**:
   - المادة القوية ({strongest_subject}): مهمة واحدة بس من نوع "review" أو "flashcard"
   - المادة الضعيفة ({weakest_subject}): 2-3 مهام من أنواع "lesson" + "quiz" + "fix-mistake"

3. **التنويع**:
   - لا تكرر نفس task_type مرتين متتاليتين
   - نوّع بين: lesson → quiz → review → challenge
   - كل مهمة لازم تكون محددة وواقعية

4. **عدد المهام**:
   - لا تزيد عن 5 مهام يومياً
   - لا تقل عن 3 مهام

5. **مدة المهام**:
   - lesson: 15-25 دقيقة
   - quiz: 10-15 دقيقة
   - review: 5-10 دقائق
   - fix-mistake: 15-20 دقيقة
   - flashcard: 5-8 دقائق

6. **اللهجة**:
   - استخدم العامية المصرية الطبيعية
   - تجنب الفصحى الجامدة
   - كن مشجع ومحفز

أرجع JSON فقط، بدون أي نص إضافي.
"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text or "{}"
            
            # Clean the response (remove markdown code blocks if present)
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]

            data = json.loads(text.strip())

            # Validate and parse tasks
            tasks = []
            for t in data.get("tasks", []):
                try:
                    task = StudyTask(**t)
                    tasks.append(task)
                except Exception as e:
                    logger.warning(f"Invalid task in AI response: {e}")
                    continue

            # If no valid tasks, use fallback
            if not tasks:
                logger.warning("No valid tasks generated, using fallback")
                return self._fallback_plan(student_id, student_data)

            return StudyPlan(
                student_id=student_id,
                date=datetime.now().strftime("%Y-%m-%d"),
                greeting_ar=data.get("greeting_ar", "يا بطل! يلا نبدأ يومنا 💪"),
                greeting_en=data.get("greeting_en", "Hey champ! Let's start our day 💪"),
                insight_ar=data.get("insight_ar", ""),
                insight_en=data.get("insight_en", ""),
                tasks=tasks,
                motivation_ar=data.get("motivation_ar", "استمر يا بطل — انت قدها! 🌟"),
                motivation_en=data.get("motivation_en", "Keep going champ — you got this! 🌟"),
            )

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error in study plan: {e}")
            logger.error(f"Raw response: {text[:500]}")
            return self._fallback_plan(student_id, student_data)
        except Exception as e:
            logger.error(f"Study plan generation error: {e}")
            return self._fallback_plan(student_id, student_data)

    def _fallback_plan(self, student_id: str, student_data: Dict[str, Any] = None) -> StudyPlan:
        """
        Return an intelligent default plan if AI generation fails.
        Uses student_data to create a balanced plan.
        """
        student_data = student_data or {}
        weakest_subject = student_data.get('weakest_subject', 'science')
        strongest_subject = student_data.get('strongest_subject', 'math')
        misconceptions = student_data.get('misconceptions', [])
        
        tasks = []
        
        # Priority 1: Fix misconceptions if any exist
        if misconceptions:
            tasks.append(
                StudyTask(
                    id="task_misconception",
                    title_ar="🔧 صلّح المفهوم الخاطئ",
                    title_en="🔧 Fix the Misconception",
                    description_ar=f"ركز على إصلاح المفهوم: {misconceptions[0] if misconceptions else 'مفهوم خاطئ'}",
                    task_type="fix-mistake",
                    subject=weakest_subject,
                    duration_minutes=20,
                    xp_reward=100,
                    priority="high",
                    is_misconception_fix=True,
                    misconception_id="misconception_1",
                )
            )
        
        # Priority 2: Focus on weak subject with a lesson
        tasks.append(
            StudyTask(
                id="task_weak_lesson",
                title_ar=f"📚 درس جديد في {weakest_subject}",
                title_en=f"📚 New lesson in {weakest_subject}",
                description_ar=f"كمّل الدرس التالي في مادة {weakest_subject}",
                task_type="lesson",
                subject=weakest_subject,
                duration_minutes=20,
                xp_reward=50,
                priority="high",
            )
        )
        
        # Priority 3: Practice quiz for weak subject
        tasks.append(
            StudyTask(
                id="task_weak_quiz",
                title_ar=f"📝 اختبر نفسك في {weakest_subject}",
                title_en=f"📝 Test yourself in {weakest_subject}",
                description_ar=f"حل كويز سريع على آخر درس في {weakest_subject}",
                task_type="quiz",
                subject=weakest_subject,
                duration_minutes=10,
                xp_reward=75,
                priority="medium",
            )
        )
        
        # Priority 4: Maintenance for strong subject (light review)
        tasks.append(
            StudyTask(
                id="task_strong_review",
                title_ar=f"🃏 مراجعة سريعة في {strongest_subject}",
                title_en=f"🃏 Quick review in {strongest_subject}",
                description_ar=f"حافظ على مستواك الممتاز — راجع 10 بطاقات في {strongest_subject}",
                task_type="flashcard",
                subject=strongest_subject,
                duration_minutes=8,
                xp_reward=30,
                priority="low",
            )
        )
        
        # Priority 5: Daily challenge
        tasks.append(
            StudyTask(
                id="task_challenge",
                title_ar="🎯 تحدي اليوم",
                title_en="🎯 Daily Challenge",
                description_ar="تحدي ممتع لكسب نقاط إضافية",
                task_type="challenge",
                subject=weakest_subject,
                duration_minutes=15,
                xp_reward=50,
                priority="medium",
            )
        )
        
        return StudyPlan(
            student_id=student_id,
            date=datetime.now().strftime("%Y-%m-%d"),
            greeting_ar="عاش يا بطل! يلا نبدأ يومنا بنشاط 💪",
            greeting_en="Hey champ! Let's start our day energized 💪",
            insight_ar=f"لاحظت إنك قوي في {strongest_subject} — ده ممتاز! بس خلينا نركز شوية على {weakest_subject} علشان نوازن المستوى.",
            insight_en=f"I noticed you're strong in {strongest_subject} — that's great! But let's focus a bit on {weakest_subject} to balance your performance.",
            tasks=tasks,
            motivation_ar="كل يوم بتقرب أكتر من النجاح — استمر يا نجم! 🌟",
            motivation_en="Every day brings you closer to success — keep going, star! 🌟",
        )

    def get_sample_plan(self) -> StudyPlan:
        """Return a demo plan for testing."""
        sample_data = {
            'grade': 7,
            'strongest_subject': 'science',
            'weakest_subject': 'arabic',
            'misconceptions': ['علامات الإعراب في الجملة الاسمية'],
            'streak': 5,
        }
        return self._fallback_plan("demo_student", sample_data)
    
    def get_realistic_example_plan(self, student_id: str = "test_student") -> StudyPlan:
        """
        Generate a realistic example plan matching the user's scenario:
        - Excellent in Science
        - Low engagement in Arabic
        - Has misconceptions
        """
        example_data = {
            'grade': 8,
            'lessons_completed': 45,
            'last_lesson': 'تركيب الخلية',
            'last_quiz_score': 95,
            'misconceptions': [
                'الفرق بين الفعل المبني والمعرب',
                'استخدام حروف الجر بشكل صحيح'
            ],
            'streak': 12,
            'strongest_subject': 'science',
            'weakest_subject': 'arabic',
        }
        
        # Try to generate a real plan with the AI
        try:
            return self.generate_plan(student_id, example_data)
        except Exception as e:
            logger.warning(f"Could not generate realistic plan with AI: {e}")
            return self._fallback_plan(student_id, example_data)
