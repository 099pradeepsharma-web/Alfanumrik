// Fix: Added full content for TeacherDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { getStudentsForTeacher } from '../services/databaseService';
import { generateStudyPlan } from '../services/geminiService';
import Spinner from './Spinner';
import ContentRenderer from './ContentRenderer';
import type { User } from '../types';

const TeacherDashboard: React.FC = () => {
    const { currentUser } = useAppContext();
    const { t } = useLocalization();
    
    const [students, setStudents] = useState<User[]>([]);
    const [isStudentsLoading, setIsStudentsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [studyPlan, setStudyPlan] = useState<string | null>(null);
    const [isPlanLoading, setIsPlanLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            const fetchStudents = async () => {
                setIsStudentsLoading(true);
                const studentData = await getStudentsForTeacher(currentUser.id);
                setStudents(studentData);
                setIsStudentsLoading(false);
            };
            fetchStudents();
        }
    }, [currentUser]);

    const handleGetStudyPlan = async (student: User) => {
        if (!student.weaknesses || !student.strengths) return;
        setSelectedStudent(student);
        setIsPlanLoading(true);
        setError(null);
        setStudyPlan(null);
        try {
            const result = await generateStudyPlan(student.name, student.weaknesses, student.strengths, 'teacher');
            setStudyPlan(result);
        } catch (e) {
            console.error("Failed to get study plan", e);
            setError("Failed to generate study plan. Please try again.");
        } finally {
            setIsPlanLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedStudent(null);
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

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 animate-slide-in-up">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {t('teacher')} {t('dashboard')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Welcome, {currentUser?.name}! Here's an overview of your class.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                        Student Overview
                    </h3>
                </div>
                {isStudentsLoading ? (
                    <div className="p-10 flex justify-center">
                        <Spinner text="Loading student data..." />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Student Name</th>
                                    <th scope="col" className="px-6 py-3">Level</th>
                                    <th scope="col" className="px-6 py-3">Points</th>
                                    <th scope="col" className="px-6 py-3">Last Activity</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-150">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">
                                            {student.name}
                                        </th>
                                        <td className="px-6 py-4">{student.level}</td>
                                        <td className="px-6 py-4">{student.points}</td>
                                        <td className="px-6 py-4">{formatLastActivity(student.lastActivity)}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleGetStudyPlan(student)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline btn-pressable">
                                                Generate Study Plan
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
             {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fade-in" onClick={closeModal}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Study Plan for {selectedStudent.name}</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-slate-400 btn-pressable" aria-label="Close modal">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            {isPlanLoading ? (
                                <Spinner text="Generating study plan..." />
                            ) : error ? (
                                <p className="text-red-500">{error}</p>
                            ) : (
                                studyPlan && <ContentRenderer content={studyPlan} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;