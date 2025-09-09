// Fix: Added full content for ParentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { getChildrenForParent } from '../services/databaseService';
import { generateStudyPlan } from '../services/geminiService';
import Spinner from './Spinner';
import ContentRenderer from './ContentRenderer';
import type { User } from '../types';

const ParentDashboard: React.FC = () => {
    const { currentUser } = useAppContext();
    const { t } = useLocalization();
    
    const [children, setChildren] = useState<User[]>([]);
    const [isChildrenLoading, setIsChildrenLoading] = useState(true);
    const [studyPlans, setStudyPlans] = useState<{ [key: string]: string }>({});
    const [isLoadingPlan, setIsLoadingPlan] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState<{ [key: string]: string | null }>({});

    useEffect(() => {
        if (currentUser) {
            const fetchChildren = async () => {
                setIsChildrenLoading(true);
                const childrenData = await getChildrenForParent(currentUser.id);
                setChildren(childrenData);
                setIsChildrenLoading(false);
            };
            fetchChildren();
        }
    }, [currentUser]);

    const handleGetStudyPlan = async (child: User) => {
        if (!child.weaknesses || !child.strengths) return;
        setIsLoadingPlan(prev => ({ ...prev, [child.id]: true }));
        setError(prev => ({ ...prev, [child.id]: null }));
        try {
            const result = await generateStudyPlan(child.name, child.weaknesses, child.strengths, 'parent');
            setStudyPlans(prev => ({ ...prev, [child.id]: result }));
        } catch (e) {
            console.error("Failed to get study plan", e);
            setError(prev => ({ ...prev, [child.id]: 'Could not generate study plan. Please try again later.' }));
        } finally {
            setIsLoadingPlan(prev => ({ ...prev, [child.id]: false }));
        }
    };
    
    const formatLastActivity = (activity: any): string => {
        if (!activity) return 'N/A';
        try {
            // Supabase returns timestamps as ISO 8601 strings
            const date = new Date(activity);
            if (isNaN(date.getTime())) {
                // If parsing fails, it might be a pre-formatted string like "4 hours ago"
                return activity.toString();
            }
            const now = new Date();
            const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
            
            if (diffSeconds < 60) return 'Just now';
            const diffMinutes = Math.floor(diffSeconds / 60);
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays}d ago`;
        } catch (e) {
            // Fallback for unexpected formats
            return 'N/A';
        }
    }
    
    if (isChildrenLoading) {
        return <div className="p-10 flex justify-center"><Spinner text="Loading your children's data..." /></div>
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 animate-slide-in-up">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {t('parent')} {t('dashboard')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Welcome, {currentUser?.name}! Track your children's learning journey.
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                {children.map((child, index) => (
                    <div 
                        key={child.id} 
                        className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 flex flex-col justify-between interactive-card animate-slide-in-up"
                        style={{ animationDelay: `${index * 100 + 100}ms` }}
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{child.name}</h3>
                                <span className="text-xs text-slate-500">Last active: {formatLastActivity(child.lastActivity)}</span>
                            </div>
                        
                            <div className="mt-4 space-y-4">
                                <div className="flex justify-around text-center">
                                    <div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Level</div>
                                        <div className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">{child.level}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Points</div>
                                        <div className="font-bold text-2xl text-amber-500">{child.points}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                            <h4 className="font-semibold text-slate-600 dark:text-slate-300 mb-3 text-sm">Personalized Study Plan</h4>
                            {isLoadingPlan[child.id] ? (
                                <div className="flex justify-center"><Spinner text="Generating plan..." /></div>
                            ) : error[child.id] ? (
                                <p className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">{error[child.id]}</p>
                            ) : studyPlans[child.id] ? (
                                <ContentRenderer content={studyPlans[child.id]} />
                            ) : (
                                <button
                                    onClick={() => handleGetStudyPlan(child)}
                                    className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 btn-pressable"
                                    disabled={isLoadingPlan[child.id]}
                                >
                                    Generate AI Study Plan
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParentDashboard;