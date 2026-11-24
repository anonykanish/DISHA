import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePatientVisit } from '../context/PatientVisitContext';
import {
  Compass,
  Users,
  Languages,
  Accessibility,
  Mic,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Building,
  WifiOff,
  Flame,
  UserCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { loadDemoVisit } = usePatientVisit();
  const navigate = useNavigate();

  const handleLaunchDemo = async () => {
    await loadDemoVisit();
    navigate('/dashboard');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 bg-gradient-to-b from-disha-lightSecondary/40 via-transparent to-transparent dark:from-disha-darkSecondary/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-disha-lightPrimary dark:text-disha-darkPrimary" />
            <span>DISHA • {t('app.tagline')}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-50 leading-[1.15]">
            {t('landing.heroTitle')}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <Link
              to="/onboarding"
              className="px-6 py-3.5 rounded-xl bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-extrabold text-sm shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition flex items-center gap-2"
            >
              <span>{t('nav.startVisit')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleLaunchDemo}
              className="px-6 py-3.5 rounded-xl bg-white dark:bg-disha-darkCard text-disha-lightPrimary dark:text-disha-darkPrimary border-2 border-disha-lightPrimary dark:border-disha-darkPrimary font-extrabold text-sm shadow-md hover:bg-teal-50 dark:hover:bg-teal-950/40 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('nav.demoMode')} (Judge Patient OPD-024)</span>
            </button>

            <Link
              to="/admin/login"
              className="px-5 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('nav.staffLogin')}</span>
            </Link>
          </div>

          {/* Guest flow assurance */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>Continue as guest anytime. No Aadhaar or password needed.</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (4-STEP PROCESS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
            {t('landing.howItWorks')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            {t('landing.howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 relative group hover:border-teal-400 transition">
            <span className="text-3xl font-black text-teal-100 dark:text-teal-950/90 group-hover:text-teal-200 transition">01</span>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
              {t('landing.step1Title')}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 relative group hover:border-teal-400 transition">
            <span className="text-3xl font-black text-teal-100 dark:text-teal-950/90 group-hover:text-teal-200 transition">02</span>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
              {t('landing.step2Title')}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.step2Desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 relative group hover:border-teal-400 transition">
            <span className="text-3xl font-black text-teal-100 dark:text-teal-950/90 group-hover:text-teal-200 transition">03</span>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
              {t('landing.step3Title')}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.step3Desc')}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 relative group hover:border-teal-400 transition">
            <span className="text-3xl font-black text-teal-100 dark:text-teal-950/90 group-hover:text-teal-200 transition">04</span>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
              {t('landing.step4Title')}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.step4Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
            {t('landing.featuresTitle')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Solving real-world pain points in high-volume public healthcare institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feat 1 */}
          <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-disha-lightPrimary dark:text-disha-darkPrimary">
              <Languages className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">
              {t('landing.feat1Title')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.feat1Desc')}
            </p>
          </div>

          {/* Feat 2 */}
          <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-disha-lightPrimary dark:text-disha-darkPrimary">
              <Accessibility className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">
              {t('landing.feat2Title')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.feat2Desc')}
            </p>
          </div>

          {/* Feat 3 */}
          <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-disha-lightPrimary dark:text-disha-darkPrimary">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">
              {t('landing.feat3Title')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.feat3Desc')}
            </p>
          </div>

          {/* Feat 4 */}
          <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-disha-lightPrimary dark:text-disha-darkPrimary">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">
              {t('landing.feat4Title')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.feat4Desc')}
            </p>
          </div>

          {/* Feat 5 */}
          <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-disha-lightPrimary dark:text-disha-darkPrimary">
              <WifiOff className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">
              {t('landing.feat5Title')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.feat5Desc')}
            </p>
          </div>

          {/* Feat 6 */}
          <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-disha-lightPrimary dark:text-disha-darkPrimary">
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">
              {t('landing.feat6Title')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.feat6Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* QUICK LAUNCH BANNER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-disha-lightPrimary to-teal-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black">
              Visiting the Hospital Right Now?
            </h3>
            <p className="text-xs sm:text-sm text-teal-100">
              Get an instant digital token and route in under 30 seconds.
            </p>
          </div>
          <Link
            to="/onboarding"
            className="px-6 py-3 rounded-xl bg-white text-disha-lightPrimary font-black text-sm shadow hover:bg-teal-50 transition shrink-0"
          >
            Start Hospital Visit
          </Link>
        </div>
      </section>
    </div>
  );
};
