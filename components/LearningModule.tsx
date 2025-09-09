import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { generateLearningContent, generateQuiz, generateImageFromPrompt, generateFlashcards, generateDiagnosticQuiz, analyzeDiagnosticResults, generateSummary } from '../services/geminiService';
import { speak } from '../services/speechService';
import type { LearningContent, Question, Subject, Topic } from '../types';
import Spinner from './Spinner';
import ProgressBar from './ProgressBar';
import { LEARNING_TOPICS } from '../constants';
import { RefreshCw, Trophy, Undo2, Check, X, Image as ImageIcon, Layers, Volume2, FileText, FilePenLine, File, BookOpen, Lock, BrainCircuit, List, Lightbulb, Target, ArrowRight, Home, BookCopy, Clock, ArrowLeft } from 'lucide-react';
import ContentRenderer from './ContentRenderer';

// #region --- TYPES ---
type ViewMode = 'loading' | 'diagnostic' | 'dashboard' | 'topic';
type DashboardView = 'plan' | 'subjects';
type PlanReason = 'Weakness' | 'Next Step' | 'Strength' | 'Review';
// Fix: The `topic` in a `FocusItem` needs to include `subjectName` for display purposes.
// This resolves the TypeScript error where `subjectName` was accessed on a plain `Topic` type.
type FocusItem = { topic: Topic & { subjectName: string }; reason: PlanReason };
// #endregion

// The original file was truncated. This is a full implementation based on the surrounding app context to fix the missing default export error.

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


