import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientVisit } from '../context/PatientVisitContext';
import { fetchDepartments, createVisit } from '../services/api';
import { Department } from '../types';
import { QueueTicketCard } from '../components/queue/QueueTicketCard';
import { MissedTokenModal } from '../components/queue/MissedTokenModal';
import { CrowdHeatmapBadge } from '../components/queue/CrowdHeatmapBadge';
import { Users, Clock, PlusCircle, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QueuePage: React.FC = () => {
  const { t } = useTranslation();
  const { activeToken, tokenInfo, refreshVisit } = usePatientVisit();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isMissedModalOpen, setIsMissedModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDepts();
  }, []);

  const loadDepts = async () => {
    try {
      setIsRefreshing(true);
      const data = await fetchDepartments('hosp-demo-01');
      setDepartments(data);
    } catch (err) {
      console.warn('Error loading depts:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    await refreshVisit();
    await loadDepts();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-disha-lightPrimary dark:text-disha-darkPrimary" />
            <span>{t('queue.title')}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time digital token tracking and department crowd monitoring
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Queues</span>
        </button>
      </div>

      {/* PATIENT'S ACTIVE TOKEN CARD */}
      {activeToken && (
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Your Active Queue Token
          </h2>
          <QueueTicketCard
            token={activeToken}
            departmentState={tokenInfo?.department}
            patientsAhead={tokenInfo?.patientsAhead || 4}
            estimatedWaitMinutes={tokenInfo?.estimatedWaitMinutes || 16}
            onNavigate={() => navigate('/navigation?dest=N-G-OPD')}
            onRequestRecovery={() => setIsMissedModalOpen(true)}
          />
        </div>
      )}

      {/* ALL DEPARTMENTS QUEUE STATUS GRID */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
            Hospital Department Queues & Crowd Levels
          </h2>
          <span className="text-xs text-gray-400">Live Sync</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const state = dept.queueState;
            const waitingCount = state?.totalWaiting ?? 3;
            const nowServing = state?.nowServingToken || 'None';
            const avgTime = dept.average_service_time || 8;
            const estTime = Math.round((waitingCount * avgTime) / (dept.open_counters || 1));

            return (
              <div
                key={dept.id}
                className="bg-white dark:bg-disha-darkCard p-4 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 hover:border-teal-400 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                      {dept.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Floor {dept.floor === 0 ? 'Ground' : dept.floor} • {dept.block}
                    </p>
                  </div>
                  <CrowdHeatmapBadge level={state?.crowdLevel || 'low'} />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl text-center">
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Now Serving</p>
                    <p className="text-base font-black text-gray-900 dark:text-gray-100">{nowServing}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Waiting</p>
                    <p className="text-base font-black text-disha-lightPrimary dark:text-disha-darkPrimary">
                      {waitingCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>Est. wait: <strong>~{estTime}m</strong></span>
                  <span>{dept.open_counters || 2} Counters open</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
