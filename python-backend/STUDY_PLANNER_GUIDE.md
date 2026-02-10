# 🎯 Study Plan Generator — Egyptian Coach AI

## Overview
The Study Plan Generator is an AI-powered service that creates personalized daily study plans for Egyptian students. It uses the "Egyptian Coach" persona to deliver friendly, educational guidance in Egyptian Arabic (Ammiya).

## 🧠 Core Strategy

### The Egyptian Coach Approach
1. **Academic Balance**: Maintain strong subjects, focus on weak ones
2. **Misconception Priority**: Fix wrong concepts before moving forward
3. **Understanding-First**: Focus on comprehension, not memorization
4. **Gamified Motivation**: XP rewards, challenges, and streaks

### Subject Balancing Logic
```
IF student.performance[subject] == "excellent":
    → 1 maintenance task (review/flashcard) — 8-10 mins
    
IF student.performance[subject] == "weak":
    → 2-3 focused tasks (lesson + quiz + fix-mistake) — 35-50 mins
    
IF student.misconceptions.length > 0:
    → First task MUST be "fix-mistake" challenge — HIGH priority
```

## 📋 API Endpoints

### 1. Generate Personalized Plan
**POST** `/api/study-plan/generate`

**Request Body:**
```json
{
  "student_id": "student_123",
  "grade": 8,
  "lessons_completed": 45,
  "last_lesson": "تركيب الخلية",
  "last_quiz_score": 95,
  "misconceptions": [
    "الفرق بين الفعل المبني والمعرب",
    "استخدام حروف الجر"
  ],
  "streak": 12,
  "strongest_subject": "science",
  "weakest_subject": "arabic"
}
```

**Response:**
```json
{
  "student_id": "student_123",
  "date": "2026-02-11",
  "greeting_ar": "عاش يا بطل! مستواك في العلوم طيارة 🚀",
  "greeting_en": "Well done champ! Your science level is flying 🚀",
  "insight_ar": "لاحظت إنك مدلع العربي شوية.. يلا نركز عليه النهاردة ونوازن المستوى",
  "insight_en": "I noticed Arabic needs some attention.. let's focus on it today to balance your performance",
  "tasks": [
    {
      "id": "task_1",
      "title_ar": "🔧 صلّح المفهوم الخاطئ في النحو",
      "title_en": "🔧 Fix the Grammar Misconception",
      "description_ar": "افهم الفرق بين الفعل المبني والمعرب بأمثلة واضحة",
      "task_type": "fix-mistake",
      "subject": "arabic",
      "duration_minutes": 20,
      "xp_reward": 100,
      "priority": "high",
      "is_misconception_fix": true,
      "misconception_id": "misconception_1"
    },
    {
      "id": "task_2",
      "title_ar": "📚 درس جديد في النحو",
      "title_en": "📚 New Grammar Lesson",
      "description_ar": "تابع الدرس التالي في قواعد اللغة العربية",
      "task_type": "lesson",
      "subject": "arabic",
      "duration_minutes": 25,
      "xp_reward": 50,
      "priority": "high"
    },
    {
      "id": "task_3",
      "title_ar": "📝 اختبر نفسك في العربي",
      "title_en": "📝 Test Yourself in Arabic",
      "description_ar": "حل كويز سريع على النحو",
      "task_type": "quiz",
      "subject": "arabic",
      "duration_minutes": 10,
      "xp_reward": 75,
      "priority": "medium"
    },
    {
      "id": "task_4",
      "title_ar": "🃏 مراجعة سريعة في العلوم",
      "title_en": "🃏 Quick Science Review",
      "description_ar": "حافظ على مستواك الممتاز — راجع 10 بطاقات",
      "task_type": "flashcard",
      "subject": "science",
      "duration_minutes": 8,
      "xp_reward": 30,
      "priority": "low"
    }
  ],
  "motivation_ar": "انت قدها يا نجم — استمر وهتوصل! 🌟",
  "motivation_en": "You got this, star — keep going and you'll reach it! 🌟"
}
```

### 2. Get Sample Plan
**GET** `/api/study-plan/sample`

Returns a basic demo plan for testing.

### 3. Get Realistic Example
**GET** `/api/study-plan/example`

Returns a realistic example demonstrating the Egyptian Coach strategy:
- Excellent in Science
- Low engagement in Arabic
- Has misconceptions

Perfect for UI/UX testing.

### 4. Health Check
**GET** `/api/study-plan/health`

Check if the service is running.

## 🎮 Task Types

