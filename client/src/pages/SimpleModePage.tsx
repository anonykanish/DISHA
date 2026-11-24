import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePatientVisit } from '../context/PatientVisitContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { speechService } from '../services/speech';
import {
  Compass,
  Users,
  Volume2,
  HelpCircle,
  ArrowLeft,
  MapPin,
  Sparkles
} from 'lucide-react';

export const SimpleModePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { activeToken, tokenInfo, journeySteps } = usePatientVisit();
  const { updateSetting } = useAccessibility();
  const navigate = useNavigate();

  const currentStep = journeySteps.find(s => s.status === 'in_progress') || journeySteps.find(s => s.status === 'pending') || journeySteps[0];

  const handleSpeakDirections = () => {
    const text = `Your next stop is ${currentStep?.department_name || 'General OPD'}. Located on Floor ${currentStep?.floor ?? 0}, Room ${currentStep?.room_number || 'G-12'}. Your token is ${activeToken?.token_number || 'OPD-024'}. There are ${tokenInfo?.patientsAhead || 4} patients ahead.`;
    speechService.speak(text, i18n.language);
  };

  const handleExitSimpleMode = () => {
    updateSetting('simpleMode', false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] max-w-2xl mx-auto px-4 py-6 space-y-6 flex flex-col justify-between">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span className="font-black text-sm uppercase tracking-wide text-gray-800 dark:text-gray-200">
            Simple Mode (Senior Citizen & Easy Care)
          </span>
        </div>
        <button
          onClick={handleExitSimpleMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Normal View</span>
        </button>
      </div>

      {/* 4 GIANT HIGH-CONTRAST ACCESSIBLE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
        {/* CARD 1: MY NEXT STOP */}
        <button
          onClick={() => navigate('/navigation?dest=N-G-OPD')}
          className="p-6 rounded-3xl bg-teal-600 text-white shadow-xl hover:bg-teal-700 active:scale-98 transition flex flex-col justify-between text-left h-56"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black uppercase tracking-wider opacity-85">Next Stop</span>
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black leading-tight">
              {currentStep?.department_name || 'General OPD'}
            </h2>
            <p className="text-sm font-semibold opacity-90 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Floor {currentStep?.floor ?? 0} • Room {currentStep?.room_number || 'G-12'}</span>
            </p>
          </div>

          <span className="text-xs font-black underline uppercase tracking-wider">
            Tap to Show Map Arrow →
          </span>
        </button>

        {/* CARD 2: MY TOKEN */}
        <button
          onClick={() => navigate('/queue')}
          className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white shadow-xl hover:bg-slate-950 active:scale-98 transition flex flex-col justify-between text-left h-56 border-2 border-teal-400"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400">My Token</span>
            <Users className="w-8 h-8 text-teal-400" />
          </div>

          <div className="space-y-0.5">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {activeToken?.token_number || 'OPD-024'}
            </span>
            <p className="text-xs font-bold text-teal-300">
              Now Serving: {tokenInfo?.department?.nowServingToken || 'OPD-020'}
            </p>
          </div>

          <span className="text-xs font-bold text-gray-300">
            {tokenInfo?.patientsAhead || 4} patients ahead (~{tokenInfo?.estimatedWaitMinutes || 16} mins)
          </span>
        </button>

        {/* CARD 3: SPEAK DIRECTIONS */}
        <button
          onClick={handleSpeakDirections}
          className="p-6 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white shadow-xl active:scale-98 transition flex flex-col justify-between text-left h-56"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Audio Guide</span>
            <Volume2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black">
              Speak Directions
            </h2>
            <p className="text-xs font-medium opacity-90">
              Press to hear where to walk and your token status aloud.
            </p>
          </div>

          <span className="text-xs font-black underline uppercase tracking-wider">
            Tap to Listen Now 🔊
          </span>
        </button>

        {/* CARD 4: GET HELP */}
        <button
          onClick={() => navigate('/navigation?dest=N-G-HELPDESK')}
          className="p-6 rounded-3xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl active:scale-98 transition flex flex-col justify-between text-left h-56"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Assistance</span>
            <HelpCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black">
              Get Help
            </h2>
            <p className="text-xs font-medium opacity-90">
              Central Help Desk, wheelchair marshals and emergency triage.
            </p>
          </div>

          <span className="text-xs font-black underline uppercase tracking-wider">
            Route to Help Desk →
          </span>
        </button>
      </div>
    </div>
  );
};
