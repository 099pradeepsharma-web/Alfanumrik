// Fix: Added full content for ExamMode.tsx
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { generateQuiz, generateEssayPrompt, provideEssayFeedback, generateSummary } from '../services/geminiService';
import { speak } from '../services/speechService';
import type { Question } from '../types';
import Spinner from './Spinner';
import ProgressBar from './ProgressBar';
import TutorChat from './TutorChat';
import ContentRenderer from './ContentRenderer';
import { MessageSquareHeart, Edit, FileText, X, BookCopy, ChevronDown } from 'lucide-react';
import { LEARNING_TOPICS } from '../constants';

const EXAM_TOPICS = ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Computer Science', 'General Knowledge'];
const QUESTIONS_PER_EXAM = 5;

const SummaryModal: React.FC<{
  onClose: () => void;
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  title: string;
}> = ({ onClose, summary, isLoading, error, title }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-slate-400 btn-pressable" aria-label="Close modal">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner text="Generating summary..." />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : summary ? (
            <ContentRenderer content={summary} />
          ) : (
            <p className="text-slate-500 text-center">No summary available.</p>
          )}
        </div>
      </div>
    </div>
  );
};


const ExamMode: React.FC = () => {
  const { userProgress, updateProgress, showNotification } = useAppContext();
  const { t, currentLang } = useLocalization();

  const [mode, setMode] = useState<'selection' | 'quiz' | 'writing'>('selection');
  const [topic, setTopic] = useState<string | null>(null);
  
  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Writing practice state
  const [writingPrompt, setWritingPrompt] = useState<string | null>(null);
  const [essayText, setEssayText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTutorChatOpen, setIsTutorChatOpen] = useState(false);

  // New state for topic selection UI
  const [activeSelectionType, setActiveSelectionType] = useState<'quiz' | 'writing' | null>(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);

  // New state for summary
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const startQuiz = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setIsLoading(true);
    setError(null);
    try {
      if (!userProgress) throw new Error("User progress is not available");
      const quizQuestions = await generateQuiz(selectedTopic, QUESTIONS_PER_EXAM, userProgress.classLevel);
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsFinished(false);
      setSelectedAnswer(null);
      setMode('quiz');
    } catch (e) {
      setError('Failed to generate exam. Please try again.');
      console.error(e);
      setMode('selection');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startWritingPractice = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setIsGeneratingPrompt(true);
    setError(null);
    setMode('writing');
    try {
        if (!userProgress) throw new Error("User progress not available");
        const prompt = await generateEssayPrompt(selectedTopic, userProgress.classLevel);
        setWritingPrompt(prompt);
    } catch (e) {
        setError('Failed to generate a writing prompt. Please try again.');
        console.error(e);
        setMode('selection');
    } finally {
        setIsGeneratingPrompt(false);
    }
  };

  const handleSubmitEssay = async () => {
    if (!writingPrompt || !essayText.trim() || !userProgress) return;
    setIsGeneratingFeedback(true);
    setError(null);
    try {
        const generatedFeedback = await provideEssayFeedback(writingPrompt, essayText, userProgress.classLevel);
        setFeedback(generatedFeedback);
        
        const pointsEarned = 150;
        updateProgress({ points: userProgress.points + pointsEarned });
        showNotification({ message: `Great work! You earned ${pointsEarned} points for completing the writing practice.`, icon: '✍️' });

    } catch(e) {
        setError('Sorry, we couldn\'t generate feedback for your essay right now.');
        console.error(e);
    } finally {
        setIsGeneratingFeedback(false);
    }
  };

  const handleGenerateSummary = async (contentToSummarize: string) => {
    if (!contentToSummarize || !userProgress) return;
    setIsSummaryModalOpen(true);
    setSummaryText(null);
    setSummaryError(null);
    setIsSummaryLoading(true);

    try {
        const summary = await generateSummary(contentToSummarize, userProgress.classLevel);
        setSummaryText(summary);
    } catch (e: any) {
        setSummaryError(e.message || "Failed to generate summary.");
    } finally {
        setIsSummaryLoading(false);
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
    setMode('selection');
    setTopic(null);
    setQuestions([]);
    setWritingPrompt(null);
    setEssayText('');
    setFeedback(null);
    setError(null);
    // Reset new state
    setActiveSelectionType(null);
    setSelectedSubjectName(null);
    setIsSummaryModalOpen(false);
    setSummaryText(null);
  };

  const handleSubjectSelect = (subjectName: string, type: 'quiz' | 'writing') => {
      if (selectedSubjectName === subjectName && activeSelectionType === type) {
          setSelectedSubjectName(null);
          setActiveSelectionType(null);
      } else {
          setSelectedSubjectName(subjectName);
          setActiveSelectionType(type);
      }
  };

  const renderSelectionScreen = () => {
    const subjectsForClass = userProgress ? LEARNING_TOPICS[userProgress.classLevel] || [] : [];

    const renderTopicSelector = (type: 'quiz' | 'writing') => {
      return (
        <div className="space-y-2">
          {EXAM_TOPICS.map(subjectName => {
            const subjectData = subjectsForClass.find(s => s.name === subjectName);
            if (!subjectData || subjectData.topics.length === 0) return null;

            const isExpanded = activeSelectionType === type && selectedSubjectName === subjectName;

            return (
              <div key={`${type}-${subjectName}`}>
                <button
                  onClick={() => handleSubjectSelect(subjectName, type)}
                  className="w-full flex justify-between items-center text-left p-3 bg-slate-100 dark:bg-slate-700 rounded-md interactive-card hover:bg-indigo-100 dark:hover:bg-slate-600 btn-pressable"
                >
                  <span>{subjectName}</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="animate-fade-in mt-1 pl-6 pr-2 py-2 space-y-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                    {subjectData.topics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => type === 'quiz' ? startQuiz(topic.name) : startWritingPractice(topic.name)}
                        className="w-full text-left text-sm p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-600 btn-pressable"
                      >
                        {topic.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    };

    return (
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold">{t('exam_mode')}</h2>
            <p className="text-slate-500 mt-2">Test your knowledge and practice your skills!</p>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                    <FileText className="h-12 w-12 text-indigo-500 mb-4 mx-auto" />
                    <h3 className="font-semibold text-xl">Multiple Choice Quiz</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Select a subject to see available topics.</p>
                    {renderTopicSelector('quiz')}
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                    <Edit className="h-12 w-12 text-teal-500 mb-4 mx-auto" />
                    <h3 className="font-semibold text-xl">Writing Practice</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Select a subject to get a prompt.</p>
                    {renderTopicSelector('writing')}
                </div>
            </div>
        </div>
    );
  };

  const renderQuizMode = () => {
    if (isLoading) {
        return <div className="flex justify-center mt-10"><Spinner text="Preparing your quiz..." /></div>;
    }
  
    if (isFinished) {
        return (
            <div className="max-w-2xl mx-auto text-center bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl animate-fade-in">
                <h2 className="text-3xl font-bold">🎉 Quiz Complete! 🎉</h2>
                <p className="text-xl mt-4">Your Score: <span className="font-bold text-indigo-600 dark:text-indigo-400">{score} / {questions.length}</span></p>
                <button onClick={resetExam} className="mt-8 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 btn-pressable">
                    Back to Exam Mode
                </button>
            </div>
        )
    }

    if (questions.length === 0) {
        return <div>No questions available. Try another topic.</div>;
    }
  
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl animate-slide-in-up">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{topic} Quiz</h2>
                <div className="text-sm font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</div>
            </div>
            <ProgressBar value={currentQuestionIndex + 1} max={questions.length} />
            <div className="mt-6">
                <h3 className="text-lg font-semibold">{currentQuestion.questionText}</h3>
                <div className="mt-4 space-y-3">
                    {currentQuestion.options.map(option => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentQuestion.correctAnswer;
                    let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-colors btn-pressable ';
                    if (selectedAnswer) {
                        if (isCorrect) buttonClass += 'bg-green-100 dark:bg-green-900 border-green-500 animate-correct-pulse';
                        else if (isSelected) buttonClass += 'bg-red-100 dark:bg-red-900 border-red-500 animate-shake';
                        else buttonClass += 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600';
                    } else {
                        buttonClass += 'bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600';
                    }

                    return (
                        <button key={option} onClick={() => handleAnswerSelect(option)} disabled={!!selectedAnswer} className={buttonClass}>
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
                    <button onClick={handleNextQuestion} disabled={!selectedAnswer} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow disabled:bg-slate-400 disabled:cursor-not-allowed hover:bg-indigo-700 btn-pressable">
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const renderWritingMode = () => {
    if (isGeneratingPrompt) {
        return <div className="flex justify-center mt-10"><Spinner text="Generating your writing prompt..." /></div>;
    }
    
    if (!writingPrompt) {
        return <p className="text-center text-slate-500 mt-10">Could not load a prompt. Please go back and try another topic.</p>
    }

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl animate-slide-in-up space-y-6">
            <div>
                <button onClick={resetExam} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-4">
                    Back to Exam Mode
                </button>
                <h2 className="text-xl font-bold">Writing Practice: {topic}</h2>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Your Prompt:</h3>
                <p className="mt-2 text-lg italic">"{writingPrompt}"</p>
            </div>
            
            <textarea
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Start writing your essay here..."
                className="w-full h-64 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                disabled={isGeneratingFeedback || !!feedback}
            />

            {!feedback && (
                <div className="text-right">
                    <button 
                        onClick={handleSubmitEssay} 
                        disabled={!essayText.trim() || isGeneratingFeedback}
                        className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow disabled:bg-slate-400 disabled:cursor-not-allowed hover:bg-teal-700 btn-pressable"
                    >
                        {isGeneratingFeedback ? 'Analyzing...' : 'Submit for Feedback'}
                    </button>
                </div>
            )}

            {isGeneratingFeedback && <div className="flex justify-center"><Spinner text="Your AI teacher is reviewing your work..." /></div>}
            
            {feedback && (
                <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold">Feedback from your AI Teacher</h3>
                        <button 
                            onClick={() => handleGenerateSummary(feedback)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-sky-700 bg-sky-100 rounded-lg hover:bg-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:hover:bg-sky-900 btn-pressable"
                        >
                            <BookCopy className="h-4 w-4" />
                            Summarize
                        </button>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <ContentRenderer content={feedback} />
                    </div>
                </div>
            )}
        </div>
    );
  };

  const renderContent = () => {
    if (error) {
        return <p className="text-center text-red-500 mt-10">{error}</p>;
    }

    switch (mode) {
        case 'quiz':
            return renderQuizMode();
        case 'writing':
            return renderWritingMode();
        case 'selection':
        default:
            return renderSelectionScreen();
    }
  }

  return (
    <>
      {isSummaryModalOpen && (
        <SummaryModal 
            onClose={() => setIsSummaryModalOpen(false)}
            summary={summaryText}
            isLoading={isSummaryLoading}
            error={summaryError}
            title="Feedback Summary"
        />
      )}
      {isTutorChatOpen && <TutorChat onClose={() => setIsTutorChatOpen(false)} />}
      {renderContent()}
      
      {mode !== 'selection' && (
        <button
            onClick={() => setIsTutorChatOpen(true)}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-40"
            aria-label="Ask AI Tutor for help"
        >
            <MessageSquareHeart className="h-6 w-6" />
        </button>
      )}
    </>
  );
};

export default ExamMode;