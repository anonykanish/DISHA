import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientVisit } from '../context/PatientVisitContext';
import { submitFeedback } from '../services/api';
import { Star, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeedbackPage: React.FC = () => {
  const { t } = useTranslation();
  const { visit } = usePatientVisit();

  const [ratingNav, setRatingNav] = useState(5);
  const [ratingWait, setRatingWait] = useState(4);
  const [ratingEase, setRatingEase] = useState(5);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await submitFeedback({
        visitId: visit?.id || 'anonymous',
        ratingNav,
        ratingWait,
        ratingEase,
        comments
      });
      setIsSubmitted(true);
    } catch (err) {
      alert('Could not submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarSelector = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            className="p-1 text-2xl transition hover:scale-125 focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-disha-lightPrimary dark:text-disha-darkPrimary font-bold text-base">
            <MessageSquare className="w-5 h-5" />
            <span>{t('feedback.title')}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Help improve navigation, waiting transparency, and accessibility in government hospitals.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Your response has been logged for hospital administration review and service improvements.
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-block py-2.5 px-5 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-xs rounded-xl shadow"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <StarSelector
              label={t('feedback.navRating')}
              value={ratingNav}
              onChange={setRatingNav}
            />

            <StarSelector
              label={t('feedback.waitRating')}
              value={ratingWait}
              onChange={setRatingWait}
            />

            <StarSelector
              label={t('feedback.easeRating')}
              value={ratingEase}
              onChange={setRatingEase}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t('feedback.comments')}
              </label>
              <textarea
                rows={3}
                placeholder="Share any difficulties with navigation, counter crowd or staff interaction..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs text-gray-900 dark:text-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : t('feedback.submit')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
