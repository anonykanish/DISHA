import React from 'react';
import { useTranslation } from 'react-i18next';
import { JourneyStep } from '../../types';
import { CheckCircle2, Circle, Clock, MapPin, ChevronRight } from 'lucide-react';

interface JourneyTimelineProps {
  steps: JourneyStep[];
  onNavigateToStep?: (step: JourneyStep) => void;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  steps,
  onNavigateToStep
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'completed';
        const isInProgress = step.status === 'in_progress';

        return (
          <div key={step.id || idx} className="relative group">
            {/* Step Node Dot */}
            <div
              className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                  : isInProgress
                  ? 'bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white shadow-md ring-4 ring-teal-100 dark:ring-teal-950/80 animate-pulse'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-2 border-gray-300 dark:border-gray-700'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isInProgress ? (
                <span className="w-2 h-2 rounded-full bg-white" />
              ) : (
                <span className="text-[10px] font-bold">{step.step_order}</span>
              )}
            </div>

            {/* Step Card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isInProgress
                  ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/80 shadow-sm'
                  : isCompleted
                  ? 'bg-white dark:bg-disha-darkCard border-gray-100 dark:border-gray-800 opacity-85'
                  : 'bg-white dark:bg-disha-darkCard border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">Step {step.step_order}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : isInProgress
                          ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? t('journey.stepCompleted') : isInProgress ? t('journey.stepCurrent') : t('journey.stepUpcoming')}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {step.department_name || `Department ${step.step_order}`}
                  </h4>

                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-disha-lightPrimary dark:text-disha-darkPrimary" />
                    <span>Floor {step.floor ?? 0}, {step.block || 'Block A'}</span>
                    {step.room_number && <span>(Room {step.room_number})</span>}
                  </p>
                </div>

                {onNavigateToStep && (
                  <button
                    onClick={() => onNavigateToStep(step)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-disha-darkBg border border-gray-200 dark:border-gray-700 text-disha-lightPrimary dark:text-disha-darkPrimary hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition"
                  >
                    <span>{t('journey.navigateStep')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
