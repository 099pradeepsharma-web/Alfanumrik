import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { generateChapterContent, generateDiagnosticQuiz, analyzeDiagnosticResults } from '../services/geminiService';
import type { ChapterContent, InteractiveSimulation, Question, Subject, Topic } from '../types';
import Spinner from './Spinner';
import ProgressBar from './ProgressBar';
import { LEARNING_TOPICS, CLASS_LEVELS } from '../constants';
import { Undo2, Check, X, BookOpen, BrainCircuit, Lightbulb, Target, ArrowRight, ArrowLeft, Clock, Award, HelpCircle, FlaskConical, BookCopy, Lock, CheckCircle } from 'lucide-react';
import ContentRenderer from './ContentRenderer';

// #region --- TYPES ---
type ViewMode = 'loading' | 'diagnostic' | 'dashboard' | 'topic';
type PlanReason = 'Weakness' | 'Next Step' | 'Strength';
type FocusItem = { topic: Topic & { subjectName: string }; reason: PlanReason };
// #endregion


// #region --- SUB-COMPONENT: InteractiveSimulation ---
const InteractiveSimulation: React.FC<{ simulation: InteractiveSimulation }> = ({ simulation }) => {
  const [showObservation, setShowObservation] = useState(false);

  const renderContent = () => {
    // Ensure parameters exist before destructuring
    if (!simulation.parameters) {
        return <p>Simulation details are not available.</p>;
    }

    switch (simulation.type) {
      case 'science_experiment':
        const { materials, steps, observation } = simulation.parameters;
        return (
          <div>
            <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Materials Needed:</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-100 dark:bg-slate-700 p-2 rounded-md">{Array.isArray(materials) ? materials.join(', ') : 'N/A'}</p>
            <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Procedure:</h4>
            <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-600 dark:text-slate-300">
              {Array.isArray(steps) && steps.map((step, index) => <li key={index}>{step}</li>)}
            </ol>
            {showObservation ? (
              <div className="animate-fade-in">
                <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Observation:</h4>
                <p className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-800 dark:text-green-200">{observation}</p>
              </div>
            ) : (
              <button onClick={() => setShowObservation(true)} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 btn-pressable">
                  Run Experiment
              </button>
            )}
          </div>
        );
      case 'math_graph':
        const { description, equation, key_points } = simulation.parameters;
        return (
          <div>
            <p className="mb-4 text-slate-600 dark:text-slate-300">{description}</p>
            <div className="font-mono text-center p-4 bg-slate-100 dark:bg-slate-700 rounded-lg mb-4 text-lg text-indigo-800 dark:text-indigo-200">
              {equation}
            </div>
            <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Key Properties of the Graph:</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">{key_points}</p>
          </div>
        );
      case 'timeline':
        const { events } = simulation.parameters;
        if (!Array.isArray(events)) return <p>Timeline events are not available.</p>;
        return (
          <div className="relative pl-4 border-l-2 border-indigo-300 dark:border-indigo-700">
            {events.map((event, index) => (
              <div key={index} className="mb-6 ml-4 relative">
                <div className="absolute -left-[25px] top-1.5 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-800"></div>
                <p className="font-bold text-indigo-600 dark:text-indigo-400">{event.year}</p>
                <p className="text-slate-600 dark:text-slate-300">{event.description}</p>
              </div>
            ))}
          </div>
        );
      default:
        return <p className="text-slate-600 dark:text-slate-300">{simulation.parameters.text || "No interactive element available."}</p>
    }
  }

  return (
    <div className="p-4 md:p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-slate-800 dark:text-slate-100"><FlaskConical className="text-indigo-500" /> {simulation.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{simulation.description}</p>
      {renderContent()}
    </div>
  );
}
// #endregion

// #region --- SUB-COMPONENT: PracticeProblems ---
const PracticeProblems: React.FC<{ problems: Question[] }> = ({ problems }) => {
    const [current, setCurrent] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [completed, setCompleted] = useState(false);

    if (!problems || problems.length === 0) return null;

    const problem = problems[current];

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setIsCorrect(answer === problem.correctAnswer);
    };

    const handleNext = () => {
        if (current < problems.length - 1) {
            setCurrent(c => c + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            setCompleted(true);
        }
    };
    
    if (completed) {
        return (
             <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
                <Award className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h4 className="text-lg font-bold text-green-800 dark:text-green-200">Practice Complete!</h4>
                <p className="text-green-700 dark:text-green-300">Great job reviewing the concepts.</p>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Question {current + 1} of {problems.length}</p>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">{problem.questionText}</h4>
            <div className="space-y-2">
                {problem.options.map(opt => {
                     const isSelected = selectedAnswer === opt;
                     let btnClass = 'w-full text-left p-3 rounded-md border btn-pressable ';
                     if (selectedAnswer) {
                         if (opt === problem.correctAnswer) btnClass += 'bg-green-100 dark:bg-green-900 border-green-400';
                         else if (isSelected) btnClass += 'bg-red-100 dark:bg-red-900 border-red-400';
                         else btnClass += 'bg-slate-50 dark:bg-slate-700';
                     } else {
                         btnClass += 'bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100';
                     }
                    return <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selectedAnswer} className={btnClass}>{opt}</button>
                })}
            </div>
            {selectedAnswer && (
                 <div className="mt-4 text-right">
                    <button onClick={handleNext} className="px-6 py-2 bg-indigo-600 text-white rounded-lg btn-pressable">
                      {current < problems.length - 1 ? 'Next Question' : 'Finish Practice'}
                    </button>
                 </div>
            )}
        </div>
    )
}
// #endregion

// #region --- SUB-COMPONENT: ChapterView ---
const ChapterView: React.FC<{
  topic: Topic;
  onBack: () => void;
  onComplete: (topicId: string) => void;
}> = ({ topic, onBack, onComplete }) => {
  const { userProgress, showNotification, updateProgress } = useAppContext();
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!userProgress) return;
      setError(null);
      setContent(null);
      try {
        const generatedContent = await generateChapterContent(topic.id, topic.name, userProgress.classLevel);
        setContent(generatedContent);
      } catch (e: any) {
        setError(e.message || 'Failed to load chapter content.');
      }
    };
    loadContent();
  }, [topic, userProgress]);
  
  const finishTopic = () => {
    onComplete(topic.id);
  };
  
  if (error) {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <p className="text-red-500 text-center">{error}</p>
            <button onClick={onBack} className="mt-6 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                Back to Learning Plan
            </button>
        </div>
    );
  }

  if (!content) {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg h-96">
            <Spinner text={`Building your lesson on ${topic.name}...`} />
            <button onClick={onBack} className="mt-6 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                Back to Learning Plan
            </button>
        </div>
    );
  }

  return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg animate-fade-in">
          <header className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-[65px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10">
              <div>
                  <button onClick={onBack} className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline btn-pressable">
                      <Undo2 className="h-4 w-4 mr-1" />
                      Back to Plan
                  </button>
                  <h2 className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <span className="text-4xl">{topic.icon}</span>
                    {topic.name}
                  </h2>
              </div>
              <button onClick={finishTopic} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 flex items-center gap-2 btn-pressable">
                  <Check className="h-5 w-5"/>
                  Mark as Complete
              </button>
          </header>

          <main className="p-4 md:p-8 space-y-12">
            {/* 1. Learning Objectives */}
            <section className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2"><Target className="text-red-500" /> Learning Objectives</h3>
              <ul className="list-disc list-inside pl-4 space-y-2 text-slate-600 dark:text-slate-300">
                {content.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
              </ul>
            </section>

            {/* 2. Core Concepts */}
            <section className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2"><Lightbulb className="text-amber-500" /> Core Concepts</h3>
              <div className="space-y-4">
                {content.coreConcepts.map(concept => (
                  <div key={concept.title} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-lg text-indigo-700 dark:text-indigo-400">{concept.title}</h4>
                    <p className="mt-2 text-slate-700 dark:text-slate-300">{concept.explanation}</p>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 text-sm">
                        <p className="font-semibold text-slate-600 dark:text-slate-400">Real-world Example:</p>
                        <p className="italic text-slate-500 dark:text-slate-400">"{concept.example}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Interactive Simulation */}
            <section className="animate-slide-in-up" style={{ animationDelay: '300ms' }}>
              <InteractiveSimulation simulation={content.interactiveSimulation} />
            </section>

            {/* 4. Practice Problems */}
            <section className="animate-slide-in-up" style={{ animationDelay: '400ms' }}>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2"><HelpCircle className="text-teal-500" /> Practice Problems</h3>
              <PracticeProblems problems={content.practiceProblems} />
            </section>

            {/* 5. Quick Summary */}
            <section className="animate-slide-in-up" style={{ animationDelay: '500ms' }}>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2"><BookCopy className="text-sky-500" /> Quick Summary</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <ContentRenderer content={content.quickSummary} />
              </div>
            </section>
          </main>
      </div>
  );
};
// #endregion

// #region --- SUB-COMPONENT: CurriculumSelector ---
const CurriculumSelector: React.FC<{
    selectedClass: string;
    onClassChange: (classLevel: string) => void;
    subjects: Subject[];
    selectedSubjectId: string | null;
    onSubjectChange: (subjectId: string) => void;
}> = ({ selectedClass, onClassChange, subjects, selectedSubjectId, onSubjectChange }) => {
    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="class-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Class</label>
                    <select
                        id="class-select"
                        value={selectedClass}
                        onChange={(e) => onClassChange(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        {CLASS_LEVELS.map(level => <option key={level} value={level}>Class {level}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="subject-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                    <select
                        id="subject-select"
                        value={selectedSubjectId ?? ''}
                        onChange={(e) => onSubjectChange(e.target.value)}
                        disabled={!subjects.length}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-slate-200 dark:disabled:bg-slate-600"
                    >
                        {subjects.length > 0 ? (
                            subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)
                        ) : (
                            <option>No subjects available</option>
                        )}
                    </select>
                </div>
            </div>
        </div>
    );
};
// #endregion

// #region --- SUB-COMPONENT: LearningDashboard ---
const LearningDashboard: React.FC<{
    onSelectTopic: (topic: Topic) => void;
    onStartDiagnostic: () => void;
    selectedSubject: Subject | null;
    allTopicsForClass: (Topic & { subjectName: string })[]; // For cross-subject prerequisite checks
}> = ({ onSelectTopic, onStartDiagnostic, selectedSubject, allTopicsForClass }) => {
    const { userProgress } = useAppContext();

    const allTopicsForSubject = useMemo(() => {
        if (!selectedSubject) return [];
        return selectedSubject.topics.map(t => ({...t, subjectName: selectedSubject.name}));
    }, [selectedSubject]);

    const learningPlan = useMemo<FocusItem[]>(() => {
        if (!userProgress || !selectedSubject) return [];
        const plan: FocusItem[] = [];
        const { weaknesses, strengths, completedTopics } = userProgress;

        // 1. Add weaknesses from the current subject
        weaknesses?.forEach(id => {
            const topic = allTopicsForSubject.find(t => t.id === id);
            if (topic) plan.push({ topic, reason: 'Weakness' });
        });

        // 2. Find next logical topic WITHIN THE CURRENT SUBJECT
        const nextTopic = allTopicsForSubject.find(t => 
            !completedTopics.includes(t.id) &&                               
            !weaknesses?.includes(t.id) &&
            // Prerequisites can be from any subject in the class
            t.prerequisites?.every(p => completedTopics.includes(p))          
        );
        if(nextTopic) plan.push({ topic: nextTopic, reason: 'Next Step' });
        
        // 3. Find a strength to revise WITHIN THE CURRENT SUBJECT
        const strengthToReview = strengths?.find(id => {
            return completedTopics.includes(id) && allTopicsForSubject.some(t => t.id === id);
        });
        if (strengthToReview) {
            const topic = allTopicsForSubject.find(t => t.id === strengthToReview);
            if (topic && !plan.some(p => p.topic.id === topic.id)) {
                 plan.push({ topic, reason: 'Strength' });
            }
        }

        return Array.from(new Map(plan.map(item => [item.topic.id, item])).values()).slice(0, 4);
    }, [userProgress, selectedSubject, allTopicsForSubject, allTopicsForClass]);

    const renderReason = (reason: PlanReason) => {
        switch(reason) {
            case 'Weakness': return <span className="flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 px-2 py-1 rounded-full"><Target className="h-3 w-3" /> Focus Area</span>;
            case 'Next Step': return <span className="flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-2 py-1 rounded-full"><BookOpen className="h-3 w-3" /> Next Up</span>;
            case 'Strength': return <span className="flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 px-2 py-1 rounded-full"><Lightbulb className="h-3 w-3" /> Revise</span>;
            default: return null;
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 animate-slide-in-up">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Learning Zone</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Your personalized path to mastery.</p>
                <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <button onClick={onStartDiagnostic} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-2 btn-pressable">
                        <BrainCircuit className="h-5 w-5" /> Retake Diagnostic Test
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
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
                        <p>Your personalized plan for this subject will appear here.</p>
                    </div>
                 )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                 <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Browse All Topics in {selectedSubject?.name}</h3>
                 <div className="path-container">
                    {allTopicsForSubject.map(topic => {
                        const isCompleted = userProgress?.completedTopics.includes(topic.id);
                        const isUnlocked = !topic.prerequisites || topic.prerequisites.every(p => userProgress?.completedTopics.includes(p));
                        const status = isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked';

                        let iconClass = 'path-icon-locked';
                        if (status === 'completed') iconClass = 'path-icon-completed';
                        if (status === 'unlocked') iconClass = 'path-icon-unlocked';

                        return (
                             <div key={topic.id} className="path-node">
                                <div className={`path-icon ${iconClass}`}>
                                    {status === 'completed' ? <CheckCircle className="h-5 w-5" /> : status === 'locked' ? <Lock className="h-5 w-5" /> : <span className="text-xl">{topic.icon}</span>}
                                </div>
                                <div 
                                    onClick={() => status !== 'locked' && onSelectTopic(topic)}
                                    className={`p-4 rounded-lg transition-all duration-200 ${status === 'locked' ? 'bg-slate-100 dark:bg-slate-800 opacity-60 cursor-not-allowed' : 'bg-white dark:bg-slate-700/50 interactive-card cursor-pointer'}`}
                                >
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{topic.name}</h4>
                                    {status === 'locked' && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Complete previous topics to unlock.</p>}
                                </div>
                            </div>
                        )
                    })}
                 </div>
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

    const TOTAL_QUESTIONS = 5;
    const QUIZ_DURATION_SECONDS = 5 * 60; // 5 minutes

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
            if (!userProgress || quizStarted.current) return;
            quizStarted.current = true;
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
                        if (!isMounted.current) {
                            if (timerRef.current) clearInterval(timerRef.current);
                            return;
                        }
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
        
        startQuiz();

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
                <div className={`flex items-center gap-2 font-semibold text-lg p-2 rounded-lg ${timeLeft < 60 ? 'text-red-500 bg-red-100 dark:bg-red-900/30' : ''}`}>
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
                        className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg shadow hover:bg-green-700 btn-pressable"
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
  const { userProgress, updateProgress, showNotification } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>('loading');
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  const [selectedClass, setSelectedClass] = useState<string>(userProgress?.classLevel || '6');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  useEffect(() => {
    if (userProgress) {
      if (!userProgress.strengths?.length && !userProgress.weaknesses?.length) {
        setViewMode('diagnostic');
      } else {
        setViewMode('dashboard');
      }
    }
  }, [userProgress]);
  
  useEffect(() => {
      // Set initial subject when class changes or on first load
      const subjectsForClass = LEARNING_TOPICS[selectedClass] || [];
      if (subjectsForClass.length > 0) {
          // Check if the current subject ID is valid for the new class
          const isCurrentSubjectValid = subjectsForClass.some(s => s.id === selectedSubjectId);
          if (!isCurrentSubjectValid) {
              setSelectedSubjectId(subjectsForClass[0].id);
          }
      } else {
          setSelectedSubjectId(null);
      }
  }, [selectedClass, selectedSubjectId]);


  const handleDiagnosticComplete = (strengths: string[], weaknesses: string[]) => {
    updateProgress({ strengths, weaknesses, completedTopics: [] }); 
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
          return <ChapterView topic={activeTopic} onBack={() => setViewMode('dashboard')} onComplete={handleTopicComplete} />;
        }
        return null;
      case 'dashboard':
      default:
        const subjectsForClass = LEARNING_TOPICS[selectedClass] || [];
        const selectedSubject = subjectsForClass.find(s => s.id === selectedSubjectId) || null;
        const allTopicsForClass = (LEARNING_TOPICS[selectedClass] || []).flatMap(s => s.topics.map(t => ({...t, subjectName: s.name})));

        return (
            <div>
                 <CurriculumSelector
                    selectedClass={selectedClass}
                    onClassChange={setSelectedClass}
                    subjects={subjectsForClass}
                    selectedSubjectId={selectedSubjectId}
                    onSubjectChange={setSelectedSubjectId}
                />
                <LearningDashboard
                    onSelectTopic={handleSelectTopic}
                    onStartDiagnostic={() => setViewMode('diagnostic')}
                    selectedSubject={selectedSubject}
                    allTopicsForClass={allTopicsForClass}
                />
            </div>
        )
    }
  };

  return <div className="animate-slide-in-up">{renderContent()}</div>;
};

export default LearningModule;
// #endregion