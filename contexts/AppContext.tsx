// Fix: Added full content for AppContext.tsx
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { View, Language, User, UserProgress, Notification, Question } from '../types';
import * as dbService from '../services/databaseService';

interface AppContextType {
  view: View;
  setView: (view: View) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  userProgress: UserProgress | null;
  updateProgress: (progress: Partial<UserProgress>) => Promise<void>;
  notification: Notification | null;
  showNotification: (notification: Notification) => void;
  dismissNotification: () => void;
  selectedTopicId: string | null;
  setSelectedTopicId: (topicId: string | null) => void;
  dailyChallenge: Question | null;
  setDailyChallenge: (challenge: Question | null) => void;
  dailyChallengeFetched: boolean;
  setDailyChallengeFetched: (fetched: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [view, setView] = useState<View>('login');
  
  const [language, setLanguage] = useState<Language>('en');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const [dailyChallenge, setDailyChallenge] = useState<Question | null>(null);
  const [dailyChallengeFetched, setDailyChallengeFetched] = useState(false);

  const setupUserSession = (user: User) => {
    setCurrentUser(user);
    
    if (user.role === 'student') {
        setUserProgress({
            level: user.level || 1,
            points: user.points || 0,
            badges: user.badges || [],
            dailyChallengeCompleted: user.dailyChallengeCompleted || false,
            classLevel: user.classLevel || '6',
            completedTopics: user.completedTopics || [],
            strengths: user.strengths || [],
            weaknesses: user.weaknesses || [],
        });
        setView('dashboard');
    } else {
        setUserProgress(null);
        if (user.role === 'teacher') {
            setView('teacherDashboard');
        } else if (user.role === 'parent') {
            setView('parentDashboard');
        }
    }
  };

  const login = useCallback((user: User) => {
    setupUserSession(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setUserProgress(null);
    setView('login');
    setDailyChallenge(null);
    setDailyChallengeFetched(false);
  }, []);

  const updateProgress = useCallback(async (progressUpdate: Partial<UserProgress>) => {
    if (!currentUser || !userProgress) return;

    const newProgress = { ...userProgress, ...progressUpdate };
    setUserProgress(newProgress);

    try {
        await dbService.updateUserProgress(currentUser.id, newProgress);
    } catch (error) {
        console.error("Failed to save progress to database", error);
        // Optionally, revert state or show an error to the user
    }
  }, [currentUser, userProgress]);

  const showNotification = useCallback((notif: Notification) => {
    setNotification(notif);
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const value = {
    view,
    setView,
    language,
    setLanguage,
    currentUser,
    login,
    logout,
    userProgress,
    updateProgress,
    notification,
    showNotification,
    dismissNotification,
    selectedTopicId,
    setSelectedTopicId,
    dailyChallenge,
    setDailyChallenge,
    dailyChallengeFetched,
    setDailyChallengeFetched,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};