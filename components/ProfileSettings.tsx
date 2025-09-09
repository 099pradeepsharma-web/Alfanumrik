import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { updateUserProfile } from '../services/databaseService';
import type { Role, User } from '../types';
import { CLASS_LEVELS } from '../constants';
import Spinner from './Spinner';
import { ArrowLeft, Send } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const ProfileSettings: React.FC = () => {
    const { currentUser, login, setView } = useAppContext();
    
    const [name, setName] = useState(currentUser?.name || '');
    const [role, setRole] = useState<Role>(currentUser?.role || 'student');
    const [classLevel, setClassLevel] = useState(currentUser?.classLevel || '6');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setRole(currentUser.role);
            setClassLevel(currentUser.classLevel || '6');
        }
    }, [currentUser]);

    if (!currentUser) {
        // This should not happen if the component is rendered correctly
        return <div className="p-10 text-center">Please log in to view settings.</div>;
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const updates: Partial<User> = { name, role };
        if (role === 'student') {
            updates.classLevel = classLevel;
        }

        try {
            const updatedUser = await updateUserProfile(currentUser.id, updates);
            if (updatedUser) {
                login(updatedUser); // Refresh context
                setSuccess('Profile updated successfully!');
                setTimeout(() => {
                    // Navigate back to the appropriate dashboard after showing success
                    switch(updatedUser.role) {
                        case 'teacher': setView('teacherDashboard'); break;
                        case 'parent': setView('parentDashboard'); break;
                        default: setView('dashboard');
                    }
                }, 1500);
            } else {
                throw new Error('Failed to get updated user data.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDashboardReturn = () => {
        switch(currentUser.role) {
            case 'teacher': setView('teacherDashboard'); break;
            case 'parent': setView('parentDashboard'); break;
            default: setView('dashboard');
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl animate-slide-in-up">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={handleDashboardReturn} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors btn-pressable" aria-label="Back to dashboard">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-3xl font-bold">Profile Settings</h2>
                </div>
                
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Your Role</label>
                        <select id="role" value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200">
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="parent">Parent</option>
                        </select>
                    </div>
                    
                    {role === 'student' && (
                        <div className="animate-fade-in">
                            <label htmlFor="classLevel" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Class Level</label>
                            <select id="classLevel" value={classLevel} onChange={e => setClassLevel(e.target.value)} className="mt-1 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200">
                                {CLASS_LEVELS.map(level => <option key={level} value={level}>Class {level}</option>)}
                            </select>
                        </div>
                    )}
                    
                    {error && <p className="text-sm text-red-500 text-center bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}
                    {success && <p className="text-sm text-green-600 dark:text-green-400 text-center bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">{success}</p>}

                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="flex justify-center items-center px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed btn-pressable min-w-[120px]"
                        >
                            {isLoading ? <Spinner /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                <h3 className="text-xl font-bold">Feedback</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    Have a suggestion or found a bug? Let us know!
                </p>
                <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 btn-pressable"
                >
                    <Send className="h-4 w-4" />
                    Send Feedback
                </button>
            </div>

            {isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />}
        </div>
    );
};

export default ProfileSettings;