// #region --- SUB-COMPONENT: TopicView ---
const TopicView: React.FC<{
  topic: Topic;
  onBack: () => void;
  onComplete: (topicId: string) => void;
}> = ({ topic, onBack, onComplete }) => {
  const { currentUser, userProgress, showNotification, updateProgress } = useAppContext();
  const { currentLang } = useLocalization();
  const [content, setContent] = useState<LearningContent | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [flashcards, setFlashcards] = useState<{ term: string; definition: string }[] | null>(null);
  const [currentTool, setCurrentTool] = useState<'content' | 'quiz' | 'flashcards'>('content');
  const [error, setError] = useState<string | null>(null);

  // States for quiz interaction
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // New state for summary
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);


  useEffect(() => {
    const loadContent = async () => {
      if (!userProgress) return;
      setError(null);
      setContent(null);
      setImages([]);
      try {
        const generatedContent = await generateLearningContent(topic.id, topic.name, userProgress.classLevel);
        setContent(generatedContent);
        speak(`Let's learn about ${topic.name}.`, currentLang);

        if (generatedContent.imagePrompts && generatedContent.imagePrompts.length > 0) {
            setIsImageLoading(true);
            try {
                const imagePromises = generatedContent.imagePrompts.map(p => generateImageFromPrompt(p));
                const generatedImages = await Promise.all(imagePromises);
                setImages(generatedImages);
            } catch (imgError) {
                console.error("Failed to generate images:", imgError);
                // Non-blocking error for the user
            } finally {
                setIsImageLoading(false);
            }
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load learning content.');
      }
    };
    loadContent();
  }, [topic, userProgress, currentLang]);

  const handleGenerateQuiz = async () => {
    if (!userProgress) return;
    setError(null);
    setCurrentTool('quiz');
    if (quiz) return; // Don't regenerate if it exists

    try {
        const questions = await generateQuiz(topic.name, 3, userProgress.classLevel);
        setQuiz(questions);
    } catch (e: any) {
        setError(e.message || "Failed to generate quiz.");
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!content) return;
    setError(null);
    setCurrentTool('flashcards');
    if (flashcards) return; // Don't regenerate if it exists
    
    try {
        const cards = await generateFlashcards(content.content, topic.name, userProgress.classLevel || '6');
        setFlashcards(cards);
    } catch (e: any) {
        setError(e.message || "Failed to generate flashcards.");
    }
  };

  const handleGenerateSummary = async () => {
    if (!content || !userProgress) return;
    setIsSummaryModalOpen(true);
    setSummaryText(null);
    setSummaryError(null);
    setIsSummaryLoading(true);

    try {
        const summary = await generateSummary(content.content, userProgress.classLevel);
        setSummaryText(summary);
    } catch (e: any) {
        setSummaryError(e.message || "Failed to generate summary.");
    } finally {
        setIsSummaryLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (!quiz) return;
    setSelectedAnswer(answer);
    if (answer === quiz[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsQuizFinished(true);
      if (userProgress) {
        const points = (score / quiz.length) * 50; // Award points
        updateProgress({ points: userProgress.points + points });
        showNotification({ message: `You earned ${points} points from the quiz!`, icon: '🎯' });
      }
    }
  };

  const finishTopic = () => {
    onComplete(topic.id);
  };
  
  if (!content) {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            {error ? <p className="text-red-500">{error}</p> : <Spinner text={`Generating your lesson on ${topic.name}...`} />}
            <button onClick={onBack} className="mt-6 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                Back to Learning Plan
            </button>
        </div>
    );
  }
  
  // Quiz rendering logic
  const renderQuiz = () => {
    if (!quiz) return <div className="flex justify-center p-8"><Spinner text="Building your quiz..." /></div>;
    if (isQuizFinished) return (
        <div className="text-center p-8">
            <h3 className="text-2xl font-bold">Quiz Complete!</h3>
            <p className="mt-2">You scored {score}/{quiz.length}</p>
            <button onClick={() => setCurrentTool('content')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg btn-pressable">
                Back to Lesson
            </button>
        </div>
    );
    const currentQuestion = quiz[currentQuestionIndex];
    return (
        <div className="p-4 md:p-6">
            <h3 className="font-bold text-lg mb-4">{currentQuestion.questionText}</h3>
            <div className="space-y-2">
                {currentQuestion.options.map(opt => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = opt === currentQuestion.correctAnswer;
                    let btnClass = 'w-full text-left p-3 rounded-md border btn-pressable ';
                    if (selectedAnswer) {
                        if (isCorrect) btnClass += 'bg-green-100 dark:bg-green-900 border-green-400 animate-correct-pulse';
                        else if (isSelected) btnClass += 'bg-red-100 dark:bg-red-900 border-red-400 animate-shake';
                        else btnClass += 'bg-slate-50 dark:bg-slate-700';
                    } else {
                        btnClass += 'bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100';
                    }
                    return <button key={opt} onClick={() => handleAnswerSelect(opt)} disabled={!!selectedAnswer} className={btnClass}>{opt}</button>
                })}
            </div>
            {selectedAnswer && (
                 <div className="mt-4 text-right">
                    <button onClick={handleNextQuestion} className="px-6 py-2 bg-indigo-600 text-white rounded-lg btn-pressable">Next</button>
                 </div>
            )}
        </div>
    );
  }
  
  // Flashcard rendering logic
  const renderFlashcards = () => {
    if (!flashcards) return <div className="flex justify-center p-8"><Spinner text="Creating flashcards..." /></div>;
    return (
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards.map(card => (
                <div key={card.term} className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400">{card.term}</h4>
                    <p className="text-sm mt-1">{card.definition}</p>
                </div>
            ))}
        </div>
    );
  }

  return (
    <>
      {isSummaryModalOpen && (
        <SummaryModal 
            onClose={() => setIsSummaryModalOpen(false)}
            summary={summaryText}
            isLoading={isSummaryLoading}
            error={summaryError}
            title="Lesson Summary"
        />
      )}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg animate-fade-in">
          <header className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                  <button onClick={onBack} className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline btn-pressable">
                      <Undo2 className="h-4 w-4 mr-1" />
                      Back to Plan
                  </button>
                  <h2 className="text-2xl font-bold mt-1">{topic.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => speak(content.content, currentLang)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors btn-pressable" aria-label="Read text aloud">
                      <Volume2 className="h-5 w-5" />
                  </button>
                  <button onClick={finishTopic} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 flex items-center gap-2 btn-pressable">
                      <Check className="h-5 w-5"/>
                      Mark as Complete
                  </button>
              </div>
          </header>

          <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-3/4 p-4 md:p-6">
                  {currentTool === 'content' && <ContentRenderer content={content.content} />}
                  {currentTool === 'quiz' && renderQuiz()}
                  {currentTool === 'flashcards' && renderFlashcards()}
              </div>
              <aside className="w-full md:w-1/4 p-4 md:p-6 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-lg mb-4">Learning Tools</h3>
                  <div className="space-y-2">
                      <button onClick={() => setCurrentTool('content')} className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-left btn-pressable"><BookOpen className="h-5 w-5 text-indigo-500"/> Lesson</button>
                      <button onClick={handleGenerateQuiz} className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-left btn-pressable"><FileText className="h-5 w-5 text-teal-500"/> Practice Quiz</button>
                      <button onClick={handleGenerateFlashcards} className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-left btn-pressable"><Layers className="h-5 w-5 text-amber-500"/> Flashcards</button>
                      <button onClick={handleGenerateSummary} className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-left btn-pressable"><BookCopy className="h-5 w-5 text-sky-500"/> Summarize Lesson</button>
                  </div>
                   <div className="mt-6">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <ImageIcon className="h-5 w-5" />
                          Visual Aids
                      </h4>
                      {isImageLoading ? (
                          <div className="flex justify-center items-center h-24">
                              <Spinner text="Creating image..."/>
                          </div>
                      ) : images.length > 0 ? (
                          <div className="space-y-3">
                          {images.map((img, i) => (
                              <img 
                                  key={i} 
                                  src={img} 
                                  alt={`AI generated visual aid ${i + 1} for ${topic.name}`} 
                                  className="rounded-lg shadow-md w-full border border-slate-200 dark:border-slate-700"
                              />
                          ))}
                          </div>
                      ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                             No visual aids for this topic.
                          </p>
                      )}
                   </div>
              </aside>
          </div>
      </div>
    </>
  );
};
// #endregion

// #region --- SUB-COMPONENT: LearningDashboard ---
const LearningDashboard: React.FC<{
    onSelectTopic: (topic: Topic) => void;
    onStartDiagnostic: () => void;
}> = ({ onSelectTopic, onStartDiagnostic }) => {
    const { userProgress } = useAppContext();

    const subjects = LEARNING_TOPICS[userProgress?.classLevel || '6'] || [];
    const allTopics = useMemo(() => subjects.flatMap(s => s.topics.map(t => ({...t, subjectName: s.name}))), [subjects]);

    const learningPlan = useMemo<FocusItem[]>(() => {
        if (!userProgress) return [];
        const plan: FocusItem[] = [];
        const { weaknesses, strengths, completedTopics } = userProgress;

        // Add weaknesses first
        weaknesses?.forEach(id => {
            const topic = allTopics.find(t => t.id === id);
            if (topic) plan.push({ topic, reason: 'Weakness' });
        });

        // Add next logical topics
        const nextTopics = allTopics.filter(t => 
            !completedTopics.includes(t.id) &&
            t.prerequisites?.every(p => completedTopics.includes(p))
        );
        if(nextTopics.length > 0) plan.push({ topic: nextTopics[0], reason: 'Next Step' });

        // Add a strength to revise
        strengths?.forEach(id => {
            const topic = allTopics.find(t => t.id === id);
            if (topic && completedTopics.includes(id)) plan.push({ topic, reason: 'Strength' });
        });

        return Array.from(new Map(plan.map(item => [item.topic.id, item])).values()).slice(0, 5);
    }, [userProgress, allTopics]);

    const renderReason = (reason: PlanReason) => {
        switch(reason) {
            case 'Weakness': return <span className="text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 px-2 py-1 rounded-full">Focus Area</span>;
            case 'Next Step': return <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-2 py-1 rounded-full">Next Up</span>;
            case 'Strength': return <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 px-2 py-1 rounded-full">Revise</span>;
            default: return null;
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6">
                <h2 className="text-3xl font-bold">Learning Zone</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Your personalized path to mastery.</p>
                <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <button onClick={onStartDiagnostic} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-2 btn-pressable">
                        <BrainCircuit className="h-5 w-5" /> Retake Diagnostic Test
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 animate-fade-in">
                 <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Your Personalized Plan</h3>
                 {learningPlan.length > 0 ? (
                    <div className="space-y-3">
                        {learningPlan.map(({ topic, reason }) => (
                            <div key={topic.id} onClick={() => onSelectTopic(topic)} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 interactive-card">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{topic.icon}</span>
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">{topic.name}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{topic.subjectName}</p>
                                    </div>
                                </div>
                                {renderReason(reason)}
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <p>Your personalized plan will appear here after you complete the diagnostic test.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};
// #endregion

// #region --- SUB-COMPONENT: DiagnosticQuiz ---
const DiagnosticQuiz: React.FC<{
    onComplete: (strengths: string[], weaknesses: string[]) => void;
}> = ({ onComplete }) => {
    const { userProgress } = useAppContext();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const TOTAL_QUESTIONS = 25;
    const QUIZ_DURATION_SECONDS = 25 * 60; // 25 minutes

    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
    const timerRef = useRef<number | null>(null);
    const isMounted = useRef(true);
    const quizStarted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const finishQuiz = useCallback(async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (isAnalyzing) return;

        if (isMounted.current) {
            setIsAnalyzing(true);
            setError(null);
        }
        
        const answeredQuestions = questions.filter(q => answers[q.id]);
        if (answeredQuestions.length === 0) {
            onComplete([], []);
            return;
        }

        const results = answeredQuestions.map(q => ({
            question: q,
            userAnswer: answers[q.id],
        }));
        
        try {
            const { strengths, weaknesses } = await analyzeDiagnosticResults(results);
            onComplete(strengths, weaknesses);
        } catch (e: any) {
             if (isMounted.current) {
                setError(e.message || 'Failed to analyze your quiz results.');
                setIsAnalyzing(false);
             }
        }
    }, [questions, answers, onComplete, isAnalyzing]);


    useEffect(() => {
        if (timeLeft <= 0) {
            finishQuiz();
        }
    }, [timeLeft, finishQuiz]);

    useEffect(() => {
        const startQuiz = async () => {
            if (!userProgress) return;
            setIsLoading(true);
            setError(null);
            try {
                const subjects = LEARNING_TOPICS[userProgress.classLevel] || [];
                const allTopics = subjects.flatMap(s => s.topics);
                if (allTopics.length === 0) {
                    throw new Error(`No topics found for Class ${userProgress.classLevel}.`);
                }
                const quizQuestions = await generateDiagnosticQuiz(userProgress.classLevel, allTopics, TOTAL_QUESTIONS);
                
                if (isMounted.current) {
                    setQuestions(quizQuestions);
                    setTimeLeft(QUIZ_DURATION_SECONDS);

                    if (timerRef.current) clearInterval(timerRef.current);
                    timerRef.current = window.setInterval(() => {
                        setTimeLeft(prev => {
                            if (prev <= 1) {
                                if (timerRef.current) clearInterval(timerRef.current);
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                }

            } catch (e: any) {
                if (isMounted.current) {
                    setError(e.message || 'Failed to start diagnostic quiz.');
                }
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };
        
        if (userProgress && !quizStarted.current) {
            quizStarted.current = true;
            startQuiz();
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [userProgress]);

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };
    
    const goToNext = () => {
        if (current < questions.length - 1) {
            setCurrent(c => c + 1);
        }
    };

    const goToPrevious = () => {
        if (current > 0) {
            setCurrent(c => c - 1);
        }
    };

    if (isLoading) return <div className="p-8 text-center"><Spinner text="Preparing your diagnostic test..." /></div>;
    if (isAnalyzing) return <div className="p-8 text-center"><Spinner text="Analyzing your results..." /></div>;
    
    if (error) {
        return <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>;
    }
    
    if (questions.length === 0) {
        return <div className="p-8 text-center text-slate-500">No questions available for your class level.</div>;
    }

    const q = questions[current];
    const allAnswered = Object.keys(answers).length === questions.length;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 md:p-8 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold">Diagnostic Test</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Answer all questions to get your personalized plan.</p>
                </div>
                <div className={`flex items-center gap-2 font-semibold text-lg p-2 rounded-lg ${timeLeft < 300 ? 'text-red-500 bg-red-100 dark:bg-red-900/30' : ''}`}>
                    <Clock className="h-5 w-5" />
                    <span>{formattedTime}</span>
                </div>
            </div>
            
            <ProgressBar value={current + 1} max={questions.length} label={`Question ${current + 1}/${questions.length}`} />
            
            <div className="my-6 min-h-[80px]">
                <h3 className="text-xl font-semibold">{q.questionText}</h3>
            </div>
            
            <div className="space-y-3">
                {q.options.map(opt => (
                    <button 
                        key={opt} 
                        onClick={() => handleAnswer(q.id, opt)} 
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-150 btn-pressable ${
                            answers[q.id] === opt
                            ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 ring-2 ring-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border-transparent'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={goToPrevious} disabled={current === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed btn-pressable">
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                </button>

                {current < questions.length - 1 ? (
                    <button onClick={goToNext} className="flex items-center gap-2 px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 btn-pressable">
                        Next
                        <ArrowRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button 
                        onClick={finishQuiz} 
                        disabled={!allAnswered}
                        className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg shadow hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed btn-pressable"
                        title={!allAnswered ? 'Please answer all questions before submitting' : 'Submit your test'}
                    >
                        Submit Test
                    </button>
                )}
            </div>
        </div>
    );
};
// #endregion

// #region --- MAIN COMPONENT: LearningModule ---
const LearningModule: React.FC = () => {
  const { userProgress, updateProgress, showNotification, setView } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>('loading');
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  useEffect(() => {
    if (userProgress) {
        // If student has no strengths/weaknesses, force diagnostic
      if (!userProgress.strengths?.length && !userProgress.weaknesses?.length) {
        setViewMode('diagnostic');
      } else {
        setViewMode('dashboard');
      }
    }
  }, [userProgress]);

  const handleDiagnosticComplete = (strengths: string[], weaknesses: string[]) => {
    updateProgress({ strengths, weaknesses, completedTopics: [] }); // Reset completed topics on new diagnostic
    showNotification({ message: "Diagnostic complete! We've created a personalized learning plan for you.", icon: '🎉' });
    setViewMode('dashboard');
  };

  const handleSelectTopic = (topic: Topic) => {
    setActiveTopic(topic);
    setViewMode('topic');
  };

  const handleTopicComplete = (topicId: string) => {
    if (userProgress && !userProgress.completedTopics.includes(topicId)) {
        const newTopics = [...userProgress.completedTopics, topicId];
        const points = userProgress.points + 100;
        updateProgress({ completedTopics: newTopics, points: points });
        showNotification({ message: 'Topic complete! You earned 100 points!', icon: '✅' });
    }
    setActiveTopic(null);
    setViewMode('dashboard');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'loading':
        return <div className="flex justify-center p-10"><Spinner text="Loading Learning Zone..." /></div>;
      case 'diagnostic':
        return <DiagnosticQuiz onComplete={handleDiagnosticComplete} />;
      case 'topic':
        if (activeTopic) {
          return <TopicView topic={activeTopic} onBack={() => setViewMode('dashboard')} onComplete={handleTopicComplete} />;
        }
        return null; // Should not happen
      case 'dashboard':
      default:
        return <LearningDashboard onSelectTopic={handleSelectTopic} onStartDiagnostic={() => setViewMode('diagnostic')} />;
    }
  };

  return <div className="animate-slide-in-up">{renderContent()}</div>;
};

export default LearningModule;
// #endregion