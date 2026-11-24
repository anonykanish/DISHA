import React from 'react';
import { usePatientVisit } from '../../context/PatientVisitContext';
import { Bell, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = usePatientVisit();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isUrgent = toast.type === 'urgent';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all flex items-start justify-between gap-3 animate-in slide-in-from-right duration-300 ${
              isUrgent
                ? 'bg-red-500 text-white border-red-600 shadow-red-500/30 ring-4 ring-red-200 dark:ring-red-950'
                : isWarning
                ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 shadow-amber-500/10'
                : isSuccess
                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                : 'bg-white dark:bg-disha-darkCard border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0">
                {isUrgent ? (
                  <Bell className="w-5 h-5 text-white animate-bounce" />
                ) : isWarning ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : isSuccess ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-xs uppercase tracking-wide">
                  {toast.title}
                </h5>
                <p className="text-xs leading-relaxed opacity-95">
                  {toast.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
