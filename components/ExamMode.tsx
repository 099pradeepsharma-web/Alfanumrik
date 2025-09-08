// Fix: Added full content for ExamMode.tsx
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { generateQuiz } from '../services/geminiService';
import { speak } from '../services/speechService';
import type { Question } from '../types';
import Spinner from './Spinner';
import ProgressBar from './ProgressBar';
import TutorChat from './TutorChat';
import { MessageSquareHeart } from 'lucide-react';

const EXAM_TOPICS = ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Computer Science', 'General Knowledge'];
const QUESTIONS_PER_EXAM = 5;

const ExamMode: React.FC = () => {
  const { userProgress, updateProgress, showNotification } = useAppContext();
  const { t, currentLang } = useLocalization();

  const [topic, setTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTutorChatOpen, setIsTutorChatOpen] = useState(false);

  const startExam = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setIsLoading(true);
    setError(null);
    try {
      if (!userProgress) {
        throw new Error("User progress is not available");
      }
      const quizQuestions = await generateQuiz(selectedTopic, QUESTIONS_PER_EXAM, userProgress.classLevel);
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsFinished(false);
      setSelectedAnswer(null);
    } catch (e) {
      setError('Failed to generate exam. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishExam();
    }
  };
  
  const finishExam = () => {
      setIsFinished(true);
      if (!userProgress) return;
      
      const pointsPerCorrectAnswer = 20;
      const pointsEarned = score * pointsPerCorrectAnswer;
      updateProgress({ points: userProgress.points + pointsEarned });
      
      showNotification({ message: `Exam finished! You scored ${score}/${questions.length} and earned ${pointsEarned} points.`, icon: '📝' });

      if (score / questions.length >= 0.9 && !userProgress.badges.includes('exam_ace')) {
          const newBadges = [...userProgress.badges, 'exam_ace'];
          updateProgress({ badges: newBadges });
          showNotification({ message: `New Badge Unlocked: Exam Ace!`, icon: '🏆' });
          speak("You are an Exam Ace! What an amazing achievement. Congratulations!", currentLang);
      }
  };

  const resetExam = () => {
    setTopic(null);
    setQuestions([]);
  };

  if (isLoading) {
    return <div className="flex justify-center mt-10"><Spinner text="Preparing your exam..." /></div>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  if (!topic) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold">{t('exam_mode')}</h2>
        <p className="text-slate-500 mt-2">Test your knowledge and earn points!</p>
        <div className="mt-6 grid gap-4">
          {EXAM_TOPICS.map(t => (
            <button key={t} onClick={() => startExam(t)} className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg shadow font-semibold text-lg interactive-card hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
              Start Exam on {t}
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  if (isFinished) {
      return (
          <div className="max-w-2xl mx-auto text-center bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl animate-fade-in">
              <h2 className="text-3xl font-bold">🎉 Exam Complete! 🎉</h2>
              <p className="text-xl mt-4">Your Score: <span className="font-bold text-indigo-600 dark:text-indigo-400">{score} / {questions.length}</span></p>
              <button onClick={resetExam} className="mt-8 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700">
                  Take Another Exam
              </button>
          </div>
      )
  }

  if (questions.length === 0) {
    return <div>No questions available.</div>;
  }
  
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      {isTutorChatOpen && <TutorChat onClose={() => setIsTutorChatOpen(false)} />}
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl animate-slide-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{topic} Exam</h2>
          <div className="text-sm font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</div>
        </div>
        <ProgressBar value={currentQuestionIndex + 1} max={questions.length} />
        <div className="mt-6">
          <h3 className="text-lg font-semibold">{currentQuestion.questionText}</h3>
          <div className="mt-4 space-y-3">
            {currentQuestion.options.map(option => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-colors ';
              if (selectedAnswer) {
                  if (isCorrect) buttonClass += 'bg-green-100 dark:bg-green-900 border-green-500 ';
                  else if (isSelected) buttonClass += 'bg-red-100 dark:bg-red-900 border-red-500 ';
                  else buttonClass += 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600';
              } else {
                  buttonClass += 'bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600';
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={!!selectedAnswer}
                  className={buttonClass}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {selectedAnswer && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <h4 className="font-bold">Explanation</h4>
                  <p className="text-sm mt-1">{currentQuestion.explanation}</p>
              </div>
          )}
          <div className="mt-6 text-right">
            <button onClick={handleNextQuestion} disabled={!selectedAnswer} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow disabled:bg-slate-400 disabled:cursor-not-allowed hover:bg-indigo-700">
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Exam'}
            </button>
          </div>
        </div>
      </div>
      
      <button
          onClick={() => setIsTutorChatOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-40"
          aria-label="Ask AI Tutor for help"
      >
          <MessageSquareHeart className="h-6 w-6" />
      </button>
    </>
  );
};

export default ExamMode;