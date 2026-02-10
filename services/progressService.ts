// Progress Service — student stats and progress tracking

export interface StudentStats {
  totalLessonsCompleted: number;
  totalCourses: number;
  streak: number;
  totalPoints: number;
  averageProgress: number;
  totalTimeSpentMinutes: number;
  quizzesTaken: number;
  averageQuizScore: number;
}

const DEFAULT_STATS: StudentStats = {
  totalLessonsCompleted: 0,
  totalCourses: 0,
  streak: 0,
  totalPoints: 0,
  averageProgress: 0,
  totalTimeSpentMinutes: 0,
  quizzesTaken: 0,
  averageQuizScore: 0,
};

/**
 * Get student statistics from Supabase or return defaults.
 * This is a placeholder that returns cached / default data.
 * Connect to Supabase student_progress table for real data.
 */
export async function getStudentStats(studentId: string): Promise<StudentStats> {
  try {
    // TODO: Query Supabase for real statistics
    // const { data } = await supabase.from('student_progress').select('*').eq('student_id', studentId);
    return { ...DEFAULT_STATS };
  } catch (err) {
    console.error('Failed to load student stats:', err);
    return { ...DEFAULT_STATS };
  }
}

/**
 * Record a lesson completion event
 */
export async function recordLessonComplete(studentId: string, lessonId: string, timeSpentSeconds: number): Promise<void> {
  try {
    // TODO: Insert into Supabase
    console.log(`Lesson ${lessonId} completed by ${studentId} in ${timeSpentSeconds}s`);
  } catch (err) {
    console.error('Failed to record lesson completion:', err);
  }
}
