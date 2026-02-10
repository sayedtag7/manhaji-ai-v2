/**
 * Quiz Service — AI-powered quiz via Socratic engine + Firebase persistence.
 * Replaces the stub that returned []. All quizzes are now AI-generated via the backend.
 */
import { getSocraticQuestion } from './aiEngineService';
import { recordQuizAttempt, logAnalyticsEvent } from './progressService';

export interface QuizOption {
  text: string;
  text_ar?: string;
  text_en?: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  question_id: string;
  lesson_id: string;
  question_text_ar: string;
  question_text_en?: string;
  explanation_ar?: string;
  explanation_en?: string;
  difficulty?: string;
  options: QuizOption[];
}

/**
 * Get quiz questions for a lesson.
 * Generates AI-powered Socratic questions via the backend.
 * Falls back to empty array if backend is unavailable.
 */
export async function getQuizQuestions(
  lessonId: string,
  topic: string = '',
  subject: string = 'science',
  grade: number = 7,
  count: number = 5,
): Promise<QuizQuestion[]> {
  try {
    const questions: QuizQuestion[] = [];

    // Generate questions one by one via Socratic engine
    for (let i = 0; i < count; i++) {
      const prevQ = questions[questions.length - 1];
      const socratic = await getSocraticQuestion(
        topic || lessonId,
        undefined,
        undefined,
        subject,
        grade,
        i + 1,
        i < 2 ? 'easy' : i < 4 ? 'medium' : 'hard',
      );

      if (socratic) {
        questions.push({
          question_id: `sq_${lessonId}_${i + 1}`,
          lesson_id: lessonId,
          question_text_ar: socratic.question_ar,
          question_text_en: socratic.question_en || '',
          explanation_ar: socratic.explanation_ar,
          explanation_en: socratic.explanation_en || '',
          difficulty: socratic.difficulty,
          options: socratic.options.map(opt => ({
            text: opt.text_ar,
            text_ar: opt.text_ar,
            text_en: opt.text_en,
            is_correct: opt.is_correct,
          })),
        });
      }

      // Rate limit — don't flood the backend
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    return questions;
  } catch (err) {
    console.error('Failed to load quiz questions:', err);
    return [];
  }
}

/**
 * Submit a quiz attempt to the backend.
 * Records in Firestore via progressService and updates student context for Socratic logic.
 */
export async function submitQuizAttempt(
  studentId: string,
  questionId: string,
  selectedOptionId: string,
  reasoning: string,
  timeTakenSeconds: number,
  lessonId: string = '',
  isCorrect: boolean = false,
): Promise<boolean> {
  try {
    // Record quiz attempt in Firestore
    await recordQuizAttempt(studentId, lessonId, isCorrect ? 1 : 0, 1);

    // Update student context in the Socratic Orchestrator
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    await fetch(`${BACKEND_URL}/api/chat/update-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        quiz_topic: lessonId,
        quiz_score: isCorrect ? 100 : 0,
      }),
    }).catch(() => {});

    // Log analytics event
    await logAnalyticsEvent(studentId, 'quiz_attempt', {
      questionId,
      selectedOptionId,
      isCorrect,
      timeTakenSeconds,
      lessonId,
    });

    return true;
  } catch (err) {
    console.error('Failed to submit quiz attempt:', err);
    return false;
  }
}
