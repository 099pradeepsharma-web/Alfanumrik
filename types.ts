// Fix: Added full content for types.ts
export type Language = 'en' | 'hi';

export type Role = 'student' | 'teacher' | 'parent';

export type View = 'dashboard' | 'learning' | 'exam' | 'challenge' | 'teacherDashboard' | 'parentDashboard' | 'login';

export interface User {
  id: string; // Will be the user's email
  email: string;
  name: string;
  password?: string; // For auth purposes, not stored in session
  role: Role;
  verified: boolean;
  // student-specific
  level?: number;
  points?: number;
  classLevel?: string;
  // teacher-specific
  students?: string[]; // array of student IDs
  // parent-specific
  children?: string[]; // array of student IDs
}

export interface UserProgress {
  level: number;
  points: number;
  badges: string[]; // array of badge IDs
  dailyChallengeCompleted: boolean;
  classLevel: string;
  completedTopics: string[]; // array of topic IDs
}

export interface BadgeInfo {
  name: string;
  description: string;
  icon: string;
}

export interface Notification {
  message: string;
  icon: string;
}

export interface LearningContent {
  id: string;
  topicId: string;
  topic: string;
  content: string; 
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
}

export interface DailyChallenge {
  id:string;
  title: string;
  description: string;
  question: Question;
}

export type Message = {
  sender: 'user' | 'tutor';
  text: string;
};