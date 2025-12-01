
export interface User {
  id: string;
  name: string;
  level: string; // e.g., "الصف الأول الإعدادي"
  levelEn?: string;
  role: Role; // Added Role
  points: number;
  streak: number;
  completedSessions: number;
  badges: Badge[];
  activityData: number[]; // Array of activity counts for heatmap
  subscriptionTier: 'free' | 'pro';
}

export type Role = 'student' | 'parent' | 'teacher';

export interface Badge {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string; // Lucide icon name or emoji
  descriptionAr: string;
  descriptionEn: string;
  earnedDate: string;
}

export interface Lesson {
  id: string;
  titleAr: string;
  titleEn: string;
  durationAr: string;
  durationEn: string;
  isCompleted: boolean;
  isLocked: boolean;
  contentAr: string; // The Arabic text content for RAG
  contentEn: string; // The English text content for RAG
  videoUrl?: string; // Placeholder for video
  quizId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Unit {
  id: string;
  titleAr: string;
  titleEn: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  titleAr: string;
  titleEn: string;
  subjectAr: string;
  subjectEn: string;
  progress: number;
  weeklyProgress?: number[]; // Array of progress percentages over recent weeks
  image: string;
  units: Unit[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
  image?: string; // Base64 image
}

export enum NavItem {
  Dashboard = 'dashboard',
  Courses = 'courses',
  Progress = 'progress',
  AI = 'ai_tutor',
  Parents = 'parents',
  School = 'school',
  Profile = 'profile',
  Settings = 'settings'
}

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export type TranslationKey =
  | 'appTitle'
  | 'dashboard'
  | 'courses'
  | 'progress'
  | 'aiTutor'
  | 'logout'
  | 'statusNew'
  | 'statusInProgress'
  | 'welcomeBack'
  | 'keepGoing'
  | 'streakDays'
  | 'streakLabel'
  | 'completedSessions'
  | 'finishedSessions'
  | 'totalCourses'
  | 'registeredCourses'
  | 'completionRate'
  | 'completionMessage'
  | 'currentCourses'
  | 'viewAll'
  | 'studying'
  | 'completed'
  | 'continueLearning'
  | 'recommendedLesson'
  | 'recommended'
  | 'startLearning'
  | 'upcomingQuiz'
  | 'reviewQuiz'
  | 'chatPlaceholder'
  | 'chatWelcome'
  | 'downloadPdf'
  | 'courseContent'
  | 'units'
  | 'hours'
  | 'totalLessons'
  | 'backToHome'
  | 'backToCourse'
  | 'apiKeyPrompt'
  | 'enterApiKey'
  | 'startJourney'
  | 'questions'
  | 'minutes'
  | 'typing'
  | 'explainSimply'
  | 'realExample'
  | 'keyPoints'
  | 'askAboutLesson'
  | 'lessonContent'
  | 'error'
  | 'welcomeChatLesson'
  | 'chatTitle'
  | 'parentsArea'
  | 'gamification'
  | 'badges'
  | 'activityHeatmap'
  | 'summarize'
  | 'homeworkHelper'
  | 'uploadImage'
  | 'recordVoice'
  | 'upgradeToPro'
  | 'subscriptionPlan'
  | 'parentDashboard'
  | 'studentProgress'
  | 'generateReport'
  | 'noteSaved'
  | 'addNote'
  | 'saveNote'
  | 'myNotes'
  | 'audioOverview'
  | 'generateAudio'
  | 'sources'
  | 'addSource'
  | 'generateQuiz'
  | 'sourcesSelected'
  | 'profile'
  | 'settings'
  | 'accountSettings'
  | 'changePassword'
  | 'notifications'
  | 'aiPreferences'
  | 'saveChanges'
  | 'email'
  | 'fullName'
  | 'stage'
  | 'classLevel'
  | 'languageArabic'
  | 'languageEnglish'
  | 'less'
  | 'more'
  | 'comingSoon';

export interface Note {
  id: string;
  text: string;
  timestamp: string;
  lessonId: string;
}

export type QuickActionType = 'quiz' | 'summary' | 'explanation';
