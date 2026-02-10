"""
MisconceptionDetector — Pattern-based + AI misconception detection for Egyptian students.
"""
from typing import Tuple, List, Dict, Optional
import logging
import re

logger = logging.getLogger(__name__)

# Common misconceptions in Egyptian Grade 7-10 curriculum
KNOWN_MISCONCEPTIONS = {
    "science": [
        {
            "pattern": r"(الحديد|المعادن).*(أخف|أقل كثافة).*الماء",
            "type": "density_metals",
            "description_ar": "الطالب يعتقد أن المعادن أقل كثافة من الماء",
            "correction_ar": "معظم المعادن أكبر كثافة من الماء ولذلك تغوص فيه، ما عدا بعض الفلزات مثل الصوديوم والبوتاسيوم",
        },
        {
            "pattern": r"(الحرارة|السخونة).*(تنتقل|بتنتقل).*من.*(البارد|الأقل)",
            "type": "heat_direction",
            "description_ar": "الطالب يعتقد أن الحرارة تنتقل من البارد للساخن",
            "correction_ar": "الحرارة دايماً بتنتقل من الجسم الأعلى حرارة للأقل حرارة",
        },
        {
            "pattern": r"(الطاقة).*(بتتبدد|بتخلص|بتنتهي)",
            "type": "energy_destruction",
            "description_ar": "الطالب يعتقد أن الطاقة بتنتهي أو بتتبدد",
            "correction_ar": "حسب قانون بقاء الطاقة: الطاقة لا تفنى ولا تستحدث — بتتحول من صورة لصورة تانية",
        },
        {
            "pattern": r"(الصدأ|الأكسدة).*(بيحصل|يحصل).*(للذهب|للفضة)",
            "type": "noble_metal_rust",
            "description_ar": "الطالب يعتقد أن الذهب والفضة بيصدأوا",
            "correction_ar": "الذهب والفضة فلزات ضعيفة النشاط — بيصعب تفاعلها مع الأكسجين عشان كده بتستخدم في الحلي",
        },
    ],
    "math": [
        {
            "pattern": r"(القسمة|÷).*على.*(صفر|0).*يساوي.*(صفر|0|لانهاية)",
            "type": "division_by_zero",
            "description_ar": "الطالب يعتقد أن القسمة على صفر لها ناتج",
            "correction_ar": "القسمة على صفر غير معرفة — مش بتساوي صفر ولا لانهاية",
        },
        {
            "pattern": r"(كسر|رقم).*(سالب).*مش.*(نسبي|عقلاني)",
            "type": "negative_rational",
            "description_ar": "الطالب يعتقد أن الأعداد السالبة مش أعداد نسبية",
            "correction_ar": "الأعداد السالبة أعداد نسبية — أي عدد ممكن يتكتب في صورة أ/ب (ب ≠ 0) هو عدد نسبي",
        },
    ],
}


class MisconceptionDetector:
    """Detects misconceptions using pattern matching with known Egyptian curriculum pitfalls."""

    def detect(
        self,
        student_input: str,
        retrieved_context: str = "",
        subject: str = "",
    ) -> Tuple[bool, Optional[str]]:
        """Check student input against known misconception patterns.
        Returns (has_misconception: bool, misconception_type: str | None).
        """
        # Check all subjects if none specified
        subjects_to_check = [subject] if subject in KNOWN_MISCONCEPTIONS else KNOWN_MISCONCEPTIONS.keys()

        for subj in subjects_to_check:
            for misconception in KNOWN_MISCONCEPTIONS.get(subj, []):
                if re.search(misconception["pattern"], student_input, re.IGNORECASE):
                    logger.info(f"Misconception detected: {misconception['type']}")
                    return True, misconception["type"]

        return False, None

    def get_correction(self, misconception_type: str) -> Optional[Dict]:
        """Get the correction info for a detected misconception."""
        for subject_misconceptions in KNOWN_MISCONCEPTIONS.values():
            for m in subject_misconceptions:
                if m["type"] == misconception_type:
                    return {
                        "type": m["type"],
                        "description_ar": m["description_ar"],
                        "correction_ar": m["correction_ar"],
                    }
        return None

    def get_all_misconceptions(self, subject: Optional[str] = None) -> List[Dict]:
        """List all known misconception patterns."""
        if subject and subject in KNOWN_MISCONCEPTIONS:
            return KNOWN_MISCONCEPTIONS[subject]
        result = []
        for subj_list in KNOWN_MISCONCEPTIONS.values():
            result.extend(subj_list)
        return result
