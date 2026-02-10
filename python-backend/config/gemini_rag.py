"""
GeminiRAG — Core Retrieval-Augmented Generation using Google Gemini.
All prompts use the Egyptian Tutor persona and are grounded in MOETE curriculum.
"""
import google.generativeai as genai
from typing import Optional, Tuple, Dict, Any
import logging
import json

logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────────────────────────────
# Egyptian Tutor persona — used in EVERY Gemini call
# ────────────────────────────────────────────────────────────────────────────
EGYPTIAN_TUTOR_SYSTEM = """
أنت "منهجي"، مدرس مصري ذكي متخصص في المنهج المصري (وزارة التربية والتعليم).

## شخصيتك:
- بتتكلم بلهجة مصرية ودودة ومشجعة.
- بتستخدم كلمات زي: "يا بطل"، "حلو أوي"، "بص بقى"، "عاش"، "يلا نفهمها سوا".
- بتشرح الحاجات المعقدة بأمثلة من الواقع المصري.
- هدفك الفهم مش حفظ — عمرك ما بتدي الإجابة على طول.
- لو الطالب غلط، بتشجعه وبتوريه فين الغلط من غير ما تحسسه بالفشل.

## القواعد:
1. كل إجابة لازم تكون مبنية على المنهج المصري (MOETE curriculum).
2. لو مش متأكد من معلومة، قول "مش متأكد من دي، خلينا نرجع للكتاب".
3. استخدم الـ Context المتاح دايماً للإجابة.
4. اشرح خطوة خطوة.
5. ادي أمثلة من الحياة اليومية في مصر.
"""