| Type | Description | Duration | XP Reward | Use Case |
|------|-------------|----------|-----------|----------|
| `lesson` | New educational content | 15-25 min | 50 XP | Learning new concepts |
| `quiz` | Assessment test | 10-15 min | 75-150 XP | Knowledge validation |
| `review` | Quick recap | 5-10 min | 30 XP | Retention boost |
| `flashcard` | Memory cards | 5-8 min | 30 XP | Spaced repetition |
| `fix-mistake` | Misconception fix | 15-20 min | 100 XP | Correcting errors |
| `game` | Educational game | 10-15 min | 50 XP | Engagement |
| `challenge` | Daily challenge | 10-20 min | 50 XP | Motivation |

## 🎯 Priority System

### High Priority
- Misconception fixes (`fix-mistake`)
- Lessons in weak subjects
- Overdue reviews

### Medium Priority
- Quizzes in weak subjects
- Daily challenges
- Games

### Low Priority
- Maintenance tasks for strong subjects
- Flashcard reviews
- Optional enrichment

## 🤖 AI Model Configuration

**Model**: Gemini 1.5 Flash  
**System Prompt**: Egyptian Coach persona  
**Temperature**: 0.7 (balanced creativity)  
**Max Tokens**: 2048  

### Key Prompt Instructions
1. Use Egyptian Arabic (Ammiya) — not formal Fusha
2. Prioritize misconceptions first
3. Balance subjects based on performance
4. Limit to 5 tasks per day
5. Vary task types for engagement
6. Return valid JSON always

## 🧪 Testing

### Quick Test
Start the backend:
```bash
cd python-backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Test endpoints:
```bash
# Health check
curl http://localhost:8000/api/study-plan/health

# Sample plan
curl http://localhost:8000/api/study-plan/sample

# Realistic example
curl http://localhost:8000/api/study-plan/example

# Custom plan
curl -X POST http://localhost:8000/api/study-plan/generate \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "test_123",
    "grade": 7,
    "strongest_subject": "science",
    "weakest_subject": "arabic",
    "misconceptions": ["علامات الإعراب"]
  }'
```

## 📊 Usage in Frontend

```typescript
// services/studyPlanService.ts
import { VITE_BACKEND_URL } from '../config';

interface StudyPlanRequest {
  student_id: string;
  grade: number;
  lessons_completed?: number;
  last_lesson?: string;
  last_quiz_score?: number;
  misconceptions?: string[];
  streak?: number;
  strongest_subject?: string;
  weakest_subject?: string;
}

export async function generateStudyPlan(data: StudyPlanRequest) {
  const response = await fetch(`${VITE_BACKEND_URL}/api/study-plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate study plan');
  }
  
  return response.json();
}

// Usage in component
const plan = await generateStudyPlan({
  student_id: currentUser.uid,
  grade: currentUser.grade,
  strongest_subject: 'science',
  weakest_subject: 'arabic',
  misconceptions: userMisconceptions,
  streak: currentStreak,
});

console.log(plan.greeting_ar); // "عاش يا بطل!"
console.log(plan.tasks.length); // 3-5 tasks
```

## 🔧 Configuration

**Environment Variables** (`.env`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_BACKEND_URL=http://localhost:8000
LLM_MODEL=gemini-1.5-flash
```

## 🎓 Learning Philosophy

The Study Plan Generator follows the **Manhaji Learning Loop**:

```
1. LEARN → New concept introduction (lesson task)
2. PRACTICE → Apply knowledge (quiz task)
3. REFLECT → Identify gaps (misconception detection)
4. IMPROVE → Fix errors (fix-mistake task)
```

This cycle ensures:
- ✅ Deep understanding, not memorization
- ✅ Continuous progress tracking
- ✅ Personalized learning paths
- ✅ Gamified motivation

## 📝 Notes

- All plans are generated fresh using Gemini AI — no static templates
- The service includes fallback plans if AI generation fails
- Plans automatically adapt to student performance trends
- Egyptian Arabic is used for authenticity and relatability
- MOETE curriculum alignment is built into every recommendation

## 🚀 Next Steps

1. ✅ Service implemented
2. ✅ API routes created
3. ⏳ Test with real student data
4. ⏳ Integrate with frontend Dashboard
5. ⏳ Connect to StudentMisconceptions table
6. ⏳ Add analytics tracking (completion rates, XP earned)
7. ⏳ Implement streak bonuses and achievements

---

**Built with ❤️ for Egyptian students by the Manhaji team**
