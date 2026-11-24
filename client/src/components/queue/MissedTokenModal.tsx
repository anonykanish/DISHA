import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { requestMissedRecovery } from '../../services/api';

interface MissedTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: string;
  tokenNumber: string;
}

export const MissedTokenModal: React.FC<MissedTokenModalProps> = ({
  isOpen,
  onClose,
  tokenId,
  tokenNumber
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('Went for diagnostic test / was waiting in lab');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await requestMissedRecovery(tokenId, reason);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      alert('Failed to submit recovery request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-disha-darkCard w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>{t('queue.requestRecovery')}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Recovery Request Submitted!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hospital reception is reviewing your token {tokenNumber}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {t('queue.recoveryDesc')}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Select Reason for Missing Call:</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-medium text-gray-900 dark:text-gray-100"
              >
                <option value="Went for diagnostic test / was waiting in lab">Undergoing blood test or X-Ray in laboratory</option>
                <option value="Did not hear public announcement">Did not hear counter speaker announcement</option>
                <option value="Wheelchair assistance delay">Delayed due to wheelchair assistance / elevator crowd</option>
                <option value="Washroom or drinking water break">Briefly left for drinking water or restroom</option>
                <option value="Other valid emergency">Other medical urgency</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Send Request to Hospital Staff'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
