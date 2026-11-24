import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, QrCode, CheckCircle, MapPin } from 'lucide-react';
import { MapNode } from '../../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkpoints: any[];
  onCheckpointScanned: (nodeId: string, floor: number) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  checkpoints,
  onCheckpointScanned
}) => {
  const { t } = useTranslation();
  const [scannedSuccess, setScannedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCheckpoint = (cp: any) => {
    setScannedSuccess(cp.name);
    setTimeout(() => {
      onCheckpointScanned(cp.id, cp.floor);
      setScannedSuccess(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-disha-darkCard w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-disha-lightPrimary dark:text-disha-darkPrimary font-bold text-base">
            <QrCode className="w-5 h-5" />
            <span>{t('navigation.scanCheckpoint')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-5 space-y-4">
          {/* Simulated Scanner Viewfinder */}
          <div className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-teal-400/60 p-4">
            <div className="w-48 h-32 border-2 border-teal-400 rounded-lg relative flex items-center justify-center">
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white" />
              <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white" />
              <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white" />

              {/* Scanning red laser line */}
              <div className="w-full h-0.5 bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
            </div>

            <p className="text-white text-xs mt-3 opacity-90 text-center">
              Align hospital wall QR code within the frame
            </p>
          </div>

          {scannedSuccess && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 rounded-xl text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Location Verified: {scannedSuccess}</span>
            </div>
          )}

          {/* Demonstration Checkpoints Quick Tap */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Or Tap Any Hospital Wall Checkpoint (Demo):
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {checkpoints.slice(0, 8).map((cp: any) => (
                <button
                  key={cp.id}
                  onClick={() => handleSelectCheckpoint(cp)}
                  className="w-full p-2.5 text-left rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-700/60 transition flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{cp.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    Floor {cp.floor === 0 ? 'G' : cp.floor}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
