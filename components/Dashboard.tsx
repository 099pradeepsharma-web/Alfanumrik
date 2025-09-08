// Fix: Added full content for Dashboard.tsx
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import ProgressBar from './ProgressBar';
import Badge from './Badge';
import DailyChallenge from './DailyChallenge';
import { Star, Check, Lock, BookOpen, MessageSquareHeart } from 'lucide-react';
import { LEARNING_TOPICS } from '../constants';
import TutorChat from './TutorChat';

const Dashboard: React.FC = () => {
  const { currentUser, userProgress, setView, setSelectedTopicId } = useAppContext();
  const { t } = useLocalization();
  const [isTutorChatOpen, setIsTutorChatOpen] = useState(false);

  if (!currentUser || !userProgress) {
    return <div>Loading...</div>;
  }
  
  // This UI logic is based on the existing calculation.
  const pointsForNextLevel = userProgress.level * 100;
  const pointsInCurrentLevel = userProgress.points % pointsForNextLevel;

  const subjects = LEARNING_TOPICS[userProgress.classLevel] || [];

  const handleSubjectClick = (subject: any) => {
    // A subject might not have topics yet.
    const firstTopicId = subject.topics?.[0]?.id;
    if (firstTopicId && setSelectedTopicId) {
      // If there's a topic, set it to be pre-selected in the learning module.
      setSelectedTopicId(firstTopicId);
    }
    // Always navigate to the learning view.
    setView('learning');
  };

  return (
    <div className="space-y-8">
      {isTutorChatOpen && <TutorChat onClose={() => setIsTutorChatOpen(false)} />}
      {/* Welcome Header */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 animate-slide-in-up">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t('dashboard')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Welcome back, {currentUser.name}! Let's keep learning.
        </p>
      </div>

      {/* Main Grid: Progress, Tutor & Daily Challenge */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Enhanced Progress Card */}
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 animate-slide-in-up lg:col-span-2" style={{ animationDelay: '100ms' }}>
          <h3 className="font-bold text-xl text-slate-700 dark:text-slate-200 mb-4">Your Progress</h3>
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('level')}</p>
              <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{userProgress.level}</p>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 h-16"></div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('points')}</p>
              <p className="text-5xl font-bold text-amber-500 flex items-center gap-2">
                <Star className="h-10 w-10 fill-current" />
                {userProgress.points}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <ProgressBar value={pointsInCurrentLevel} max={pointsForNextLevel} />
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold">{pointsInCurrentLevel} / {pointsForNextLevel}</span> XP to next level
            </div>
          </div>
        </div>

        {/* Combined Tutor & Challenge Column */}
        <div className="space-y-8 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            {/* Tutor Card */}
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 text-center interactive-card flex flex-col justify-center items-center">
                <MessageSquareHeart className="h-10 w-10 text-indigo-500 mb-3" />
                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Stuck on a problem?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Get instant help from our AI Tutor.</p>
                <button 
                  onClick={() => setIsTutorChatOpen(true)}
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Talk to a Tutor
                </button>
            </div>
        </div>
      </div>
       <div className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <DailyChallenge />
        </div>
      
      {/* Subjects Section */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 animate-slide-in-up" style={{ animationDelay: '300ms' }}>
        <h3 className="font-bold text-xl text-slate-700 dark:text-slate-200 mb-6">Your Subjects</h3>
        {subjects.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
             {subjects.map((subject: any) => (
                <div 
                  key={subject.id} 
                  className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm interactive-card cursor-pointer"
                  onClick={() => handleSubjectClick(subject)}
                  role="button"
                  aria-label={`Go to ${subject.name}`}
                >
                  <span className="text-5xl mb-4">{subject.icon}</span>
                  <h4 className="font-semibold text-lg text-center text-slate-800 dark:text-slate-100">{subject.name}</h4>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            <p>Your curriculum is being prepared. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Enhanced Badges Section */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 animate-slide-in-up" style={{ animationDelay: '400ms' }}>
        <h3 className="font-bold text-xl text-slate-700 dark:text-slate-200 mb-4">Your Badge Collection</h3>
        {userProgress.badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userProgress.badges.map(badgeId => (
              <Badge key={badgeId} badgeId={badgeId} />
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400 py-12">
            <p className="text-lg">Your collection is empty!</p>
            <p className="mt-2">Complete lessons and quizzes to earn new badges.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;