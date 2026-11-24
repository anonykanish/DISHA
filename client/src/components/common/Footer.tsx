import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Shield, PhoneCall, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-disha-darkBg border-t border-gray-200/80 dark:border-gray-800 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-gray-100">
                DISHA
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                • {t('app.tagline')}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              Accessible, multilingual, low-bandwidth patient navigation and digital queue management platform for overcrowded Indian government hospitals.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <Link to="/facilities" className="hover:text-disha-lightPrimary dark:hover:text-disha-darkPrimary transition">Facilities</Link>
            <Link to="/feedback" className="hover:text-disha-lightPrimary dark:hover:text-disha-darkPrimary transition">Feedback</Link>
            <Link to="/admin/login" className="hover:text-disha-lightPrimary dark:hover:text-disha-darkPrimary transition">Staff Portal</Link>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>National Ambulance: 102 / 112</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-disha-lightPrimary dark:text-disha-darkPrimary" />
            <span>Built for Microsoft Hackathon • WCAG 2.2 AA Accessible • Offline Capable PWA</span>
          </div>
          <div>
            <span>Fictional demonstration for "Disha Demo Government Hospital".</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
