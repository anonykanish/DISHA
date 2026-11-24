import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';

interface FloorSelectorProps {
  currentFloor: number;
  onSelectFloor: (floor: number) => void;
  floorsWithRoute?: number[];
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({
  currentFloor,
  onSelectFloor,
  floorsWithRoute = []
}) => {
  const { t } = useTranslation();

  const floors = [
    { id: 0, label: t('navigation.groundFloor'), code: 'G' },
    { id: 1, label: t('navigation.firstFloor'), code: '1F' },
    { id: 2, label: t('navigation.secondFloor'), code: '2F' }
  ];

  return (
    <div className="flex items-center gap-1.5 bg-white dark:bg-disha-darkCard p-1.5 rounded-card shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <Layers className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('dashboard.floor')}</span>
      </div>
      {floors.map((f) => {
        const isSelected = currentFloor === f.id;
        const hasRoute = floorsWithRoute.includes(f.id);

        return (
          <button
            key={f.id}
            onClick={() => onSelectFloor(f.id)}
            className={`relative px-3.5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold shadow'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60'
            }`}
          >
            <span>{f.code}</span>
            <span className="hidden md:inline text-xs opacity-90">({f.label})</span>
            {hasRoute && !isSelected && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Route active on this floor" />
            )}
          </button>
        );
      })}
    </div>
  );
};
