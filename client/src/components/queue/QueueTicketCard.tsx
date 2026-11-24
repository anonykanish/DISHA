import React from 'react';
import { useTranslation } from 'react-i18next';
import { QueueToken, QueueState } from '../../types';
import { Clock, Users, MapPin, AlertCircle, CheckCircle2, BellRing, Sparkles } from 'lucide-react';
import { CrowdHeatmapBadge } from './CrowdHeatmapBadge';

interface QueueTicketCardProps {
  token: QueueToken;
  departmentState?: QueueState | null;
  patientsAhead?: number;
  estimatedWaitMinutes?: number;
  onNavigate?: () => void;
  onRequestRecovery?: () => void;
}

export const QueueTicketCard: React.FC<QueueTicketCardProps> = ({
  token,
  departmentState,
  patientsAhead = 0,
  estimatedWaitMinutes = 0,
  onNavigate,
  onRequestRecovery
}) => {
  const { t } = useTranslation();

  const isCalled = token.status === 'called';
  const isApproaching = token.status === 'approaching';
  const isMissed = token.status === 'missed';
  const isCompleted = token.status === 'completed';

  return (
    <div
      className={`relative rounded-card p-5 border shadow-sm transition-all ${
        isCalled
          ? 'bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40 border-rose-400 dark:border-rose-700 shadow-rose-200/50 dark:shadow-rose-950/30'
          : isApproaching
          ? 'bg-gradient-to-br from-amber-50 to-teal-50 dark:from-amber-950/40 dark:to-teal-950/40 border-amber-300 dark:border-amber-700'
          : 'bg-white dark:bg-disha-darkCard border-gray-200 dark:border-gray-800'
      }`}
    >
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {token.department_name || departmentState?.departmentName || 'Medical Department'}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-disha-lightPrimary dark:text-disha-darkPrimary" />
            <span>Floor {token.floor ?? departmentState?.floor ?? 0}, {token.block || departmentState?.block || 'Block A'}</span>
            {token.room_number && <span>(Room {token.room_number})</span>}
          </div>
        </div>

        {departmentState && (
          <CrowdHeatmapBadge level={departmentState.crowdLevel} />
        )}
      </div>

      {/* Main Token Display Grid */}
      <div className="grid grid-cols-2 gap-4 py-4 items-center">
        {/* Your Token */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('dashboard.yourToken')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-disha-lightPrimary dark:text-disha-darkPrimary">
              {token.token_number}
            </span>
          </div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isCalled
              ? 'bg-red-600 text-white animate-bounce'
              : isApproaching
              ? 'bg-amber-500 text-white'
              : isCompleted
              ? 'bg-emerald-600 text-white'
              : isMissed
              ? 'bg-gray-600 text-white'
              : 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300'
          }`}>
            {isCalled ? t('queue.statusCalled') :
             isApproaching ? t('queue.statusApproaching') :
             isCompleted ? t('queue.statusCompleted') :
             isMissed ? t('queue.statusMissed') :
             t('queue.statusWaiting')}
          </span>
        </div>

        {/* Now Serving */}
        <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 text-right space-y-0.5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('dashboard.nowServing')}
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
            {departmentState?.nowServingToken || '---'}
          </p>
          <p className="text-[11px] font-semibold text-disha-lightPrimary dark:text-disha-darkPrimary">
            {departmentState?.nowServingCounter || 'Counter 1'}
          </p>
        </div>
      </div>

      {/* Queue Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-disha-lightPrimary dark:text-disha-darkPrimary">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('dashboard.patientsAhead')}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {patientsAhead} {patientsAhead === 1 ? 'patient' : 'patients'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-disha-lightPrimary dark:text-disha-darkPrimary">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('dashboard.estimatedWait')}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              ~{estimatedWaitMinutes} mins
            </p>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 italic mt-2">
        * {t('dashboard.estimatedNote')}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-4">
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="flex-1 py-2 px-3 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-xs rounded-xl shadow-sm hover:opacity-95 transition flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('dashboard.navigateNow')}</span>
          </button>
        )}

        {isMissed && onRequestRecovery && (
          <button
            onClick={onRequestRecovery}
            className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t('queue.requestRecovery')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
