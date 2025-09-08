import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import type { Language, View } from '../types';
import * as authService from '../services/authService';

const NavButton: React.FC<{ viewName: View; currentView: View; onClick: (view: View) => void; children: React.ReactNode }> = ({ viewName, currentView, onClick, children }) => {
  const isActive = viewName === currentView;
  return (
    <button 
      onClick={() => onClick(viewName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? 'bg-indigo-600 text-white' 
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
};


const Header: React.FC = () => {
  const { userProgress, language, setLanguage, view, setView, currentUser, logout } = useAppContext();
  const { t } = useLocalization();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleLogout = () => {
      authService.logout();
      // The onAuthUserChanged listener will call the context's logout function.
  }

  const handleDashboardClick = () => {
      if (!currentUser) return;
      switch (currentUser.role) {
          case 'teacher': setView('teacherDashboard'); break;
          case 'parent': setView('parentDashboard'); break;
          default: setView('dashboard');
      }
  }

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            <span role="img" aria-label="brain">🧠</span> AlfaNumric
          </h1>
          {currentUser && (
            <nav className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={handleDashboardClick} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    ['dashboard', 'teacherDashboard', 'parentDashboard'].includes(view)
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>{t('dashboard')}</button>
                {currentUser.role === 'student' && (
                    <>
                        <NavButton viewName="learning" currentView={view} onClick={setView} >{t('learning_zone')}</NavButton>
                        <NavButton viewName="exam" currentView={view} onClick={setView} >{t('exam_mode')}</NavButton>
                    </>
                )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {currentUser && userProgress && (
            <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                    <div className="font-bold text-slate-700 dark:text-slate-200">{currentUser.name}</div>
                    <div className="text-xs text-slate-500">{t(currentUser.role)}</div>
                </div>
                {currentUser.role === 'student' && (
                    <>
                        <div className="text-center">
                            <div className="font-bold text-slate-700 dark:text-slate-200">{userProgress.points}</div>
                            <div className="text-xs text-slate-500">{t('points')}</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-700 dark:text-slate-200">{userProgress.level}</div>
                            <div className="text-xs text-slate-500">{t('level')}</div>
                        </div>
                    </>
                )}
                <div className="border-l border-slate-300 dark:border-slate-600 h-8"></div>
            </div>
          )}
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
          {currentUser && (
             <button onClick={handleLogout} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">{t('logout')}</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;