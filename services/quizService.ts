// Quiz Service — quiz question loading and attempt submission

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
 * Returns from Supabase quiz_questions table, or empty array.
 */
export async function getQuizQuestions(lessonId: string): Promise<QuizQuestion[]> {
  try {
    // TODO: Query Supabase quiz_questions table
    // const { data } = await supabase.from('quiz_questions').select('*').eq('lesson_id', lessonId);
    return [];
  } catch (err) {
    console.error('Failed to load quiz questions:', err);
    return [];
  }
}

/**
 * Submit a quiz attempt to the backend.
 */
export async function submitQuizAttempt(
  studentId: string,
  questionId: string,
  selectedOptionId: string,
  reasoning: string,
  timeTakenSeconds: number
): Promise<boolean> {
  try {
    // TODO: Insert into Supabase quiz_attempts table
    console.log(`Quiz attempt: ${studentId} answered ${questionId} with ${selectedOptionId}`);
    return true;
  } catch (err) {
    console.error('Failed to submit quiz attempt:', err);
    return false;
  }
}
