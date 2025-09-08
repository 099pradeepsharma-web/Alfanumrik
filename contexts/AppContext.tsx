// Fix: Added full content for AppContext.tsx
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { View, Language, User, UserProgress, Notification } from '../types';

// Helper to get initial state from localStorage
const getInitialUser = (): User | null => {
  try {
    const item = window.localStorage.getItem('currentUser');
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Error reading currentUser from localStorage", error);
    return null;
  }
};

const getInitialUserProgress = (user: User | null): UserProgress | null => {
  if (!user || user.role !== 'student') return null;
  try {
    const item = window.localStorage.getItem(`userProgress_${user.id}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Error reading userProgress from localStorage", error);
    return null;
  }
};

const getInitialView = (user: User | null): View => {
    if (!user) return 'login';
    switch (user.role) {
        case 'teacher': return 'teacherDashboard';
        case 'parent': return 'parentDashboard';
        default: return 'dashboard';
    }
};

interface AppContextType {
  view: View;
  setView: (view: View) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  userProgress: UserProgress | null;
  updateProgress: (progress: Partial<UserProgress>) => void;
  notification: Notification | null;
  showNotification: (notification: Notification) => void;
  dismissNotification: () => void;
  selectedTopicId: string | null;
  setSelectedTopicId: (topicId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialUser] = useState(getInitialUser);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(() => getInitialUserProgress(initialUser));
  const [view, setView] = useState<View>(() => getInitialView(initialUser));
  
  const [language, setLanguage] = useState<Language>('en');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const login = useCallback((user: User) => {
    try {
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);

        if (user.role === 'student') {
            const existingProgress = getInitialUserProgress(user);
            
            // If progress exists in localStorage, use it. Otherwise, create it from the user object.
            const progress: UserProgress = existingProgress || {
                level: user.level || 1,
                points: user.points || 0,
                badges: [],
                dailyChallengeCompleted: false,
                classLevel: user.classLevel || '6',
                completedTopics: (user as any).completedTopics || [],
            };

            localStorage.setItem(`userProgress_${user.id}`, JSON.stringify(progress));
            setUserProgress(progress);
            setView('dashboard');
        } else {
            // No progress for other roles
            setUserProgress(null);
            if (user.role === 'teacher') {
                setView('teacherDashboard');
            } else if (user.role === 'parent') {
                setView('parentDashboard');
            }
        }
    } catch (error) {
        console.error("Failed to save user data to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
        localStorage.removeItem('currentUser');
        // userProgress is stored by user ID, so we don't need to remove it on logout.
        // It will be inaccessible until that user logs in again.
    } catch (error) {
        console.error("Failed to clear user data from localStorage", error);
    }
    setCurrentUser(null);
    setUserProgress(null);
    setView('login');
  }, []);

  const updateProgress = useCallback((progressUpdate: Partial<UserProgress>) => {
    if (!currentUser) return;

    setUserProgress(prev => {
        if (!prev) return null;
        const newProgress = { ...prev, ...progressUpdate };
        try {
            localStorage.setItem(`userProgress_${currentUser.id}`, JSON.stringify(newProgress));
        } catch (error) {
            console.error("Failed to save progress to localStorage", error);
        }
        return newProgress;
    });
  }, [currentUser]);

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