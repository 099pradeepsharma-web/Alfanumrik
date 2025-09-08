import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { generateLearningContent, generateQuiz, generateImageFromPrompt, generateFlashcards } from '../services/geminiService';
import { speak } from '../services/speechService';
import type { LearningContent, Question } from '../types';
import Spinner from './Spinner';
import { LEARNING_TOPICS } from '../constants';
// Fix: Replaced non-existent 'CopyStack' icon with 'Layers' from lucide-react.
import { RefreshCw, Trophy, Undo2, Check, X, Image as ImageIcon, Layers, Volume2 } from 'lucide-react';
import ContentRenderer from './ContentRenderer';

const LearningModule: React.FC = () => {
  const { userProgress, updateProgress, showNotification, selectedTopicId, setSelectedTopicId } = useAppContext();
  const { t, currentLang } = useLocalization();

  const [selectedTopic, setSelectedTopic] = useState<{ id: string; name: string } | null>(null);
  const [content, setContent] = useState<LearningContent | null>(null);
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [isReviewingQuiz, setIsReviewingQuiz] = useState(false);
  
  // State for Image Generator
  const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null);

  // State for Flashcard Generator
  const [isFlashcardGeneratorOpen, setIsFlashcardGeneratorOpen] = useState(false);
  const [flashcards, setFlashcards] = useState<{ term: string; definition: string }[] | null>(null);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcardGenerationError, setFlashcardGenerationError] = useState<string | null>(null);
  const [flippedFlashcardIndex, setFlippedFlashcardIndex] = useState<number | null>(null);


  // This effect will run when the component mounts or when selectedTopicId changes.
  useEffect(() => {
    // Only proceed if a topic ID is passed from another component (like Dashboard).
    if (selectedTopicId && userProgress && setSelectedTopicId) {
      const subjectsOrTopics = LEARNING_TOPICS[userProgress.classLevel] || [];
      const isNewStructure = subjectsOrTopics.length > 0 && subjectsOrTopics[0].hasOwnProperty('topics');
      
      let topicToSelect: { id: string; name: string } | null = null;
      
      if (isNewStructure) {
        // Find the topic within the nested subject structure.
        for (const subject of subjectsOrTopics) {
          const foundTopic = subject.topics.find((t: any) => t.id === selectedTopicId);
          if (foundTopic) {
            topicToSelect = foundTopic;
            break;
          }
        }
      } else {
        // Fallback for old flat structure.
        topicToSelect = subjectsOrTopics.find((t: any) => t.id === selectedTopicId);
      }
      
      if (topicToSelect) {
        // If the topic is found, select it. This will trigger content generation.
        handleTopicSelect(topicToSelect);
      }
      
      // Clear the selectedTopicId from context to prevent re-triggering.
      setSelectedTopicId(null);
    }
  }, [selectedTopicId, userProgress, setSelectedTopicId]); // Dependencies for the effect.


  if (!userProgress) {
    return <div>Loading user data...</div>;
  }

  const handleTopicSelect = async (topic: { id: string; name: string }) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setContent(null);
    setQuiz(null);
    setError(null);

    try {
      const learningContent = await generateLearningContent(topic.id, topic.name, userProgress.classLevel);
      setContent(learningContent);
      
      const isTopicNew = !userProgress.completedTopics.includes(topic.id);
      if (isTopicNew) {
          const pointsEarned = 50;
          const newPoints = userProgress.points + pointsEarned;
          const newCompletedTopics = [...userProgress.completedTopics, topic.id];
          updateProgress({ points: newPoints, completedTopics: newCompletedTopics });
          showNotification({ message: `You earned ${pointsEarned} points for starting a new topic!`, icon: '📚' });
      }

    } catch (e) {
      console.error("Failed to generate learning content", e);
      setError("We couldn't generate the learning content right now. Please try another topic or come back later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerate = async () => {
    if (!selectedTopic || !userProgress) return;
    setIsRegenerating(true);
    setError(null);
    try {
        const learningContent = await generateLearningContent(selectedTopic.id, selectedTopic.name, userProgress.classLevel);
        setContent(learningContent);
    } catch (e) {
        console.error("Failed to regenerate learning content", e);
        setError("We couldn't regenerate the content right now. Please try again in a moment.");
    } finally {
        setIsRegenerating(false);
    }
  };

  const startQuiz = async () => {
    if (!selectedTopic) return;
    setIsLoading(true);
    setError(null);
    try {
        const quizQuestions = await generateQuiz(selectedTopic.name, 3, userProgress.classLevel);
        setQuiz(quizQuestions);
        setCurrentQuizQuestion(0);
        setQuizScore(0);
        setQuizFinished(false);
        setSelectedAnswer(null);
        setQuizAnswers([]);
        setIsReviewingQuiz(false);
    } catch (e) {
        console.error("Failed to generate quiz", e);
        setError("Failed to generate the quiz. Please try again later.");
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleAnswerSelect = (answer: string) => {
      if (!quiz) return;
      setSelectedAnswer(answer);
      
      const newAnswers = [...quizAnswers];
      newAnswers[currentQuizQuestion] = answer;
      setQuizAnswers(newAnswers);

      if (answer === quiz[currentQuizQuestion].correctAnswer) {
          setQuizScore(prev => prev + 1);
      }
  }
  
  const handleNextQuizQuestion = () => {
      if (!quiz || !userProgress) return;
      if (currentQuizQuestion < quiz.length - 1) {
          setCurrentQuizQuestion(prev => prev + 1);
          setSelectedAnswer(null);
      } else {
          // Finish quiz
          setQuizFinished(true);
          const pointsPerCorrectAnswer = 25;
          const pointsEarned = quizScore * pointsPerCorrectAnswer;
          updateProgress({ points: userProgress.points + pointsEarned });
          showNotification({ message: `Quiz finished! You scored ${quizScore}/${quiz.length} and earned ${pointsEarned} points.`, icon: '📝' });

          if (quizScore === quiz.length && !userProgress.badges.includes('quiz_whiz')) {
              const newBadges = [...userProgress.badges, 'quiz_whiz'];
              updateProgress({ badges: newBadges });
              showNotification({ message: 'New Badge Unlocked: Quiz Whiz!', icon: '🏆' });
              speak("A perfect score! You've just earned the Quiz Whiz badge. Incredible!", currentLang);
          }
      }
  }

  const resetModule = () => {
      setSelectedTopic(null);
      setContent(null);
      setQuiz(null);
      setQuizAnswers([]);
      setIsReviewingQuiz(false);
      setIsImageGeneratorOpen(false);
      resetImageGenerator();
      setIsFlashcardGeneratorOpen(false);
      setFlashcards(null);
      setFlashcardGenerationError(null);
      setFlippedFlashcardIndex(null);
  }
  
  const handleGenerateImage = async () => {
      if (!imagePrompt.trim()) return;
      setIsGeneratingImage(true);
      setGeneratedImageUrl(null);
      setImageGenerationError(null);
      try {
          const imageUrl = await generateImageFromPrompt(imagePrompt);
          setGeneratedImageUrl(imageUrl);
      } catch (e) {
          console.error("Failed to generate image", e);
          setImageGenerationError("Sorry, we couldn't create that image. Please try a different prompt.");
      } finally {
          setIsGeneratingImage(false);
      }
  };

  const resetImageGenerator = () => {
      setImagePrompt('');
      setGeneratedImageUrl(null);
      setImageGenerationError(null);
  };

  const handleGenerateFlashcards = async () => {
    if (!content || !selectedTopic || !userProgress) return;
    setIsGeneratingFlashcards(true);
    setFlashcards(null);
    setFlashcardGenerationError(null);
    setFlippedFlashcardIndex(null);
    try {
        const generatedFlashcards = await generateFlashcards(content.content, selectedTopic.name, userProgress.classLevel);
        setFlashcards(generatedFlashcards);
    } catch (e) {
        console.error("Failed to generate flashcards", e);
        setFlashcardGenerationError("Sorry, we couldn't create flashcards for this topic. Please try again.");
    } finally {
        setIsGeneratingFlashcards(false);
    }
  };

  const handleOpenFlashcardGenerator = () => {
    setIsFlashcardGeneratorOpen(true);
    if (!flashcards && !isGeneratingFlashcards) {
        handleGenerateFlashcards();
    }
  };

  const renderTopicSelection = () => {
    const subjectsOrTopics = LEARNING_TOPICS[userProgress.classLevel] || [];
    const isNewStructure = subjectsOrTopics.length > 0 && subjectsOrTopics[0].hasOwnProperty('topics');

    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t('learning_zone')}</h2>
          <p className="text-slate-500 mt-2">Select a topic to start learning and earn points.</p>
        </div>
  
        {isNewStructure ? (
          subjectsOrTopics.map((subject: any) => (
            <div key={subject.id} className="mt-10">
              <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <span className="text-3xl">{subject.icon}</span>
                {subject.name}
              </h3>
              {subject.topics.length > 0 ? (
                <div className="mt-6 grid md:grid-cols-3 gap-6">
                  {subject.topics.map((topic: any) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic)}
                      disabled={isLoading}
                      className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md interactive-card hover:bg-indigo-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-5xl mb-3">{topic.icon}</span>
                      <h3 className="font-semibold text-lg text-center">{topic.name}</h3>
                      {userProgress.completedTopics.includes(topic.id) && (
                        <span className="text-xs text-green-500 font-bold mt-2">COMPLETED</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-center text-slate-500 dark:text-slate-400 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p>Topics for this subject are coming soon!</p>
                </div>
              )}
            </div>
          ))
        ) : (
          // Fallback for old structure
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {subjectsOrTopics.map((topic: any) => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic)}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md interactive-card hover:bg-indigo-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-5xl mb-3">{topic.icon}</span>
                <h3 className="font-semibold text-lg text-center">{topic.name}</h3>
                {userProgress.completedTopics.includes(topic.id) && (
                  <span className="text-xs text-green-500 font-bold mt-2">COMPLETED</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const renderImageGenerator = () => {
      return (
          <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg animate-fade-in border border-slate-200 dark:border-slate-600">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Visualize a Concept</h3>
                  <button onClick={() => { setIsImageGeneratorOpen(false); resetImageGenerator(); }} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Close</button>
              </div>

              {isGeneratingImage && (
                  <div className="flex justify-center items-center h-48">
                      <Spinner text="Creating your image..." />
                  </div>
              )}

              {imageGenerationError && !isGeneratingImage && (
                  <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <p>{imageGenerationError}</p>
                      <button onClick={resetImageGenerator} className="mt-2 text-sm font-semibold text-indigo-600 hover:underline">Try again</button>
                  </div>
              )}

              {generatedImageUrl && !isGeneratingImage && (
                  <div className="text-center">
                      <img src={generatedImageUrl} alt={imagePrompt} className="rounded-lg shadow-lg mx-auto max-w-full h-auto border border-slate-200 dark:border-slate-600" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">Your prompt: "{imagePrompt}"</p>
                      <div className="mt-4">
                          <button onClick={resetImageGenerator} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700">
                              Generate Another
                          </button>
                      </div>
                  </div>
              )}

              {!generatedImageUrl && !isGeneratingImage && !imageGenerationError && (
                  <div className="space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300">Enter a prompt to create an image related to this topic. For example, "A diagram of a plant cell with labels."</p>
                      <textarea
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="e.g., A detailed image of the planet Jupiter with its Great Red Spot"
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                          rows={2}
                      />
                      <button
                          onClick={handleGenerateImage}
                          disabled={!imagePrompt.trim()}
                          className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                      >
                          Generate Image
                      </button>
                  </div>
              )}
          </div>
      );
  };

  const renderFlashcardGenerator = () => {
    return (
        <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg animate-fade-in border border-slate-200 dark:border-slate-600">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Key Concept Flashcards</h3>
                <button onClick={() => { setIsFlashcardGeneratorOpen(false); setFlippedFlashcardIndex(null); }} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Close</button>
            </div>

            {isGeneratingFlashcards && (
                <div className="flex justify-center items-center h-48">
                    <Spinner text="Creating your flashcards..." />
                </div>
            )}

            {flashcardGenerationError && !isGeneratingFlashcards && (
                <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p>{flashcardGenerationError}</p>
                </div>
            )}

            {flashcards && !isGeneratingFlashcards && (
                <>
                    <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-4">Click a card to flip it!</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {flashcards.map((card, index) => (
                            <button
                                key={index}
                                onClick={() => setFlippedFlashcardIndex(flippedFlashcardIndex === index ? null : index)}
                                className="relative p-6 bg-white dark:bg-slate-800 rounded-lg shadow cursor-pointer min-h-[120px] flex items-center justify-center text-center interactive-card"
                                aria-live="polite"
                            >
                                {flippedFlashcardIndex === index ? (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 animate-fade-in">{card.definition}</p>
                                ) : (
                                    <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 animate-fade-in">{card.term}</h4>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const textToSpeak = flippedFlashcardIndex === index ? card.definition : card.term;
                                        speak(textToSpeak, currentLang);
                                    }}
                                    className="absolute bottom-2 right-2 p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Read aloud"
                                >
                                    <Volume2 className="h-5 w-5" />
                                </button>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
  };
  
  const renderQuiz = () => {
      if (isLoading && !quiz) return <div className="flex justify-center mt-4"><Spinner text="Generating quiz..."/></div>;
      if (!quiz) return null;
      
      if (isReviewingQuiz) {
        return (
            <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-700 rounded-lg animate-fade-in">
                <h3 className="text-xl font-bold mb-4">Quiz Review</h3>
                <div className="space-y-6">
                    {quiz.map((q, index) => (
                        <div key={q.id}>
                            <p className="font-semibold mb-3">{index + 1}. {q.questionText}</p>
                            <div className="space-y-2">
                                {q.options.map(option => {
                                    const userAnswer = quizAnswers[index];
                                    const isCorrect = option === q.correctAnswer;
                                    const isSelected = option === userAnswer;
                                    let reviewClass = 'w-full text-left p-3 rounded-md border flex items-center justify-between ';
                                    
                                    if (isCorrect) {
                                        reviewClass += 'bg-green-100 dark:bg-green-900 border-green-500 font-semibold';
                                    } else if (isSelected) {
                                        reviewClass += 'bg-red-100 dark:bg-red-900 border-red-500';
                                    } else {
                                        reviewClass += 'bg-slate-50 dark:bg-slate-600 border-slate-300 dark:border-slate-500 opacity-70';
                                    }

                                    return (
                                        <div key={option} className={reviewClass}>
                                            <span className={isSelected && !isCorrect ? 'line-through' : ''}>{option}</span>
                                            {isCorrect && <Check className="h-5 w-5 text-green-600" />}
                                            {isSelected && !isCorrect && <X className="h-5 w-5 text-red-600" />}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 p-2 bg-slate-200 dark:bg-slate-600 rounded">
                                <span className="font-bold">Explanation: </span>{q.explanation}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <button onClick={() => setIsReviewingQuiz(false)} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700">
                      Back to Summary
                    </button>
                </div>
            </div>
        )
      }

      if (quizFinished) {
          const percentage = (quizScore / quiz.length) * 100;
          let feedbackMessage = '';
          if (percentage === 100) feedbackMessage = "Flawless victory! You're a true Quiz Whiz! 🧠";
          else if (percentage >= 75) feedbackMessage = "Excellent work! You've got a great grasp on this topic. 👍";
          else if (percentage >= 50) feedbackMessage = "Good effort! A little more review and you'll master it. 😊";
          else feedbackMessage = "Keep practicing! Every attempt is a step forward. 💪";

          return (
              <div className="mt-8 text-center p-8 bg-slate-100 dark:bg-slate-700 rounded-lg animate-fade-in">
                  <Trophy className="h-16 w-16 mx-auto text-amber-500" />
                  <h3 className="text-2xl font-bold mt-4">Quiz Complete!</h3>
                  <p className="text-5xl font-bold my-4 text-indigo-600 dark:text-indigo-400">{quizScore} / {quiz.length}</p>
                  <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">{feedbackMessage}</p>
                  <div className="flex justify-center gap-4 mt-8">
                      <button onClick={() => setIsReviewingQuiz(true)} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700">
                        Review Answers
                      </button>
                      <button onClick={() => setQuiz(null)} className="px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg shadow hover:bg-slate-600">
                        Back to Lesson
                      </button>
                  </div>
              </div>
          )
      }
      
      const question = quiz[currentQuizQuestion];
      return (
          <div key={currentQuizQuestion} className="mt-8 p-6 bg-slate-100 dark:bg-slate-700 rounded-lg animate-fade-in">
              <h3 className="text-lg font-bold">Quick Quiz!</h3>
              <p className="font-semibold mt-4 mb-3">{currentQuizQuestion + 1}. {question.questionText}</p>
              <div className="space-y-2">
                  {question.options.map(option => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = option === question.correctAnswer;
                      let buttonClass = 'w-full text-left p-3 rounded-md border transition-all duration-200 ';
                        if (selectedAnswer) {
                            if (isCorrect) buttonClass += 'bg-green-100 dark:bg-green-900 border-green-500';
                            else if (isSelected) buttonClass += 'bg-red-100 dark:bg-red-900 border-red-500';
                            else buttonClass += 'bg-slate-50 dark:bg-slate-600 opacity-60';
                        } else {
                            buttonClass += 'bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-500 transform hover:scale-102';
                        }
                      return (
                          <button key={option} onClick={() => handleAnswerSelect(option)} disabled={!!selectedAnswer} className={buttonClass}>
                              {option}
                          </button>
                      )
                  })}
              </div>
              {selectedAnswer && (
                  <div className="mt-6 text-right">
                      <button onClick={handleNextQuizQuestion} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700">
                          {currentQuizQuestion < quiz.length - 1 ? 'Next' : 'Finish'}
                      </button>
                  </div>
              )}
          </div>
      )
  }

  const renderContent = () => (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 animate-slide-in-up">
        <button onClick={resetModule} className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-4">
            <Undo2 className="h-4 w-4" /> Back to Topics
        </button>
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{selectedTopic?.name}</h2>
            {content && (
                <button 
                    onClick={handleRegenerate} 
                    disabled={isRegenerating}
                    className="px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                    {isRegenerating ? (
                        <RefreshCw className="animate-spin h-4 w-4" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>
            )}
        </div>
        
        {isLoading && !content ? (
            <div className="mt-8 flex justify-center">
                <Spinner text="Generating your lesson..." />
            </div>
        ) : error ? (
            <p className="mt-4 text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">{error}</p>
        ) : content ? (
            <>
                <div className="mt-6">
                    <ContentRenderer content={content.content} />
                </div>
                
                <div className="mt-8 text-center border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-wrap justify-center gap-4">
                    {!quiz && (
                         <button onClick={startQuiz} disabled={isLoading || isRegenerating} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow disabled:bg-slate-400 hover:bg-indigo-700 flex items-center justify-center">
                           {isLoading ? "Loading..." : "Take a Quick Quiz!"}
                        </button>
                    )}
                    {!isImageGeneratorOpen && !quiz && (
                        <button 
                            onClick={() => setIsImageGeneratorOpen(true)}
                            disabled={isLoading || isRegenerating}
                            className="px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow disabled:bg-slate-400 hover:bg-slate-700 flex items-center justify-center"
                        >
                            <ImageIcon className="h-5 w-5 mr-2" />
                            Visualize a Concept
                        </button>
                    )}
                    {!isFlashcardGeneratorOpen && !quiz && (
                        <button
                            onClick={handleOpenFlashcardGenerator}
                            disabled={isLoading || isRegenerating}
                            className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow disabled:bg-slate-400 hover:bg-teal-700 flex items-center justify-center"
                        >
                            <Layers className="h-5 w-5 mr-2" />
                            Create Flashcards
                        </button>
                    )}
                </div>
                
                {isImageGeneratorOpen && renderImageGenerator()}
                {isFlashcardGeneratorOpen && renderFlashcardGenerator()}
                {renderQuiz()}
            </>
        ) : null}
    </div>
  );

  return selectedTopic ? renderContent() : renderTopicSelection();
};

export default LearningModule;