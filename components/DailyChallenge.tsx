// Fix: Added full content for DailyChallenge.tsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { generateQuiz } from '../services/geminiService';
import { speak } from '../services/speechService';
import { useLocalization } from '../hooks/useLocalization';
import type { Question, UserProgress } from '../types';
import Spinner from './Spinner';

const DailyChallenge: React.FC = () => {
    const { userProgress, updateProgress, showNotification } = useAppContext();
    const { currentLang } = useLocalization();
    const [challenge, setChallenge] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchChallenge = async () => {
            if (userProgress?.dailyChallengeCompleted) {
                setIsLoading(false);
                return;
            }
            try {
                const classLevel = userProgress?.classLevel || '6';
                const questions = await generateQuiz("a random fun fact", 1, classLevel);
                if (questions.length > 0) {
                    setChallenge(questions[0]);
                }
            } catch (error) {
                console.error("Failed to fetch daily challenge", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChallenge();
    }, [userProgress?.dailyChallengeCompleted, userProgress?.classLevel]);

    const handleAnswer = (answer: string) => {
        if (!challenge || !userProgress) return;
        setSelectedAnswer(answer);
        const correct = answer === challenge.correctAnswer;
        setIsCorrect(correct);
        
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
    
    if (!challenge) {
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
            <p className="font-semibold mb-4">{challenge.questionText}</p>
            <div className="space-y-2">
                {challenge.options.map(option => (
                    <button key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={!!selectedAnswer}
                        className={`w-full text-left p-3 rounded-md border transition-colors ${
                            selectedAnswer
                            ? (option === challenge.correctAnswer ? 'bg-green-100 dark:bg-green-900 border-green-400' : (option === selectedAnswer ? 'bg-red-100 dark:bg-red-900 border-red-400' : 'bg-slate-50 dark:bg-slate-700' ) )
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
                    <p className="text-sm mt-1">{challenge.explanation}</p>
                 </div>
            )}
        </div>
    );
};

export default DailyChallenge;