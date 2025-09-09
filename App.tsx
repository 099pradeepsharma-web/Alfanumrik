import React, { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LearningModule from './components/LearningModule';
import ExamMode from './components/ExamMode';
import DailyChallenge from './components/DailyChallenge';
import Auth from './components/Auth';
import TeacherDashboard from './components/TeacherDashboard';
import ParentDashboard from './components/ParentDashboard';
import ProfileSettings from './components/ProfileSettings';
import Spinner from './components/Spinner';
import * as authService from './services/authService';

// Notification component
interface NotificationProps {
  message: string;
  icon: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, icon, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-slate-800 shadow-2xl rounded-lg p-4 flex items-center border-l-4 border-indigo-500 animate-fade-in-right max-w-sm">
      <span className="text-3xl mr-4">{icon}</span>
      <div>
        <p className="font-bold text-slate-800 dark:text-slate-100">New Achievement!</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="ml-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400"
        aria-label="Close notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};


const AppContent: React.FC = () => {
    const { view, currentUser, notification, dismissNotification, login, logout } = useAppContext();
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Set up a real-time listener for authentication state
    useEffect(() => {
        const unsubscribe = authService.onAuthUserChanged(user => {
            if (user) {
                login(user);
            } else {
                logout();
            }
            setIsAuthLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [login, logout]);

    const renderView = () => {
        if (isAuthLoading) {
            return (
                <div className="flex justify-center items-center h-screen">
                    <Spinner text="Loading your session..." />
                </div>
            )
        }
        
        if (!currentUser) {
            return <Auth />;
        }

        switch (view) {
            case 'learning':
                return <LearningModule />;
            case 'exam':
                return <ExamMode />;
            case 'challenge':
                return <DailyChallenge />;
            case 'teacherDashboard':
                return <TeacherDashboard />;
            case 'parentDashboard':
                return <ParentDashboard />;
            case 'profileSettings':
                return <ProfileSettings />;
            case 'dashboard':
            default:
                if (currentUser.role === 'teacher') return <TeacherDashboard />;
                if (currentUser.role === 'parent') return <ParentDashboard />;
                return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {currentUser && !isAuthLoading && <Header />}
            {notification && (
                <Notification 
                    message={notification.message}
                    icon={notification.icon}
                    onClose={dismissNotification}
                />
            )}
            <main className="container mx-auto p-4 md:p-6">
                {renderView()}
            </main>
        </div>
    );
}


const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;