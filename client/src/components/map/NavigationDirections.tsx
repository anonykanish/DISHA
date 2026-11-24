import React from 'react';
import { useTranslation } from 'react-i18next';
import { RouteResult, NavigationStep } from '../../types';
import { Volume2, VolumeX, ArrowRight, ArrowLeft, ArrowUp, CornerDownRight, CheckCircle2, Accessibility } from 'lucide-react';
import { speechService } from '../../services/speech';

interface NavigationDirectionsProps {
  route: RouteResult;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onFloorChangeRequired?: (floor: number) => void;
}

export const NavigationDirections: React.FC<NavigationDirectionsProps> = ({
  route,
  currentStepIndex,
  onStepChange,
  onFloorChangeRequired
}) => {
  const { t, i18n } = useTranslation();
  const currentStep = route.steps[currentStepIndex];

  const handleReadAloud = () => {
    if (!currentStep) return;
    const text = `Step ${currentStep.stepNumber}. ${currentStep.instruction}. Walk approximately ${currentStep.distanceMeters} meters.`;
    speechService.speak(text, i18n.language);
  };

  const handleNext = () => {
    if (currentStepIndex < route.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      onStepChange(nextIdx);
      const nextStep = route.steps[nextIdx];
      if (nextStep && nextStep.floorChange && onFloorChangeRequired) {
        onFloorChangeRequired(nextStep.toFloor);
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      onStepChange(prevIdx);
      const prevStep = route.steps[prevIdx];
      if (prevStep && onFloorChangeRequired) {
        onFloorChangeRequired(prevStep.fromFloor);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-disha-darkCard rounded-card p-4 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
      {/* Overview Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-gray-900 dark:text-gray-100">
            {t('navigation.stepByStep')}
          </span>
          {route.wheelchairAccessible && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
              <Accessibility className="w-3.5 h-3.5" /> Wheelchair Route
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{t('navigation.totalDistance')}: <strong>{route.totalDistanceMeters}m</strong></span>
          <span>•</span>
          <span>{t('navigation.estimatedWalk')}: <strong>~{route.estimatedWalkTimeMinutes} min</strong></span>
        </div>
      </div>

      {/* Active Step Card */}
      {currentStep && (
        <div className="bg-disha-lightSecondary/50 dark:bg-disha-darkSecondary/30 p-4 rounded-xl border border-teal-200 dark:border-teal-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-disha-lightPrimary dark:text-disha-darkPrimary">
              {t('navigation.step')} {currentStep.stepNumber} of {route.steps.length}
            </span>
            <button
              onClick={handleReadAloud}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-disha-darkCard hover:bg-teal-50 dark:hover:bg-teal-900/40 text-disha-lightPrimary dark:text-disha-darkPrimary rounded-lg text-xs font-semibold shadow-sm border border-teal-200 dark:border-teal-800 transition"
              title={t('navigation.readAloud')}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t('navigation.readAloud')}</span>
            </button>
          </div>

          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">
            {currentStep.instruction}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
            <span>Distance: <strong>{currentStep.distanceMeters} meters</strong></span>
            {currentStep.floorChange && (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                ⚠️ {t('navigation.floorChange')} (Floor {currentStep.fromFloor} → {currentStep.toFloor})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Navigation Step Buttons */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border transition ${
            currentStepIndex === 0
              ? 'border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('navigation.prev')}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentStepIndex === route.steps.length - 1}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm ${
            currentStepIndex === route.steps.length - 1
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg hover:opacity-90'
          }`}
        >
          {currentStepIndex === route.steps.length - 1 ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Arrived at Destination</span>
            </>
          ) : (
            <>
              <span>{t('navigation.next')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
