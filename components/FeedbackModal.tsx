import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { submitFeedback } from '../services/databaseService';
import Spinner from './Spinner';
import { Star, X, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const { currentUser } = useAppContext();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 && comments.trim() === '') {
      setError('Please provide a rating or some comments.');
      return;
    }
    setError(null);
    setIsLoading(true);

    if (!currentUser) {
      setError('You must be logged in to submit feedback.');
      setIsLoading(false);
      return;
    }

    try {
      await submitFeedback(currentUser.id, rating, comments);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000); // Close modal after 2 seconds
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        {isSubmitted ? (
          <div className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Thank You!</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Your feedback has been received.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Send Feedback</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-slate-400 btn-pressable" aria-label="Close modal">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">How would you rate your experience?</label>
                <div className="flex justify-center space-x-2" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors duration-150 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-current'
                            : 'text-slate-300 dark:text-slate-500'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Any comments or suggestions? (Optional)
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell us what you think..."
                />
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex justify-center items-center px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 btn-pressable min-w-[120px]"
                >
                  {isLoading ? <Spinner /> : 'Submit'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;