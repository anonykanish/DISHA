import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  MapPin,
  Plus,
  Sun,
  Moon,
  Globe,
  Sliders,
  Mic,
  ShieldCheck,
  Menu,
  X,
  WifiOff
} from 'lucide-react';

interface NavbarProps {
  onOpenAccessibility: () => void;
  onOpenVoice: () => void;
  isOffline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAccessibility,
  onOpenVoice,
  isOffline = false
}) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const { settings } = useAccessibility();
  const location = useLocation();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-disha-darkBg/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* LOGO: DISHA with Location Pin and Healthcare Cross */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 rounded-xl bg-disha-lightPrimary dark:bg-disha-darkPrimary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            {/* Minimal Location Pin Base */}
            <MapPin className="w-5 h-5 text-white dark:text-disha-darkBg" />
            {/* Healthcare Cross Overlay */}
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-disha-emergency text-white flex items-center justify-center text-[10px] font-black shadow">
              <Plus className="w-3 h-3 stroke-[3]" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
                DISHA
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-disha-lightPrimary dark:text-disha-darkPrimary uppercase">
                Govt AI
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
              {t('app.tagline')}
            </p>
          </div>
        </Link>

        {/* Offline Badge */}
        {isOffline && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold animate-pulse border border-amber-300 dark:border-amber-700">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Offline Mode</span>
          </div>
        )}

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              location.pathname === '/dashboard'
                ? 'bg-disha-lightSecondary dark:bg-disha-darkSecondary text-disha-lightPrimary dark:text-disha-darkPrimary'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/navigation"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              location.pathname === '/navigation'
                ? 'bg-disha-lightSecondary dark:bg-disha-darkSecondary text-disha-lightPrimary dark:text-disha-darkPrimary'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('nav.map')}
          </Link>
          <Link
            to="/queue"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              location.pathname === '/queue'
                ? 'bg-disha-lightSecondary dark:bg-disha-darkSecondary text-disha-lightPrimary dark:text-disha-darkPrimary'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('nav.queue')}
          </Link>
          <Link
            to="/journey"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              location.pathname === '/journey'
                ? 'bg-disha-lightSecondary dark:bg-disha-darkSecondary text-disha-lightPrimary dark:text-disha-darkPrimary'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('nav.journey')}
          </Link>
          <Link
            to="/facilities"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              location.pathname === '/facilities'
                ? 'bg-disha-lightSecondary dark:bg-disha-darkSecondary text-disha-lightPrimary dark:text-disha-darkPrimary'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('nav.facilities')}
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Voice Assistant Button */}
          <button
            onClick={onOpenVoice}
            className="p-2 rounded-xl text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 transition"
            title={t('nav.voice')}
            aria-label={t('nav.voice')}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Accessibility Settings Modal Button */}
          <button
            onClick={onOpenAccessibility}
            className={`p-2 rounded-xl border transition ${
              settings.largeText || settings.highContrast || settings.simpleMode
                ? 'bg-disha-lightPrimary text-white dark:bg-disha-darkPrimary dark:text-disha-darkBg border-teal-600'
                : 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
            }`}
            title={t('nav.accessibility')}
            aria-label={t('nav.accessibility')}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-disha-lightPrimary dark:text-disha-darkPrimary" />
              <span>{availableLanguages.find(l => l.code === currentLanguage)?.native || 'EN'}</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-disha-darkCard rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-teal-50 dark:hover:bg-teal-950/40 transition ${
                      currentLanguage === lang.code
                        ? 'text-disha-lightPrimary dark:text-disha-darkPrimary font-bold bg-teal-50/50 dark:bg-teal-900/20'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] text-gray-400 font-normal">({lang.label})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition"
            title="Toggle Light/Dark Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Staff Login Link */}
          <Link
            to="/admin/login"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs font-bold text-disha-lightPrimary dark:text-disha-darkPrimary transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff</span>
          </Link>

          {/* Mobile menu hamburger toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-white dark:bg-disha-darkBg border-b border-gray-200 dark:border-gray-800 shadow-lg">
          <Link
            to="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/navigation"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t('nav.map')}
          </Link>
          <Link
            to="/queue"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t('nav.queue')}
          </Link>
          <Link
            to="/journey"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t('nav.journey')}
          </Link>
          <Link
            to="/facilities"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t('nav.facilities')}
          </Link>
          <Link
            to="/admin/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-disha-lightPrimary dark:text-disha-darkPrimary hover:bg-teal-50 dark:hover:bg-teal-950/40"
          >
            {t('nav.staffLogin')}
          </Link>
        </div>
      )}
    </header>
  );
};
