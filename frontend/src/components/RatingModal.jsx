import React, { useState } from 'react';
import { Star, X, Check, Info } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RatingModal = ({ isOpen, onClose, transaction, reviewedUser, onSuccess }) => {
  const { token, API_URL } = useAuth();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !transaction || !reviewedUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment) {
      setError('Please add a brief comment review.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${API_URL}/reviews`,
        {
          transactionId: transaction._id,
          reviewedUserId: reviewedUser._id,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
        }
      );

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setComment('');
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200/80 shadow-premium relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Review Submitted!</h3>
            <p className="text-sm text-slate-500 mt-2">Thank you for rating your transaction.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-900 font-outfit text-center mb-1">
              Rate Your Experience
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Review transaction for target partner: <strong className="text-slate-800 font-semibold">{reviewedUser.name}</strong>
            </p>

            {/* Stars selection row */}
            <div className="flex items-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-yellow-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating) ? 'fill-yellow-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="w-full text-left mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Review Description
              </label>
              <textarea
                rows={3}
                required
                placeholder="Write your feedback..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50 placeholder-slate-400 resize-none"
              />
            </div>

            {error && (
              <div className="mb-4 w-full p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center space-x-1.5">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Submit Feedback Review</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
