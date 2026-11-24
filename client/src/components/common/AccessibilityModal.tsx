import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../context/AccessibilityContext';
import { X, Type, Contrast, ZapOff, Sparkles, Volume2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSimpleModeToggle = (value: boolean) => {
    updateSetting('simpleMode', value);
    if (value) {
      onClose();
      navigate('/simple');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-disha-darkCard w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-disha-lightPrimary dark:text-disha-darkPrimary font-bold text-base">
            <Contrast className="w-5 h-5" />
            <span>{t('accessibility.title')} (WCAG 2.2 AA)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Simple Interface Mode (Elderly Friendly) */}
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-disha-lightPrimary dark:text-disha-darkPrimary" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{t('accessibility.simpleMode')}</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {t('accessibility.simpleModeDesc')}
              </p>
            </div>
            <button
              onClick={() => handleSimpleModeToggle(!settings.simpleMode)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.simpleMode ? 'bg-disha-lightPrimary dark:bg-disha-darkPrimary justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Large Text Mode */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Type className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{t('accessibility.largeText')}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Increases font size for comfortable reading.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.largeText}
              onChange={(e) => updateSetting('largeText', e.target.checked)}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
          </div>

          {/* High Contrast Mode */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Contrast className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{t('accessibility.highContrast')}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Maximizes color contrast for low-vision patients.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => updateSetting('highContrast', e.target.checked)}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
          </div>

          {/* Reduced Motion (Low Bandwidth) */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ZapOff className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{t('accessibility.reducedMotion')}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Disables animations to save battery and data.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
          </div>

          {/* Voice Guidance */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{t('accessibility.voiceGuidance')}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Speaks out turns and queue alerts automatically.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.voiceGuidance}
              onChange={(e) => updateSetting('voiceGuidance', e.target.checked)}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
          </div>

          {/* Speech Speed Selector */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Voice Speed:</span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{settings.speechSpeed}x</span>
            </div>
            <div className="flex items-center gap-2">
              {[0.8, 1.0, 1.2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => updateSetting('speechSpeed', spd)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                    settings.speechSpeed === spd
                      ? 'bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg border-teal-600'
                      : 'bg-white dark:bg-disha-darkBg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {spd}x {spd === 0.8 ? '(Slower)' : spd === 1.0 ? '(Normal)' : '(Fast)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={resetSettings}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-xs rounded-xl shadow transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
