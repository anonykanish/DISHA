import React, { createContext, useContext, useEffect, useState } from 'react';
import { Visit, QueueToken, JourneyStep, PatientAheadInfo } from '../types';
import { fetchVisitDetails, fetchTokenInfo } from '../services/api';
import { useSocket } from './SocketContext';
import { speechService } from '../services/speech';

interface ToastAlert {
  id: string;
  type: 'info' | 'warning' | 'urgent' | 'success';
  title: string;
  message: string;
}

interface PatientVisitContextType {
  visit: Visit | null;
  activeToken: QueueToken | null;
  journeySteps: JourneyStep[];
  tokenInfo: PatientAheadInfo | null;
  qrCodeUrl: string | null;
  isLoading: boolean;
  toasts: ToastAlert[];
  dismissToast: (id: string) => void;
  setVisitData: (data: { visit: Visit; initialToken?: QueueToken; qrCode?: string }) => void;
  refreshVisit: () => Promise<void>;
  loadDemoVisit: () => Promise<void>;
  clearVisit: () => void;
}

const PatientVisitContext = createContext<PatientVisitContextType>({
  visit: null,
  activeToken: null,
  journeySteps: [],
  tokenInfo: null,
  qrCodeUrl: null,
  isLoading: false,
  toasts: [],
  dismissToast: () => {},
  setVisitData: () => {},
  refreshVisit: async () => {},
  loadDemoVisit: async () => {},
  clearVisit: () => {}
});

export const PatientVisitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [activeToken, setActiveToken] = useState<QueueToken | null>(null);
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);
  const [tokenInfo, setTokenInfo] = useState<PatientAheadInfo | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const { socket, isConnected } = useSocket();

  const addToast = (type: 'info' | 'warning' | 'urgent' | 'success', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 6500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load existing visit from localStorage on start
  useEffect(() => {
    const savedTokenOrId = localStorage.getItem('disha_active_visit_id') || 'visit-demo-judge';
    if (savedTokenOrId) {
      loadVisitById(savedTokenOrId);
    }
  }, []);

  const loadVisitById = async (idOrToken: string) => {
    try {
      setIsLoading(true);
      const data = await fetchVisitDetails(idOrToken);
      setVisit(data.visit);
      setJourneySteps(data.steps || []);
      setActiveToken(data.activeToken || (data.tokens && data.tokens[0]) || null);
      setQrCodeUrl(data.qrCode);
      localStorage.setItem('disha_active_visit_id', data.visit.id);

      if (data.activeToken) {
        try {
          const tInfo = await fetchTokenInfo(data.activeToken.token_number);
          setTokenInfo(tInfo);
        } catch (e) {
          // Fallback
        }
      }
    } catch (err) {
      console.warn('Could not load visit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Socket.IO event listeners for real-time queue synchronization
  useEffect(() => {
    if (!socket || !isConnected) return;

    if (visit) {
      socket.emit('join:visit', visit.id);
    }

    if (activeToken) {
      socket.emit('join:department', activeToken.department_id);
    }

    // Queue updated event
    const handleQueueUpdate = async (data: any) => {
      if (activeToken && activeToken.department_id === data.departmentId) {
        try {
          const info = await fetchTokenInfo(activeToken.token_number);
          setTokenInfo(info);

          // Alert logic: 5 ahead or 2 ahead
          if (info.patientsAhead === 2) {
            addToast('warning', 'Turn Approaching!', 'Only 2 patients ahead. Please move to the waiting door.');
          } else if (info.patientsAhead === 5) {
            addToast('info', 'Queue Progress', '5 patients ahead of you. Keep your documents ready.');
          }
        } catch (e) {
          // ignore
        }
      }
    };

    // Token called event
    const handleTokenCalled = (callData: any) => {
      if (activeToken && (activeToken.token_number === callData.tokenNumber || activeToken.id === callData.tokenId)) {
        addToast('urgent', 'YOUR TOKEN HAS BEEN CALLED!', `Please proceed immediately to ${callData.counterNumber || 'Counter 1'}`);
        // Speak alert
        speechService.speak(`Token ${callData.tokenNumber}, please proceed to ${callData.counterNumber || 'Counter 1'}`);
        setActiveToken(prev => prev ? { ...prev, status: 'called', counter_number: callData.counterNumber } : null);
      }
    };

    // Journey updated event
    const handleJourneyUpdate = (newSteps: JourneyStep[]) => {
      setJourneySteps(newSteps);
    };

    socket.on('queue:updated', handleQueueUpdate);
    socket.on('queue:global_updated', handleQueueUpdate);
    socket.on('token:called', handleTokenCalled);
    socket.on('token:public_called', handleTokenCalled);
    socket.on('journey:updated', handleJourneyUpdate);

    return () => {
      socket.off('queue:updated', handleQueueUpdate);
      socket.off('queue:global_updated', handleQueueUpdate);
      socket.off('token:called', handleTokenCalled);
      socket.off('token:public_called', handleTokenCalled);
      socket.off('journey:updated', handleJourneyUpdate);
    };
  }, [socket, isConnected, visit, activeToken]);

  const setVisitData = (data: { visit: Visit; initialToken?: QueueToken; qrCode?: string }) => {
    setVisit(data.visit);
    if (data.initialToken) setActiveToken(data.initialToken);
    if (data.qrCode) setQrCodeUrl(data.qrCode);
    localStorage.setItem('disha_active_visit_id', data.visit.id);
    refreshVisit();
  };

  const refreshVisit = async () => {
    if (visit) {
      await loadVisitById(visit.id);
    }
  };

  const loadDemoVisit = async () => {
    await loadVisitById('visit-demo-judge');
    addToast('success', 'Demo Mode Activated', 'Loaded Judge Demo Patient (Token: OPD-024, General OPD).');
  };

  const clearVisit = () => {
    setVisit(null);
    setActiveToken(null);
    setJourneySteps([]);
    setTokenInfo(null);
    setQrCodeUrl(null);
    localStorage.removeItem('disha_active_visit_id');
  };

  return (
    <PatientVisitContext.Provider
      value={{
        visit,
        activeToken,
        journeySteps,
        tokenInfo,
        qrCodeUrl,
        isLoading,
        toasts,
        dismissToast,
        setVisitData,
        refreshVisit,
        loadDemoVisit,
        clearVisit
      }}
    >
      {children}
    </PatientVisitContext.Provider>
  );
};

export const usePatientVisit = () => useContext(PatientVisitContext);
