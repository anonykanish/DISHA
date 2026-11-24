import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientVisit } from '../../context/PatientVisitContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { demoAdvanceQueue, demoSimulateAnnouncement, demoReset, demoCompleteJourney } from '../../services/api';
import {
  Wrench,
  FastForward,
  BellRing,
  Accessibility,
  WifiOff,
  RotateCcw,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  QrCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemoControlPanelProps {
  onScanDemoCheckpoint?: () => void;
  onSimulateOfflineToggle?: () => void;
  isSimulatedOffline?: boolean;
}

export const DemoControlPanel: React.FC<DemoControlPanelProps> = ({
  onScanDemoCheckpoint,
  onSimulateOfflineToggle,
  isSimulatedOffline = false
}) => {
  const { t } = useTranslation();
  const { loadDemoVisit, refreshVisit } = usePatientVisit();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const flashMessage = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleAdvanceQueue = async () => {
    try {
      setIsProcessing(true);
      const res = await demoAdvanceQueue('dept-opd');
      await refreshVisit();
      flashMessage(`Advanced! Now serving: ${res.newServingToken || 'Next patient'}`);
    } catch (err) {
      flashMessage('Failed to advance queue');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateCall = async () => {
    try {
      setIsProcessing(true);
      await demoSimulateAnnouncement(
        'Token OPD-024 Alert',
        'Token OPD-024 please proceed to Doctor Consultation Room G-12 (Counter 2)'
      );
      flashMessage('Triggered simulated call notification for OPD-024!');
    } catch (err) {
      flashMessage('Notification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteJourney = async () => {
    try {
      setIsProcessing(true);
      await demoCompleteJourney('visit-demo-judge');
      await refreshVisit();
      flashMessage('Demo visit marked as fully completed!');
    } catch (err) {
      flashMessage('Error completing journey');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setIsProcessing(true);
      await demoReset();
      await loadDemoVisit();
      flashMessage('Pristine demo state reset! OPD-024 ready.');
    } catch (err) {
      flashMessage('Error resetting demo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestWheelchair = () => {
    navigate('/navigation?wheelchair=true');
    flashMessage('Navigating with Wheelchair route (Lifts only, no stairs)');
  };

  return (
    <aside aria-label="Demo Controls" className="fixed bottom-20 md:bottom-6 left-4 z-40">
      {/* Floating Toggle Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all border border-slate-700 dark:border-slate-300"
      >
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span>Try Demo (Judge Mode)</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Control Drawer */}
      {isOpen && (
        <div className="absolute bottom-12 left-0 w-80 sm:w-96 bg-white dark:bg-disha-darkCard rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 p-4 space-y-3.5 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Wrench className="w-4 h-4 text-disha-lightPrimary dark:text-disha-darkPrimary" />
              <span>{t('demo.panelTitle')}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              Token: OPD-024
            </span>
          </div>

          {statusMsg && (
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] font-semibold text-teal-900 dark:text-teal-200 text-center animate-in fade-in">
              {statusMsg}
            </div>
          )}

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {/* Advance Queue */}
            <button
              onClick={handleAdvanceQueue}
              disabled={isProcessing}
              className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-disha-lightPrimary dark:text-disha-darkPrimary border border-teal-200 dark:border-teal-800 transition flex items-center gap-2 text-left"
            >
              <FastForward className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
              <span>Advance Queue</span>
            </button>

            {/* Simulate Notification */}
            <button
              onClick={handleSimulateCall}
              disabled={isProcessing}
              className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 transition flex items-center gap-2 text-left"
            >
              <BellRing className="w-4 h-4 shrink-0 text-orange-500" />
              <span>Call OPD-024</span>
            </button>

            {/* Test Wheelchair Mode */}
            <button
              onClick={handleTestWheelchair}
              className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition flex items-center gap-2 text-left"
            >
              <Accessibility className="w-4 h-4 shrink-0 text-blue-500" />
              <span>Wheelchair Route</span>
            </button>

            {/* Scan Checkpoint QR */}
            {onScanDemoCheckpoint && (
              <button
                onClick={onScanDemoCheckpoint}
                className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition flex items-center gap-2 text-left"
              >
                <QrCode className="w-4 h-4 shrink-0 text-purple-500" />
                <span>Scan Checkpoint</span>
              </button>
            )}

            {/* Simulate Offline Mode */}
            {onSimulateOfflineToggle && (
              <button
                onClick={onSimulateOfflineToggle}
                className={`p-2.5 rounded-xl border transition flex items-center gap-2 text-left ${
                  isSimulatedOffline
                    ? 'bg-red-500 text-white border-red-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                }`}
              >
                <WifiOff className="w-4 h-4 shrink-0" />
                <span>{isSimulatedOffline ? 'Go Online' : 'Simulate Offline'}</span>
              </button>
            )}

            {/* Complete Patient Journey */}
            <button
              onClick={handleCompleteJourney}
              disabled={isProcessing}
              className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-2 text-left"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Complete Visit</span>
            </button>
          </div>

          {/* Quick Language & Theme Bar */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {['en', 'hi', 'pa', 'ta'].map((langCode) => (
                <button
                  key={langCode}
                  onClick={() => changeLanguage(langCode)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentLanguage === langCode
                      ? 'bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {langCode.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={handleResetDemo}
            disabled={isProcessing}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Initial State</span>
          </button>
        </div>
      )}
    </aside>
  );
};