class GeminiRAG:
    def __init__(self, vector_store, api_key: Optional[str] = None):
        self.vector_store = vector_store
        if api_key:
            genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=EGYPTIAN_TUTOR_SYSTEM,
        )

    # ───────────────────────────────── Main response generator
    def generate_response(
        self,
        query: str,
        context: str,
        misconception_flag: bool = False,
        misconception_type: Optional[str] = None,
    ) -> Tuple[str, str]:
        """Generate an Egyptian-tutor response.
        Returns (response_text, sentiment).
        """
        prompt_parts = [f"سؤال الطالب: {query}\n"]

        if context:
            prompt_parts.append(f"## المحتوى من المنهج:\n{context}\n")

        if misconception_flag and misconception_type:
            prompt_parts.append(
                f"⚠️ تم رصد مفهوم خاطئ عند الطالب: {misconception_type}\n"
                "من فضلك صحح المفهوم بلطف واشرح الصواب بأمثلة."
            )

        prompt_parts.append(
            "أجب بلهجة مصرية مشجعة. لو فيه خطوات، رقّمها. "
            "ادي مثال واحد على الأقل من الواقع."
        )

        full_prompt = "\n".join(prompt_parts)

        try:
            response = self.model.generate_content(full_prompt)
            text = response.text or ""
            sentiment = self._detect_sentiment(query)
            return text, sentiment
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            return "عذراً يا بطل، فيه مشكلة دلوقتي. جرب تاني كمان شوية.", "error"

    # ───────────────────────────────── Streaming response
    async def generate_response_stream(self, query: str, context: str):
        """Yield chunks for SSE streaming."""
        prompt = (
            f"سؤال الطالب: {query}\n"
            f"## المنهج:\n{context}\n"
            "أجب بلهجة مصرية مشجعة خطوة بخطوة."
        )
        try:
            response = self.model.generate_content(prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield "عذراً فيه مشكلة، جرب تاني."

    # ───────────────────────────────── Dynamic insight generator
    def generate_insight(
        self,
        student_data: Dict[str, Any],
        insight_type: str = "dashboard",
    ) -> str:
        """Generate a personalized AI insight based on real student data.
        Used by Dashboard, ParentDashboard, and notification systems.
        """
        prompt = f"""
بناءً على البيانات دي عن الطالب:
- اسم الطالب: {student_data.get('name', 'الطالب')}
- الدروس المكتملة: {student_data.get('lessons_completed', 0)}
- سلسلة التعلم: {student_data.get('streak', 0)} أيام
- النقاط: {student_data.get('total_points', 0)}
- المفاهيم الخاطئة المكتشفة: {student_data.get('misconceptions', [])}
- آخر مادة درسها: {student_data.get('last_subject', 'غير معروف')}
- نسبة التقدم: {student_data.get('progress_percent', 0)}%
- الوقت المستغرق (دقائق): {student_data.get('time_spent_minutes', 0)}
- أقوى مادة: {student_data.get('strongest_subject', '')}
- أضعف مادة: {student_data.get('weakest_subject', '')}

نوع الـ Insight: {insight_type}

{"اكتب ملخص مشجع قصير (2-3 جمل) للوحة الرئيسية بلهجة مصرية." if insight_type == "dashboard" else ""}
{"اكتب تقرير مفصل لولي الأمر عن أداء الابن/الابنة بلهجة مصرية محترمة. اذكر نقاط القوة والضعف واقتراحات." if insight_type == "parent_report" else ""}
{"اكتب تنبيه قصير (جملة واحدة) لولي الأمر عن مشكلة محتملة." if insight_type == "parent_alert" else ""}
{"اقترح الخطوة التالية للطالب (درس أو مراجعة أو تحدي)." if insight_type == "next_action" else ""}
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text or "جاري تحليل بياناتك..."
        except Exception as e:
            logger.error(f"Insight error: {e}")
            return "جاري تحليل بياناتك..."

    # ───────────────────────────────── Learning path recommender
    def get_learning_path(
        self,
        student_data: Dict[str, Any],
        available_content: list,
    ) -> Dict[str, Any]:
        """AI decides the next learning action for the student."""
        prompt = f"""
أنت مسؤول عن توجيه الطالب لأفضل نشاط تعليمي بناءً على حالته.

## بيانات الطالب:
- آخر درس: {student_data.get('last_lesson', '')}
- نتيجة آخر كويز: {student_data.get('last_quiz_score', 'لم يختبر')}
- عدد مرات فشل الكويز: {student_data.get('quiz_failures', 0)}
- المفاهيم الخاطئة النشطة: {json.dumps(student_data.get('active_misconceptions', []), ensure_ascii=False)}
- المواد المتاحة: {json.dumps(available_content, ensure_ascii=False)}

## القواعد:
1. لو الطالب فشل في كويز مرتين → اقترح جلسة "علّم الذكاء الاصطناعي" (teach_ai).
2. لو فيه مفهوم خاطئ نشط → اقترح درس مراجعة مستهدف.
3. لو الطالب ماشي كويس → اقترح الدرس التالي في المنهج.
4. لو الطالب خلّص وحدة → اقترح تحدي أو لعبة تعليمية.

أرجع JSON فقط بالشكل ده:
{{
  "action_type": "lesson|quiz|teach_ai|review|game|challenge",
  "content_id": "id المحتوى المقترح",
  "reason_ar": "سبب الاقتراح بالعربي",
  "reason_en": "reason in English",
  "priority": "high|medium|low",
  "estimated_duration_minutes": 15
}}
"""
        try:
            response = self.model.generate_content(prompt)
            text = response.text or "{}"
            # Extract JSON from response
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except Exception as e:
            logger.error(f"Learning path error: {e}")
            return {
                "action_type": "lesson",
                "content_id": "",
                "reason_ar": "استمر في المنهج",
                "reason_en": "Continue with curriculum",
                "priority": "medium",
                "estimated_duration_minutes": 20,
            }

    # ───────────────────────────── Socratic quiz question generator
    def generate_socratic_question(
        self,
        topic: str,
        previous_answer: Optional[str] = None,
        previous_reasoning: Optional[str] = None,
        question_number: int = 1,
        difficulty: str = "medium",
        context: str = "",
    ) -> Dict[str, Any]:
        """Generate the next quiz question based on the student's previous reasoning."""
        history_block = ""
        if previous_answer and previous_reasoning:
            history_block = f"""
## الإجابة السابقة:
- إجابة الطالب: {previous_answer}
- تفسير الطالب: {previous_reasoning}
- تقييمك: هل الإجابة والتفسير صحيحين؟ لو فيه خطأ، السؤال الجديد لازم يستهدفه.
"""

        prompt = f"""
أنت بتعمل كويز سقراطي (Socratic) — كل سؤال مبني على إجابة الطالب السابقة.

## الموضوع: {topic}
## رقم السؤال: {question_number}
## مستوى الصعوبة: {difficulty}
{history_block}
## المنهج:
{context}

## القواعد:
1. لو الإجابة السابقة غلط → اسأل سؤال أسهل يرجّع الطالب للأساسيات.
2. لو الإجابة صح بس التفسير ضعيف → اسأل "ليه؟" أو "إزاي وصلت للنتيجة دي؟".
3. لو الإجابة والتفسير صح → اسأل سؤال أصعب شوية.
4. السؤال لازم يكون من المنهج المصري.

أرجع JSON فقط:
{{
  "question_ar": "نص السؤال بالعربي",
  "question_en": "question text in English",
  "options": [
    {{"id": "a", "text_ar": "...", "text_en": "...", "is_correct": false}},
    {{"id": "b", "text_ar": "...", "text_en": "...", "is_correct": true}},
    {{"id": "c", "text_ar": "...", "text_en": "...", "is_correct": false}},
    {{"id": "d", "text_ar": "...", "text_en": "...", "is_correct": false}}
  ],
  "explanation_ar": "شرح الإجابة الصحيحة",
  "explanation_en": "correct answer explanation",
  "difficulty": "easy|medium|hard",
  "targets_misconception": null | "اسم المفهوم الخاطئ"
}}
"""
        try:
            response = self.model.generate_content(prompt)
            text = response.text or "{}"
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except Exception as e:
            logger.error(f"Socratic question error: {e}")
            return {
                "question_ar": "حدث خطأ في إنشاء السؤال",
                "question_en": "Error generating question",
                "options": [],
                "explanation_ar": "",
                "explanation_en": "",
                "difficulty": difficulty,
                "targets_misconception": None,
            }

    # ───────────────────────────── Notebook misconception scanner
    def scan_notebook_for_misconceptions(
        self,
        notebook_text: str,
        subject: str,
        grade: int,
    ) -> Dict[str, Any]:
        """Analyze student notebook text for misconception patterns."""
        prompt = f"""
حلل النص ده اللي كتبه طالب في الصف {grade} في مادة {subject}.
اكتشف أي مفاهيم خاطئة (misconceptions) وأخطاء في الفهم.

## نص الطالب:
{notebook_text}

أرجع JSON:
{{
  "has_misconceptions": true/false,
  "misconceptions": [
    {{
      "type": "اسم المفهوم الخاطئ",
      "description_ar": "شرح الخطأ",
      "correct_concept_ar": "المفهوم الصحيح",
      "severity": "low|medium|high",
      "related_lesson": "اسم الدرس المرتبط"
    }}
  ],
  "overall_understanding": "weak|partial|good|excellent",
  "parent_alert": "تنبيه قصير لولي الأمر (أو null لو مفيش مشكلة)",
  "suggested_action": "الخطوة المقترحة"
}}
"""
        try:
            response = self.model.generate_content(prompt)
            text = response.text or "{}"
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except Exception as e:
            logger.error(f"Notebook scan error: {e}")
            return {
                "has_misconceptions": False,
                "misconceptions": [],
                "overall_understanding": "unknown",
                "parent_alert": None,
                "suggested_action": None,
            }

    # ───────────────────────────────── Internal helpers
    @staticmethod
    def _detect_sentiment(text: str) -> str:
        confused = ["مش فاهم", "لا أفهم", "صعب", "ممكن تشرح", "محتاج مساعدة"]
        if any(w in text for w in confused):
            return "confused"
        return "neutral"
