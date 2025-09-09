// Fix: Added full content for types.ts
export type Language = 'en' | 'hi';

export type Role = 'student' | 'teacher' | 'parent';

export type View = 'dashboard' | 'learning' | 'exam' | 'challenge' | 'teacherDashboard' | 'parentDashboard' | 'login' | 'profileSettings';

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  name: string;
  password?: string; // For auth purposes, not stored in session
  role: Role;
  verified: boolean;
  // student-specific
  level?: number;
  points?: number;
  classLevel?: string;
  badges?: string[];
  dailyChallengeCompleted?: boolean;
  completedTopics?: string[];
  weaknesses?: string[];
  strengths?: string[];
  lastActivity?: any; // Can be a string or a Firestore Timestamp
  progress?: number; // for parent dashboard mock
  // teacher-specific
  students?: string[]; // array of student UIDs
  // parent-specific
  children?: string[]; // array of student UIDs
}

export interface UserProgress {
  level: number;
  points: number;
  badges: string[]; // array of badge IDs
  dailyChallengeCompleted: boolean;
  classLevel: string;
  completedTopics: string[]; // array of topic IDs
  strengths: string[]; // e.g., ['fractions_6', 'solar_system_6']
  weaknesses: string[]; // e.g., ['decimals_6']
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
  imagePrompts?: string[];
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

export interface Topic {
  id: string;
  name: string;
  icon: string;
  materials?: { id: string; name: string; type: string; url: string }[];
  prerequisites?: string[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  topics: Topic[];
}