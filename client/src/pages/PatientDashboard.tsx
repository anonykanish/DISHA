import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePatientVisit } from '../context/PatientVisitContext';
import { QueueTicketCard } from '../components/queue/QueueTicketCard';
import { MissedTokenModal } from '../components/queue/MissedTokenModal';
import { QRCodeModal } from '../components/common/QRCodeModal';
import {
  Compass,
  Users,
  Route,
  Mic,
  Building2,
  HelpCircle,
  Sliders,
  Bell,
  MapPin,
  QrCode,
  Share2,
  Sparkles,
  ArrowRight,
  Droplets,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface PatientDashboardProps {
  onOpenVoice: () => void;
  onOpenAccessibility: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onOpenVoice,
  onOpenAccessibility
}) => {
  const { t } = useTranslation();
  const { visit, activeToken, tokenInfo, journeySteps, qrCodeUrl } = usePatientVisit();
  const navigate = useNavigate();

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isMissedModalOpen, setIsMissedModalOpen] = useState(false);

  // Compute journey completion progress
  const completedStepsCount = journeySteps.filter(s => s.status === 'completed').length;
  const progressPercent = journeySteps.length > 0 ? Math.round((completedStepsCount / journeySteps.length) * 100) : 35;

  // Determine current active or next destination step
  const currentStep = journeySteps.find(s => s.status === 'in_progress') || journeySteps.find(s => s.status === 'pending') || journeySteps[0];

  const handleNavigateToNext = () => {
    let destNode = 'N-G-OPD';
    if (currentStep) {
      if (currentStep.department_id === 'dept-lab') destNode = 'N-1-LAB';
      else if (currentStep.department_id === 'dept-pha') destNode = 'N-G-PHARMACY';
      else if (currentStep.department_id === 'dept-reg') destNode = 'N-G-REG';
      else if (currentStep.department_id === 'dept-bld') destNode = 'N-1-BLOOD';
      else if (currentStep.department_id === 'dept-flw') destNode = 'N-2-FOLLOWUP';
    }
    navigate(`/navigation?dest=${destNode}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Welcome & Hospital Header */}
      <div className="bg-white dark:bg-disha-darkCard p-5 sm:p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
              {t('dashboard.welcome')}, {visit?.patient_name || 'Ramesh Kumar (Demo Patient)'}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Active Visit
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-disha-lightPrimary dark:text-disha-darkPrimary" />
            <span>Disha Demo Government Hospital</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span>Pass: <strong>{visit?.access_token || 'DISHA-DEMO-2026'}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Digital QR Pass */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition"
          >
            <QrCode className="w-4 h-4 text-disha-lightPrimary dark:text-disha-darkPrimary" />
            <span>Digital Pass</span>
          </button>

          {/* Caregiver Share Link */}
          <Link
            to="/facilities"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs font-bold text-disha-lightPrimary dark:text-disha-darkPrimary border border-teal-200 dark:border-teal-800 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Caregiver Link</span>
          </Link>
        </div>
      </div>

      {/* Journey Progress Bar */}
      <div className="bg-white dark:bg-disha-darkCard p-4 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">
            Hospital Visit Completion Progress
          </span>
          <span className="font-extrabold text-disha-lightPrimary dark:text-disha-darkPrimary">
            {progressPercent}% Complete
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-disha-lightPrimary to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* PRIMARY TWO-COLUMN ACTION CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. DIGITAL QUEUE TICKET */}
        {activeToken ? (
          <QueueTicketCard
            token={activeToken}
            departmentState={tokenInfo?.department}
            patientsAhead={tokenInfo?.patientsAhead || 4}
            estimatedWaitMinutes={tokenInfo?.estimatedWaitMinutes || 16}
            onNavigate={handleNavigateToNext}
            onRequestRecovery={() => setIsMissedModalOpen(true)}
          />
        ) : (
          <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm text-center space-y-3">
            <Users className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">No Active Queue Token</h3>
            <p className="text-xs text-gray-500">You are not currently in any waiting line.</p>
            <Link
              to="/queue"
              className="inline-block py-2 px-4 rounded-xl bg-disha-lightPrimary text-white font-bold text-xs"
            >
              Join Department Queue
            </Link>
          </div>
        )}

        {/* 2. NEXT DESTINATION CARD */}
        <div className="bg-white dark:bg-disha-darkCard rounded-card p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t('dashboard.nextDestination')}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                Step {currentStep?.step_order || 2} of {journeySteps.length || 4}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                {currentStep?.department_name || 'General OPD Consultation'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-disha-lightPrimary dark:text-disha-darkPrimary" />
                <span>Floor {currentStep?.floor ?? 0} (Ground), {currentStep?.block || 'Block A'}</span>
                <span>• Room {currentStep?.room_number || 'G-12'}</span>
              </p>
            </div>

            {/* Smart Wait Assistant Suggestion */}
            <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-disha-lightPrimary dark:text-disha-darkPrimary">
                <Sparkles className="w-4 h-4" />
                <span>{t('dashboard.smartWait')}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('dashboard.smartWaitText', { mins: tokenInfo?.estimatedWaitMinutes || 16 })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleNavigateToNext}
              className="flex-1 py-3 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-black text-xs rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>{t('dashboard.navigateNow')}</span>
            </button>

            <Link
              to="/journey"
              className="py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition"
            >
              Full Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* 8 LARGE SHORTCUT CARDS */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          {t('dashboard.shortcuts')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* 1. Navigate Hospital */}
          <Link
            to="/navigation"
            className="p-4 rounded-card bg-white dark:bg-disha-darkCard border border-gray-200 dark:border-gray-800 hover:border-teal-500 shadow-sm hover:shadow transition group flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-disha-lightPrimary dark:text-disha-darkPrimary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
              {t('dashboard.cardNavigate')}
            </span>
          </Link>

          {/* 2. My Queue */}
          <Link
            to="/queue"
            className="p-4 rounded-card bg-white dark:bg-disha-darkCard border border-gray-200 dark:border-gray-800 hover:border-teal-500 shadow-sm hover:shadow transition group flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
              {t('dashboard.cardQueue')}
            </span>
          </Link>

          {/* 3. My Visit Roadmap */}
          <Link
            to="/journey"
            className="p-4 rounded-card bg-white dark:bg-disha-darkCard border border-gray-200 dark:border-gray-800 hover:border-teal-500 shadow-sm hover:shadow transition group flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Route className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
              {t('dashboard.cardJourney')}
            </span>
          </Link>

          {/* 4. Voice Assistant */}
          <button
            onClick={onOpenVoice}
            className="p-4 rounded-card bg-white dark:bg-disha-darkCard border border-gray-200 dark:border-gray-800 hover:border-teal-500 shadow-sm hover:shadow transition group flex flex-col justify-between h-28 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
              {t('dashboard.cardVoice')}
            </span>
          </button>

          {/* 5. Find Facilities */}
          <Link
            to="/facilities"
            className="p-4 rounded-card bg-white dark:bg-disha-darkCard border border-gray-200 dark:border-gray-800 hover:border-teal-500 shadow-sm hover:shadow transition group flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
              {t('dashboard.cardFacilities')}
            </span>
          </Link>

          {/* 6. Help Desk */}
          <button
            onClick={() => navigate('/navigation?dest=N-G-HELPDESK')}
            className="p-4 rounded-card bg-white dark:bg-disha-darkCard border border-gray-200 dark:border-gray-800 hover:border-teal-500 shadow-sm hover:shadow transition group flex flex-col justify-between h-28 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
              {t('dashboard.cardHelp')}
            </span>
          </button>

          {/* 7. Accessibility */}
          <button
            onClick={onOpenAccessibility}
            className="p-4 rounded-card bg-white dark:bg-disha-darkCard border border-gray-200 dark:border-gray-800 hover:border-teal-500 shadow-sm hover:shadow transition group flex flex-col justify-between h-28 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
              {t('dashboard.cardAccessibility')}
            </span>
          </button>

          {/* 8. Announcements */}
          <div className="p-4 rounded-card bg-white dark:bg-disha-darkCard border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
              Stock Replenished
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        qrCodeUrl={qrCodeUrl}
        visit={visit}
        activeToken={activeToken}
      />

      {activeToken && (
        <MissedTokenModal
          isOpen={isMissedModalOpen}
          onClose={() => setIsMissedModalOpen(false)}
          tokenId={activeToken.id}
          tokenNumber={activeToken.token_number}
        />
      )}
    </div>
  );
};
