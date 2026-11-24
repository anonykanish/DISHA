import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, QrCode, Printer, ShieldCheck } from 'lucide-react';
import { Visit, QueueToken } from '../../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string | null;
  visit: Visit | null;
  activeToken: QueueToken | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  qrCodeUrl,
  visit,
  activeToken
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-disha-darkCard w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-teal-50/50 dark:bg-teal-950/30">
          <div className="flex items-center gap-2 text-disha-lightPrimary dark:text-disha-darkPrimary font-bold text-sm">
            <QrCode className="w-5 h-5" />
            <span>Digital Hospital Visit Pass</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
              Disha Demo Government Hospital
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pass ID: <strong className="text-disha-lightPrimary dark:text-disha-darkPrimary">{visit?.access_token || 'DSH-2026'}</strong>
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl inline-block shadow-md border border-gray-200">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Visit QR Pass" className="w-48 h-48 mx-auto" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                Generating QR Pass...
              </div>
            )}
          </div>

          {/* Token Info */}
          {activeToken && (
            <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Initial Queue Token</span>
              <p className="text-2xl font-black text-disha-lightPrimary dark:text-disha-darkPrimary">
                {activeToken.token_number}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                {activeToken.department_name || 'General OPD'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Show this QR at reception or kiosk counters</span>
          </div>

          <button
            onClick={handlePrint}
            className="w-full py-2.5 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print or Save Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};
