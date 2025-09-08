// Fix: Added full content for ParentDashboard.tsx
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { MOCKED_CHILDREN } from '../constants';
import ProgressBar from './ProgressBar';
import { generateStudyPlan } from '../services/geminiService';
import Spinner from './Spinner';
import ContentRenderer from './ContentRenderer';

type Child = typeof MOCKED_CHILDREN[0];

const ParentDashboard: React.FC = () => {
    const { currentUser } = useAppContext();
    const { t } = useLocalization();
    
    const [studyPlans, setStudyPlans] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState<{ [key: string]: string | null }>({});
    
    const children = MOCKED_CHILDREN;

    const handleGetStudyPlan = async (child: Child) => {
        setIsLoading(prev => ({ ...prev, [child.id]: true }));
        setError(prev => ({ ...prev, [child.id]: null }));
        try {
            const result = await generateStudyPlan(child.name, child.weaknesses, child.strengths, 'parent');
            setStudyPlans(prev => ({ ...prev, [child.id]: result }));
        } catch (e) {
            console.error("Failed to get study plan", e);
            setError(prev => ({ ...prev, [child.id]: 'Could not generate study plan. Please try again later.' }));
        } finally {
            setIsLoading(prev => ({ ...prev, [child.id]: false }));
        }
    };

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
                                <span className="text-xs text-slate-500">Last active: {child.lastActivity}</span>
                            </div>
                        
                            <div className="mt-4 space-y-4">
                                <div className="flex justify-between text-sm font-semibold">
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Level: </span>
                                        <span className="text-indigo-600 dark:text-indigo-400">{child.level}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Points: </span>
                                        <span className="text-indigo-600 dark:text-indigo-400">{child.points}</span>
                                    </div>
                                </div>
                                <ProgressBar value={child.progress} max={100} label="Overall Course Progress"/>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                            <h4 className="font-semibold text-slate-600 dark:text-slate-300 mb-3 text-sm">Personalized Study Plan</h4>
                            {isLoading[child.id] ? (
                                <div className="flex justify-center"><Spinner text="Generating plan..." /></div>
                            ) : error[child.id] ? (
                                <p className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">{error[child.id]}</p>
                            ) : studyPlans[child.id] ? (
                                <ContentRenderer content={studyPlans[child.id]} />
                            ) : (
                                <button
                                    onClick={() => handleGetStudyPlan(child)}
                                    className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400"
                                    disabled={isLoading[child.id]}
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