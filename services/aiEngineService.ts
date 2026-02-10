/**
 * Manhaji AI Engine Service — Frontend connector for the AI-driven backend.
 * Replaces all static data with live AI-generated content.
 * 
 * "Everything is a Prompt" — No hardcoded button targets, no static stats.
 * 
 * AI Grounding:
 * - All AI responses are grounded in MOETE curriculum (Grades 7-10)
 * - System prompts defined in config/ai-system-prompts.ts
 * - Curriculum structure defined in config/curriculum-config.ts
 * - Backend implements RAG (Retrieval-Augmented Generation) for accurate citations
 */

// Import AI configuration (system prompts are used by backend, but exported for reference)
import { SYSTEM_PROMPTS, CURRICULUM_SCOPE } from '../config/ai-system-prompts';
import { CurriculumService } from '../config/curriculum-config';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface StudentAction {
  action_type: 'lesson' | 'quiz' | 'teach_ai' | 'review' | 'game' | 'challenge' | 'micro_video' | 'flashcard' | 'misconception_fix';
  content_id: string | null;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  reason_ar: string;
  reason_en: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimated_minutes: number;
  xp_reward: number;
  button_label_ar: string;
  button_label_en: string;
  metadata: Record<string, unknown>;
}

export interface DynamicButton {
  label_ar: string;
  label_en: string;
  action_type: string;
  content_id: string | null;
  tooltip_ar: string;
  tooltip_en: string;
  priority: string;
  xp_reward: number;
}

export interface StudentBehavior {
  student_id: string;
  last_lesson_id?: string;
  last_lesson_subject?: string;
  last_quiz_score?: number;
  quiz_failure_count?: number;
  active_misconceptions?: string[];
  streak_days?: number;
  total_xp?: number;
  lessons_completed?: number;
  time_spent_today_minutes?: number;
  last_activity?: string;
  grade?: number;
}

export interface AIInsight {
  insight_ar: string;
  insight_en: string;
  alert_ar?: string;
  alert_en?: string;
  report_ar?: string;
  report_en?: string;
  type: string;
}

export interface SocraticQuestion {
  question_ar: string;
  question_en: string;
  hint_ar?: string;
  hint_en?: string;
  options: Array<{
    id: string;
    text_ar: string;
    text_en: string;
    is_correct: boolean;
  }>;
  explanation_ar: string;
  explanation_en: string;
  difficulty: string;
  targets_misconception: string | null;
}

export interface NotebookScanResult {
  has_misconceptions: boolean;
  misconceptions: Array<{
    type: string;
    misconception_ar: string;
    misconception_en: string;
    correction_ar: string;
    correction_en: string;
    description_ar?: string;
    correct_concept_ar?: string;
    severity: string;
    related_lesson: string;
  }>;
  overall_understanding: string;
  parent_alert: string | null;
  suggested_action: string | null;
}

export interface TeachAIResult {
  score: number;
  feedback_ar: string;
  feedback_en: string;
  is_correct: boolean;
  missing_points: string[];
  missing_concepts?: string[];
  xp_earned: number;
}

export interface StudyPlanAI {
  student_id: string;
  date: string;
  greeting_ar: string;
  greeting_en: string;
  insight_ar: string;
  insight_en: string;
  tasks: Array<{
    id: string;
    title_ar: string;
    title_en: string;
    description_ar: string;
    task_type: string;
    subject: string;
    duration_minutes: number;
    xp_reward: number;
    priority: string;
    is_misconception_fix: boolean;
    misconception_id?: string | null;
  }>;
  motivation_ar: string;
  motivation_en: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Action Engine — "Everything is a Prompt"
// ═══════════════════════════════════════════════════════════════════════════

/** Get the AI-recommended next action for a student. Replaces ALL static buttons. */
export async function getNextAction(behavior: StudentBehavior): Promise<StudentAction | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/actions/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(behavior),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Action engine error:', e);
    return null;
  }
}

/** Get multiple ranked action suggestions. */
export async function getMultipleActions(behavior: StudentBehavior): Promise<StudentAction[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/actions/decide-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(behavior),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.actions || [];
  } catch (e) {
    console.error('Multiple actions error:', e);
    return [];
  }
}

