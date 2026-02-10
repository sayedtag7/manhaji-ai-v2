
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
  Games = 'games',
  MindMap = 'mindmap',
  FlashCards = 'flashcards',
  Status = 'status',
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

// ═══════════════════════════════════════════════════════════════════════════
// Mind Map Types
// ═══════════════════════════════════════════════════════════════════════════

export interface MindMapNode {
  id: string;
  label: string;
  labelEn?: string;
  description?: string;
  descriptionEn?: string;
  type: 'root' | 'concept' | 'detail' | 'example' | 'formula';
  priority?: 'high' | 'medium' | 'low'; // exam priority
  mastered?: boolean;
  x?: number;
  y?: number;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  labelEn?: string;
  type?: 'prerequisite' | 'contains' | 'related' | 'leads_to';
}

export interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  title: string;
  titleEn?: string;
  lessonId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Flash Card Types
// ═══════════════════════════════════════════════════════════════════════════

export interface FlashCard {
  id: string;
  front: string;         // Question / concept (Arabic)
  frontEn?: string;
  back: string;          // Answer / explanation (Arabic)
  backEn?: string;
  lessonId?: string;
  subject?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: 'auto' | 'mistake' | 'user'; // how it was generated
  // Spaced repetition fields
  interval: number;       // days until next review
  easeFactor: number;     // SM-2 ease factor (default 2.5)
  repetitions: number;    // number of successful reviews
  nextReview: string;     // ISO date string
  lastReview?: string;
}

export type FlashCardRating = 'again' | 'hard' | 'good' | 'easy';

// ═══════════════════════════════════════════════════════════════════════════
// Ed Game Types
// ═══════════════════════════════════════════════════════════════════════════

export type GameType = 'matching' | 'sequence' | 'fix_mistake' | 'speed_challenge';

export interface GameQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
  // For matching games
  pairs?: Array<{ left: string; leftEn: string; right: string; rightEn: string }>;
  // For sequence games
  items?: Array<{ id: string; text: string; textEn: string; correctOrder: number }>;
  // For fix-the-mistake games
  wrongStatement?: string;
  wrongStatementEn?: string;
  correctStatement?: string;
  correctStatementEn?: string;
  explanation?: string;
  explanationEn?: string;
  // For speed challenge
  options?: string[];
  optionsEn?: string[];
  correctAnswer?: string;
  correctAnswerEn?: string;
}

export interface GameSession {
  gameType: GameType;
  score: number;
  totalQuestions: number;
  timeElapsed: number;
  correctAnswers: number;
  xpEarned: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// Visual Spec Types
// ═══════════════════════════════════════════════════════════════════════════

export interface VisualSpec {
  type: 'concept_card' | 'step_flow' | 'comparison' | 'mistake_correction';
  title: string;
  titleEn?: string;
  nodes: Array<{
    id: string;
    label: string;
    labelEn?: string;
    text?: string;
    textEn?: string;
    style_hint?: 'emphasis' | 'warning' | 'success' | 'info';
  }>;
  edges?: Array<{
    from_id: string;
    to_id: string;
    relation_label?: string;
    relation_labelEn?: string;
  }>;
}
