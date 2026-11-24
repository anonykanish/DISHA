import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

interface CrowdHeatmapBadgeProps {
  level: 'low' | 'moderate' | 'high';
  showLabel?: boolean;
}

export const CrowdHeatmapBadge: React.FC<CrowdHeatmapBadgeProps> = ({ level, showLabel = true }) => {
  const { t } = useTranslation();

  const configs = {
    low: {
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      label: t('queue.crowdLow')
    },
    moderate: {
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      dot: 'bg-amber-500',
      label: t('queue.crowdModerate')
    },
    high: {
      color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      dot: 'bg-rose-500',
      label: t('queue.crowdHigh')
    }
  };

  const current = configs[level] || configs.low;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.color}`}
      title={`Crowd Density: ${level}`}
    >
      <Users className="w-3.5 h-3.5" />
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {showLabel && <span>{current.label}</span>}
    </span>
  );
};