/** Get dynamic button config. The 'Plan' button changes based on student behavior. */
export async function getDynamicButton(behavior: StudentBehavior): Promise<DynamicButton | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/actions/dynamic-button`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(behavior),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Dynamic button error:', e);
    return null;
  }
}

/** AI-driven learning path — Gemini decides the exact content for this moment. */
export async function getLearningPath(behavior: StudentBehavior): Promise<StudentAction | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/actions/learning-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(behavior),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Learning path error:', e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Live Insights — SSE Streaming
// ═══════════════════════════════════════════════════════════════════════════

/** Generate a personalized AI insight. Replaces all static 'AI Insight' text. */
export async function generateInsight(
  studentData: Record<string, unknown>,
  insightType: 'dashboard' | 'parent_report' | 'parent_alert' | 'next_action' = 'dashboard'
): Promise<AIInsight | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/insights/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...studentData, insight_type: insightType }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Insight error:', e);
    return null;
  }
}

/** Stream AI insights in real-time via SSE. */
export function streamInsight(
  studentData: Record<string, unknown>,
  insightType: string,
  onChunk: (text: string) => void,
  onDone: () => void,
): AbortController {
  const controller = new AbortController();

  fetch(`${BACKEND_URL}/api/insights/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...studentData, insight_type: insightType }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok || !res.body) {
        onDone();
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) onChunk(data.text);
              if (data.done) { onDone(); return; }
            } catch { /* skip malformed */ }
          }
        }
      }
      onDone();
    })
    .catch(() => onDone());

  return controller;
}

// ═══════════════════════════════════════════════════════════════════════════
// Socratic Quiz — Dynamic question generation
// ═══════════════════════════════════════════════════════════════════════════

/** Generate the next quiz question based on the student's previous reasoning. */
export async function getSocraticQuestion(
  topic: string,
  previousAnswer?: string,
  previousReasoning?: string,
  subject: string = 'science',
  grade: number = 7,
  questionNumber: number = 1,
  difficulty: string = 'medium',
): Promise<SocraticQuestion | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/quiz/socratic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        previous_answer: previousAnswer,
        previous_reasoning: previousReasoning,
        question_number: questionNumber,
        difficulty,
        grade,
        subject,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Socratic quiz error:', e);
    return null;
  }
}

/** Evaluate student's reasoning in Teach-the-AI mode. */
export async function evaluateTeachAI(
  topic: string,
  explanation: string,
  subject: string = 'science',
  grade: number = 7,
): Promise<TeachAIResult | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/quiz/evaluate-reasoning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        explanation,
        subject,
        grade,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Teach AI eval error:', e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Notebook Intelligence
// ═══════════════════════════════════════════════════════════════════════════

/** Scan notebook text for misconceptions. */
export async function scanNotebook(
  notebookText: string,
  subject: string = 'science',
  grade: number = 7,
): Promise<NotebookScanResult | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/notebook/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notebook_text: notebookText,
        subject,
        grade,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Notebook scan error:', e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AI Study Plan
// ═══════════════════════════════════════════════════════════════════════════

/** Generate a personalized AI study plan. */
export async function generateStudyPlan(
  studentId: string,
  studentData: Record<string, unknown>,
): Promise<StudyPlanAI | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/study-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, ...studentData }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Study plan error:', e);
    return null;
  }
}

/** Get sample study plan for testing. */
export async function getSampleStudyPlan(): Promise<StudyPlanAI | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/study-plan/sample`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Sample plan error:', e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Parent Intelligence
// ═══════════════════════════════════════════════════════════════════════════

/** Generate AI-powered parent report. */
export async function generateParentReport(
  studentData: Record<string, unknown>,
): Promise<AIInsight | null> {
  return generateInsight(studentData, 'parent_report');
}

/** Generate real-time parent alert. */
export async function generateParentAlert(
  studentData: Record<string, unknown>,
): Promise<AIInsight | null> {
  return generateInsight(studentData, 'parent_alert');
}

// ═══════════════════════════════════════════════════════════════════════════
// RAG Chat (streaming)
// ═══════════════════════════════════════════════════════════════════════════

/** Send a chat message through the RAG pipeline. */
export async function sendRAGMessage(
  message: string,
  studentId?: string,
  lessonId?: string,
  grade?: number,
  subject?: string,
): Promise<{ text: string; sources: string[]; misconception_flag: boolean; misconception_type: string | null } | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        student_id: studentId,
        lesson_id: lessonId,
        grade,
        subject,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('RAG chat error:', e);
    return null;
  }
}

/** Stream a chat response via SSE. */
export function streamRAGMessage(
  message: string,
  onChunk: (text: string) => void,
  onDone: (sources?: string[]) => void,
  options?: { studentId?: string; grade?: number; subject?: string },
): AbortController {
  const controller = new AbortController();

  fetch(`${BACKEND_URL}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      student_id: options?.studentId,
      grade: options?.grade,
      subject: options?.subject,
      stream: true,
    }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok || !res.body) { onDone(); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) onChunk(data.text);
              if (data.done) { onDone(data.sources); return; }
            } catch { /* skip */ }
          }
        }
      }
      onDone();
    })
    .catch(() => onDone());

  return controller;
}

// ═══════════════════════════════════════════════════════════════════════════
// Health Check
// ═══════════════════════════════════════════════════════════════════════════

export async function checkBackendHealth(): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.services;
  } catch {
    return null;
  }
}
