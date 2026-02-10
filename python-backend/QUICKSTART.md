# 🚀 Quick Start Guide — Study Plan Generator

Follow these steps to run and test the Study Plan Generator service.

## Prerequisites

1. **Python 3.9+** installed
2. **Gemini API Key** (already in `.env`)
3. **Terminal** access

## Step 1: Install Python (if not already installed)

### Windows:
Download from [python.org](https://www.python.org/downloads/) or use:
```powershell
winget install Python.Python.3.11
```

### Verify installation:
```bash
python --version
# Should show: Python 3.11.x or higher
```

## Step 2: Set Up Python Backend

```bash
# Navigate to backend directory
cd python-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Step 3: Configure Environment

Make sure `.env` file exists in the project root:
```env
GEMINI_API_KEY=AIzaSyAioiXCXKs9AmzH9mzeyfiJcXl0mI5ndt8
VITE_BACKEND_URL=http://localhost:8000
LLM_MODEL=gemini-1.5-flash
```

## Step 4: Test the Study Planner Service

Run the test script:
```bash
cd python-backend
python test_study_planner.py
```

**Expected output:**
```
============================================================
STUDY PLAN GENERATOR — TEST SUITE
============================================================

=== Test 1: Initialization ===
✓ Initialized with API key: AIzaSyAio...

=== Test 2: Sample Plan ===
✓ Student ID: demo_student
✓ Date: 2026-02-11
✓ Greeting (AR): عاش يا بطل! يلا نبدأ يومنا بنشاط 💪
✓ Insight (AR): لاحظت إنك قوي في science — ده ممتاز!...
✓ Number of tasks: 5

  Task 1:
    - Title: 🔧 صلّح المفهوم الخاطئ
    - Type: fix-mistake
    - Subject: arabic
    - Duration: 20 min
    - XP: 100
    - Priority: high
    - ⚠ Misconception Fix!

...

🎉 All tests passed! Study planner is ready to use.
```

## Step 5: Start the FastAPI Server

```bash
# From python-backend directory
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
✓ Vector Store initialized
✓ Gemini RAG initialized
✓ Study Plan Generator initialized
✓ Study Plan routes mounted
```

## Step 6: Test API Endpoints

Open a new terminal and test:

### Health Check
```bash
curl http://localhost:8000/api/study-plan/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Study plan generator is ready",
  "model": "gemini-1.5-flash",
  "persona": "Egyptian Coach"
}
```

### Get Sample Plan
```bash
curl http://localhost:8000/api/study-plan/sample
```

### Get Realistic Example (Science Strong, Arabic Weak)
```bash
curl http://localhost:8000/api/study-plan/example
```

### Generate Custom Plan
```bash
curl -X POST http://localhost:8000/api/study-plan/generate \
  -H "Content-Type: application/json" \
  -d "{\"student_id\":\"test_123\",\"grade\":8,\"strongest_subject\":\"science\",\"weakest_subject\":\"arabic\",\"misconceptions\":[\"النحو\"]}"
```

## Step 7: Connect to Frontend

Update your frontend service at `services/studyPlanService.ts`:

```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export async function generateStudyPlan(studentData: any) {
  const response = await fetch(`${BACKEND_URL}/api/study-plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData),
  });
  return response.json();
}
```

Then use it in your Dashboard:
```typescript
import { generateStudyPlan } from '../services/studyPlanService';

const plan = await generateStudyPlan({
  student_id: currentUser.uid,
  grade: currentUser.grade,
  strongest_subject: 'science',
  weakest_subject: 'arabic',
  misconceptions: userMisconceptions,
});

console.log(plan.tasks); // Array of 3-5 tasks
```

## 🎯 What You Built

### ✅ Service Architecture
```
StudyPlanGenerator (services/study_planner.py)
    ↓
Uses Gemini 1.5 Flash API
    ↓
Applies "Egyptian Coach" Persona
    ↓
Returns Personalized Study Plan (JSON)
    ↓
API Routes (routes/study_plan.py)
    ↓
Frontend Integration
```

### ✅ Key Features

1. **Academic Balance Logic**
   - Maintains strong subjects (1 light task)
   - Focuses on weak subjects (2-3 intensive tasks)

2. **Misconception Priority**
   - First task always fixes wrong concepts
   - 100 XP reward for fixes

3. **Egyptian Coach Persona**
   - Friendly Egyptian Arabic (Ammiya)
   - Encouragement: "عاش يا بطل"، "يلا بينا"
   - No formal Fusha

4. **Task Variety**
   - 7 types: lesson, quiz, review, flashcard, fix-mistake, game, challenge
   - Durations: 5-25 minutes
   - XP rewards: 30-150 XP

5. **Intelligent Fallback**
   - If AI fails, returns balanced default plan
   - Never breaks the frontend

## 📊 Example Output

For a student **excellent in Science** but **low in Arabic**:

```json
{
  "greeting_ar": "عاش يا بطل! مستواك في العلوم طيارة 🚀",
  "insight_ar": "لاحظت إنك مدلع العربي شوية.. يلا نركز عليه النهاردة",
  "tasks": [
    {
      "title_ar": "🔧 صلّح المفهوم الخاطئ في النحو",
      "task_type": "fix-mistake",
      "subject": "arabic",
      "priority": "high",
      "xp_reward": 100
    },
    {
      "title_ar": "📚 درس جديد في النحو",
      "task_type": "lesson",
      "subject": "arabic",
      "priority": "high"
    },
    {
      "title_ar": "📝 اختبر نفسك في العربي",
      "task_type": "quiz",
      "subject": "arabic",
      "priority": "medium"
    },
    {
      "title_ar": "🃏 مراجعة سريعة في العلوم",
      "task_type": "flashcard",
      "subject": "science",
      "priority": "low"
    }
  ],
  "motivation_ar": "انت قدها يا نجم — استمر وهتوصل! 🌟"
}
```

**Notice:** 3 tasks for Arabic (weak), 1 light task for Science (strong)!

## 🐛 Troubleshooting

### Error: "Study planner not initialized"
- Check if `GEMINI_API_KEY` is set in `.env`
- Restart the FastAPI server

### Error: "Import google.generativeai failed"
```bash
pip install google-generativeai==0.3.0
```

### Error: "JSON parsing error"
- The AI returned invalid JSON
- Fallback plan will be used automatically
- Check logs for raw response

### Python not found
- Install Python 3.9+
- Add to PATH: `C:\Python311\`

## 📚 Documentation Files

- `STUDY_PLANNER_GUIDE.md` — Complete API reference
- `test_study_planner.py` — Test suite
- `services/study_planner.py` — Service implementation
- `routes/study_plan.py` — API endpoints

## 🎉 You're Done!

The Study Plan Generator is now ready. It will:
- ✅ Balance subjects based on performance
- ✅ Prioritize misconception fixes
- ✅ Use Egyptian Coach persona
- ✅ Generate 3-5 tasks per day
- ✅ Award XP for gamification
- ✅ Integrate seamlessly with frontend

**Next step:** Connect this to your Dashboard component to display AI-generated study plans!

---

**Built with 🧠 using Gemini 1.5 Flash & FastAPI**
