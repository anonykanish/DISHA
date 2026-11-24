import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneCall, AlertOctagon, X, MapPin, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmergencyButton: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigateEmergency = () => {
    setIsOpen(false);
    navigate('/navigation?dest=N-G-EMERGENCY');
  };

  return (
    <>
      {/* Floating Emergency SOS Pill */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-disha-emergency text-white font-extrabold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all ring-4 ring-red-300 dark:ring-red-950/80"
        aria-label="Emergency Assistance"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        <AlertOctagon className="w-4 h-4" />
        <span className="tracking-wide">SOS / 102</span>
      </button>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-disha-darkCard w-full max-w-md rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-disha-emergency p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-base">
                <ShieldAlert className="w-6 h-6" />
                <span>HOSPITAL EMERGENCY ASSISTANCE</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                If you or someone near you needs immediate medical attention or triage:
              </p>

              {/* Quick Actions */}
              <div className="space-y-2.5">
                {/* 1. Navigate to Emergency Ward */}
                <button
                  onClick={handleNavigateEmergency}
                  className="w-full p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 text-left transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-red-600 text-white">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-red-900 dark:text-red-200">
                        Emergency Ward (Casualty G-EM)
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-400">
                        Ground Floor Block C • Open 24x7
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-800 dark:text-red-300">Route Now →</span>
                </button>

                {/* 2. Call Hospital On-duty Help Line */}
                <a
                  href="tel:01123456789"
                  className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-teal-600 text-white">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        Hospital Casualty Helpline
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        011-23456789 (Internal Ext. 101)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Call →</span>
                </a>

                {/* 3. Call National Emergency Ambulance */}
                <a
                  href="tel:102"
                  className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-700 text-white">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        National Ambulance (Toll-Free)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Dial 102 or 112
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Dial 102 →</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <strong>First Aid Location:</strong> Stretcher marshals and first-aid kits are also stationed at the Central Help Desk (Room G-00).
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
