/**
 * Progress Service — Real student stats and progress tracking via Firebase Firestore.
 * Replaces the stub that returned zeros. All data persists in Firestore.
 */
import { db } from '../config/firebase';
import {
  doc, getDoc, setDoc, updateDoc, increment, serverTimestamp,
  collection, query, where, getDocs, orderBy, limit
} from 'firebase/firestore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

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
 * Get student statistics from Firestore.
 * Creates the document if it doesn't exist yet.
 */
export async function getStudentStats(studentId: string): Promise<StudentStats> {
  try {
    const ref = doc(db, 'student_progress', studentId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        totalLessonsCompleted: data.totalLessonsCompleted || 0,
        totalCourses: data.totalCourses || 0,
        streak: data.streak || 0,
        totalPoints: data.totalPoints || 0,
        averageProgress: data.averageProgress || 0,
        totalTimeSpentMinutes: data.totalTimeSpentMinutes || 0,
        quizzesTaken: data.quizzesTaken || 0,
        averageQuizScore: data.averageQuizScore || 0,
      };
    }
    // Initialize if not exists
    await setDoc(ref, { ...DEFAULT_STATS, createdAt: serverTimestamp() });
    return { ...DEFAULT_STATS };
  } catch (err) {
    console.error('Failed to load student stats:', err);
    return { ...DEFAULT_STATS };
  }
}

/**
 * Record a lesson completion event in Firestore and log to analytics backend.
 */
export async function recordLessonComplete(
  studentId: string,
  lessonId: string,
  timeSpentSeconds: number,
  xpEarned: number = 50
): Promise<void> {
  try {
    const ref = doc(db, 'student_progress', studentId);
    await updateDoc(ref, {
      totalLessonsCompleted: increment(1),
      totalPoints: increment(xpEarned),
      totalTimeSpentMinutes: increment(Math.round(timeSpentSeconds / 60)),
      lastLessonId: lessonId,
      lastActivityAt: serverTimestamp(),
    }).catch(async () => {
      // Document might not exist yet
      await setDoc(ref, {
        ...DEFAULT_STATS,
        totalLessonsCompleted: 1,
        totalPoints: xpEarned,
        totalTimeSpentMinutes: Math.round(timeSpentSeconds / 60),
        lastLessonId: lessonId,
        lastActivityAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    });

    // Also record to lesson_completions subcollection for history
    const completionRef = doc(collection(db, 'student_progress', studentId, 'lesson_completions'), lessonId);
    await setDoc(completionRef, {
      lessonId,
      timeSpentSeconds,
      xpEarned,
      completedAt: serverTimestamp(),
    });

    // Log to analytics backend (non-blocking)
    fetch(`${BACKEND_URL}/api/analytics/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        event_type: 'lesson_end',
        data: { lessonId, timeSpentSeconds, xpEarned },
      }),
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to record lesson completion:', err);
  }
}

/**
 * Record a quiz attempt in Firestore and log to analytics.
 */
export async function recordQuizAttempt(
  studentId: string,
  lessonId: string,
  score: number,
  totalQuestions: number,
  xpEarned: number = 75
): Promise<void> {
  try {
    const ref = doc(db, 'student_progress', studentId);
    await updateDoc(ref, {
      quizzesTaken: increment(1),
      totalPoints: increment(xpEarned),
      lastActivityAt: serverTimestamp(),
    }).catch(async () => {
      await setDoc(ref, {
        ...DEFAULT_STATS,
        quizzesTaken: 1,
        totalPoints: xpEarned,
        lastActivityAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    });

    // Record quiz detail
    const quizRef = doc(collection(db, 'student_progress', studentId, 'quiz_attempts'));
    await setDoc(quizRef, {
      lessonId,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      xpEarned,
      attemptedAt: serverTimestamp(),
    });

    // Log to analytics backend
    fetch(`${BACKEND_URL}/api/analytics/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        event_type: 'quiz_attempt',
        data: { lessonId, score, totalQuestions, percentage: Math.round((score / totalQuestions) * 100) },
      }),
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to record quiz attempt:', err);
  }
}

/**
 * Update the student's streak. Call once per day when student logs in.
 */
export async function updateStreak(studentId: string): Promise<number> {
  try {
    const ref = doc(db, 'student_progress', studentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return 0;

    const data = snap.data();
    const lastActivity = data.lastActivityAt?.toDate?.();
    const now = new Date();

    if (!lastActivity) {
      await updateDoc(ref, { streak: 1, lastActivityAt: serverTimestamp() });
      return 1;
    }

    const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince === 0) {
      return data.streak || 1; // Already active today
    } else if (daysSince === 1) {
      const newStreak = (data.streak || 0) + 1;
      await updateDoc(ref, { streak: newStreak, lastActivityAt: serverTimestamp() });
      return newStreak;
    } else {
      await updateDoc(ref, { streak: 1, lastActivityAt: serverTimestamp() }); // Reset
      return 1;
    }
  } catch (err) {
    console.error('Failed to update streak:', err);
    return 0;
  }
}

/**
 * Add XP points to student.
 */
export async function addXP(studentId: string, xp: number): Promise<void> {
  try {
    const ref = doc(db, 'student_progress', studentId);
    await updateDoc(ref, {
      totalPoints: increment(xp),
      lastActivityAt: serverTimestamp(),
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to add XP:', err);
  }
}

/**
 * Log any interaction event to the analytics backend.
 */
export async function logAnalyticsEvent(
  studentId: string,
  eventType: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/analytics/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, event_type: eventType, data }),
    });
  } catch {
    // Non-critical, silently fail
  }
}
