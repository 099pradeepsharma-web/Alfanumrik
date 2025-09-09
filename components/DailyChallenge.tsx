import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { generateQuiz } from '../services/geminiService';
import { speak } from '../services/speechService';
import { useLocalization } from '../hooks/useLocalization';
import type { Question, UserProgress } from '../types';
import Spinner from './Spinner';

const DailyChallenge: React.FC = () => {
    const { 
        userProgress, 
        updateProgress, 
        showNotification,
        dailyChallenge,
        setDailyChallenge,
        dailyChallengeFetched,
        setDailyChallengeFetched,
    } = useAppContext();
    const { currentLang } = useLocalization();
    const [isLoading, setIsLoading] = useState(!dailyChallengeFetched && !userProgress?.dailyChallengeCompleted);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fetchingRef = useRef(false);

    useEffect(() => {
        const fetchChallenge = async () => {
            if (userProgress?.dailyChallengeCompleted || dailyChallengeFetched || fetchingRef.current) {
                setIsLoading(false);
                return;
            }
            
            fetchingRef.current = true;
            setIsLoading(true);
            setError(null);

            try {
                const classLevel = userProgress?.classLevel || '6';
                const questions = await generateQuiz("a random fun fact", 1, classLevel);
                if (questions.length > 0) {
                    setDailyChallenge(questions[0]);
                } else {
                    throw new Error("The AI did not return a question for the challenge.");
                }
            } catch (err) {
                console.error("Failed to fetch daily challenge", err);
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(errorMessage);
                setDailyChallenge(null);
            } finally {
                setDailyChallengeFetched(true);
                setIsLoading(false);
            }
        };

        fetchChallenge();
    }, [userProgress, dailyChallengeFetched, setDailyChallenge, setDailyChallengeFetched]);

    const handleAnswer = (answer: string) => {
        if (!dailyChallenge || !userProgress) return;
        setSelectedAnswer(answer);
        const correct = answer === dailyChallenge.correctAnswer;
        
        if (correct) {
            const pointsEarned = 100;
            const updates: Partial<UserProgress> = {
                points: userProgress.points + pointsEarned,
                dailyChallengeCompleted: true,
            };

            // Award badge on first successful completion
            if (!userProgress.badges.includes('daily_streak')) {
                updates.badges = [...userProgress.badges, 'daily_streak'];
                updateProgress(updates);
                showNotification({ message: `New Badge Unlocked: Daily Challenger! You earned ${pointsEarned} points!`, icon: '🔥' });
                speak(`Wow, you've earned the Daily Challenger badge! Keep this amazing streak going!`, currentLang);
            } else {
                updateProgress(updates);
                showNotification({ message: `Challenge complete! You earned ${pointsEarned} points!`, icon: '🌟' });
                speak(`Another daily challenge complete! Fantastic work.`, currentLang);
            }
        } else {
             updateProgress({
                dailyChallengeCompleted: true,
            });
             showNotification({ message: `Challenge complete! Better luck next time.`, icon: '💪' });
        }
    };
    
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 text-center">
                 <Spinner text="Loading Daily Challenge..."/>
            </div>
        );
    }

    if (userProgress?.dailyChallengeCompleted && !selectedAnswer) {
        return (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 text-center">
                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-2">Daily Challenge Complete!</h3>
                <p className="text-slate-500 dark:text-slate-400">Great job! Come back tomorrow for a new challenge.</p>
                <span className="text-5xl mt-4 inline-block">✅</span>
            </div>
        );
    }

    if (error) {
        return (
             <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 text-center">
                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-2">Daily Challenge Error</h3>
                <p className="text-slate-500 dark:text-slate-400 px-4">{error}</p>
            </div>
        )
    }
    
    if (!dailyChallenge) {
        return (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 text-center">
                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-2">Daily Challenge</h3>
                <p className="text-slate-500 dark:text-slate-400">Could not load the challenge. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-4">Daily Challenge</h3>
            <p className="font-semibold mb-4">{dailyChallenge.questionText}</p>
            <div className="space-y-2">
                {dailyChallenge.options.map(option => (
                    <button key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={!!selectedAnswer}
                        className={`w-full text-left p-3 rounded-md border transition-colors btn-pressable ${
                            selectedAnswer
                            ? (option === dailyChallenge.correctAnswer 
                                ? 'bg-green-100 dark:bg-green-900 border-green-400 animate-correct-pulse' 
                                : (option === selectedAnswer 
                                    ? 'bg-red-100 dark:bg-red-900 border-red-400 animate-shake' 
                                    : 'bg-slate-50 dark:bg-slate-700' ) )
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {selectedAnswer && (
                 <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <h4 className="font-bold">Explanation</h4>
                    <p className="text-sm mt-1">{dailyChallenge.explanation}</p>
                 </div>
            )}
        </div>
    );
};

export default DailyChallenge;