"""
VisualSpecGenerator — AI-powered visual/diagram specification generator.
Uses Gemini to generate React Flow JSON with exam priority highlighting.
Falls back to template-based generation if Gemini is unavailable.

Output format: React Flow compatible JSON with nodes + edges.
Exam priority topics highlighted with Gold (#F9A825).
"""
from typing import Optional, Dict, Any, List
import logging
import json

logger = logging.getLogger(__name__)


class VisualSpecGenerator:
    """Generates AI-powered diagram specs for educational content."""

    VISUAL_TEMPLATES = {
        "comparison": {"type": "comparison_table", "layout": "two_column"},
        "process": {"type": "flow_diagram", "layout": "vertical_flow"},
        "hierarchy": {"type": "tree_diagram", "layout": "top_down"},
        "cycle": {"type": "cycle_diagram", "layout": "circular"},
        "mindmap": {"type": "mind_map", "layout": "radial"},
    }

    TRIGGER_KEYWORDS = {
        "comparison": ["مقارنة", "الفرق", "compare", "difference", "vs"],
        "process": ["خطوات", "مراحل", "عملية", "steps", "process", "how"],
        "hierarchy": ["تصنيف", "أنواع", "classify", "types", "categories"],
        "cycle": ["دورة", "تحول", "cycle", "transform", "حلقة"],
        "mindmap": ["خريطة", "ذهنية", "mindmap", "mind map", "تلخيص", "ملخص"],
    }

    # Exam priority topics — highlighted with Gold (#F9A825) per PRD
    EXAM_PRIORITY_TOPICS = [
        "تحولات الطاقة", "قانون بقاء الطاقة", "حالات المادة",
        "المعادلات الخطية", "الأعداد النسبية", "الكسور",
        "القوى والحركة", "الصوت والضوء", "التفاعلات الكيميائية",
        "الهندسة", "المثلثات", "النسبة والتناسب",
    ]

    def __init__(self, rag_system=None):
        self.rag = rag_system

    def generate(
        self,
        topic: str,
        context: str = "",
        lesson_id: Optional[str] = None,
        chat_context: str = "",
    ) -> Dict[str, Any]:
        """Generate a visual specification.
        If RAG/Gemini is available, generate AI-powered React Flow JSON.
        Otherwise, fall back to template-based generation.
        """
        visual_type = self._detect_type(topic)

        # Try AI-powered generation first
        if self.rag:
            try:
                return self._generate_with_ai(topic, context, chat_context, visual_type, lesson_id)
            except Exception as e:
                logger.error(f"AI visual gen failed: {e}")

        # Fallback to template
        template = self.VISUAL_TEMPLATES.get(visual_type, self.VISUAL_TEMPLATES["process"])
        return {
            "type": template["type"],
            "layout": template["layout"],
            "topic": topic,
            "lesson_id": lesson_id,
            "is_exam_priority": self._is_exam_priority(topic),
            "data": {
                "title": topic,
                "context_summary": context[:200] if context else "",
            },
        }

    def _generate_with_ai(
        self, topic: str, context: str, chat_context: str,
        visual_type: str, lesson_id: Optional[str],
    ) -> Dict[str, Any]:
        """Use Gemini to generate React Flow compatible node/edge JSON."""
        is_priority = self._is_exam_priority(topic)
        priority_instruction = ""
        if is_priority:
            priority_instruction = (
                "\n⚠️ هذا الموضوع من أولويات الامتحان! "
                "لوّن العقدة الرئيسية بالذهبي (#F9A825) وأضف badge: '⭐ أولوية امتحان'"
            )

        prompt = f"""
أنت بتعمل خريطة ذهنية / رسم بياني تعليمي عن الموضوع ده.
الطالب محتاج يفهم الموضوع بصرياً.

الموضوع: {topic}
نوع الرسم: {visual_type}
{priority_instruction}

## المنهج المتاح:
{context[:800]}

{f"## سياق المحادثة:{chr(10)}{chat_context[:400]}" if chat_context else ""}

أرجع JSON بالشكل ده (React Flow compatible):
{{
  "type": "{visual_type}",
  "topic": "{topic}",
  "is_exam_priority": {str(is_priority).lower()},
  "nodes": [
    {{
      "id": "root",
      "type": "root",
      "label_ar": "العنوان الرئيسي",
      "label_en": "Main Title",
      "color": "{"#F9A825" if is_priority else "#00A896"}",
      "position": {{"x": 400, "y": 50}},
      "badge": {"'⭐ أولوية امتحان'" if is_priority else "null"}
    }},
    {{
      "id": "concept_1",
      "type": "concept",
      "label_ar": "مفهوم 1",
      "label_en": "Concept 1",
      "color": "#4ECDC4",
      "position": {{"x": 200, "y": 200}},
      "details_ar": "تفاصيل المفهوم",
      "details_en": "Concept details"
    }}
  ],
  "edges": [
    {{
      "source": "root",
      "target": "concept_1",
      "label": "يؤدي إلى"
    }}
  ]
}}

## القواعد:
1. أنشئ 5-8 عقد (nodes) على الأقل
2. أنواع العقد: root, concept, detail, example, formula
3. كل عقدة لها label_ar و label_en
4. الألوان: root=#00A896 أو #F9A825 (أولوية), concept=#4ECDC4, detail=#E8F5E9, example=#FFF3E0, formula=#E3F2FD
5. أضف أمثلة من الواقع المصري
6. الـ edges لازم تربط بين العقد بشكل منطقي

أرجع JSON فقط.
"""
        response = self.rag.model.generate_content(prompt)
        text = response.text or "{}"
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]

        result = json.loads(text.strip())
        result["lesson_id"] = lesson_id
        return result

    def generate_mindmap(
        self, topic: str, context: str = "",
        chat_context: str = "", lesson_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate specifically a mind map (called by the MindMap page)."""
        return self.generate(topic, context, lesson_id, chat_context)

    def _detect_type(self, text: str) -> str:
        """Detect which visual type matches the text."""
        text_lower = text.lower()
        for vtype, keywords in self.TRIGGER_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                return vtype
        return "process"

    def _is_exam_priority(self, topic: str) -> bool:
        """Check if topic is in exam priority list."""
        topic_lower = topic.lower()
        return any(p in topic_lower or topic_lower in p for p in self.EXAM_PRIORITY_TOPICS)
