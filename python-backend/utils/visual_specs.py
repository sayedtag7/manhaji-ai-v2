"""
VisualSpecGenerator — Generates visual/diagram specifications for educational content.
"""
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class VisualSpecGenerator:
    """Generates structured specs for educational diagrams/visuals."""

    VISUAL_TEMPLATES = {
        "comparison": {
            "type": "comparison_table",
            "layout": "two_column",
        },
        "process": {
            "type": "flow_diagram",
            "layout": "vertical_flow",
        },
        "hierarchy": {
            "type": "tree_diagram",
            "layout": "top_down",
        },
        "cycle": {
            "type": "cycle_diagram",
            "layout": "circular",
        },
    }

    TRIGGER_KEYWORDS = {
        "comparison": ["مقارنة", "الفرق", "compare", "difference", "vs"],
        "process": ["خطوات", "مراحل", "عملية", "steps", "process", "how"],
        "hierarchy": ["تصنيف", "أنواع", "classify", "types", "categories"],
        "cycle": ["دورة", "تحول", "cycle", "transform", "حلقة"],
    }

    def generate(
        self,
        topic: str,
        context: str = "",
        lesson_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate a visual specification based on the topic and context."""
        visual_type = self._detect_type(topic)
        template = self.VISUAL_TEMPLATES.get(visual_type, self.VISUAL_TEMPLATES["process"])

        return {
            "type": template["type"],
            "layout": template["layout"],
            "topic": topic,
            "lesson_id": lesson_id,
            "data": {
                "title": topic,
                "context_summary": context[:200] if context else "",
            },
        }

    def _detect_type(self, text: str) -> str:
        """Detect which visual type matches the text."""
        text_lower = text.lower()
        for vtype, keywords in self.TRIGGER_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                return vtype
        return "process"
