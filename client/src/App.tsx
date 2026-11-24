import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { SocketProvider } from './context/SocketContext';
import { PatientVisitProvider } from './context/PatientVisitContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { BottomNav } from './components/common/BottomNav';
import { AccessibilityModal } from './components/common/AccessibilityModal';
import { VoiceAssistantModal } from './components/common/VoiceAssistantModal';
import { EmergencyButton } from './components/common/EmergencyButton';
import { ToastContainer } from './components/common/ToastContainer';
import { DemoControlPanel } from './components/common/DemoControlPanel';
import { QRScannerModal } from './components/map/QRScannerModal';

import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { NavigationPage } from './pages/NavigationPage';
import { QueuePage } from './pages/QueuePage';
import { JourneyPage } from './pages/JourneyPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { CaregiverViewPage } from './pages/CaregiverViewPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { SimpleModePage } from './pages/SimpleModePage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { fetchCheckpoints } from './services/api';
import './locales/i18n';

export const App: React.FC = () => {
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isDemoQRScannerOpen, setIsDemoQRScannerOpen] = useState(false);
  const [demoCheckpoints, setDemoCheckpoints] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Preload demo checkpoints
    fetchCheckpoints('hosp-demo-01').then(setDemoCheckpoints).catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSimulateOfflineToggle = () => {
    setIsSimulatedOffline(prev => !prev);
  };

  const effectiveOffline = isOffline || isSimulatedOffline;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <SocketProvider>
            <PatientVisitProvider>
              <Router>
                <div className="min-h-screen flex flex-col bg-disha-lightBg dark:bg-disha-darkBg text-disha-lightText dark:text-disha-darkText transition-colors duration-200 font-sans selection:bg-teal-500 selection:text-white">
                  {/* Offline Warning Banner */}
                  {effectiveOffline && (
                    <div className="bg-amber-500 text-slate-900 px-4 py-2 text-xs font-bold text-center shadow-sm flex items-center justify-center gap-2">
                      <span>⚠️ You're offline. Saved hospital directions and floor plans remain fully available.</span>
                    </div>
                  )}

                  {/* Header Navbar */}
                  <Navbar
                    onOpenAccessibility={() => setIsAccessibilityOpen(true)}
                    onOpenVoice={() => setIsVoiceOpen(true)}
                    isOffline={effectiveOffline}
                  />

                  {/* Main Page Routing */}
                  <main className="flex-1 pb-16 md:pb-6">
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      <Route
                        path="/dashboard"
                        element={
                          <PatientDashboard
                            onOpenVoice={() => setIsVoiceOpen(true)}
                            onOpenAccessibility={() => setIsAccessibilityOpen(true)}
                          />
                        }
                      />
                      <Route path="/navigation" element={<NavigationPage />} />
                      <Route path="/queue" element={<QueuePage />} />
                      <Route path="/journey" element={<JourneyPage />} />
                      <Route path="/facilities" element={<FacilitiesPage />} />
                      <Route path="/caregiver/:shareToken" element={<CaregiverViewPage />} />
                      <Route path="/feedback" element={<FeedbackPage />} />
                      <Route path="/simple" element={<SimpleModePage />} />
                      <Route path="/admin/login" element={<AdminLoginPage />} />
                      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>

                  {/* Global Floating Elements */}
                  <EmergencyButton />
                  <DemoControlPanel
                    onScanDemoCheckpoint={() => setIsDemoQRScannerOpen(true)}
                    onSimulateOfflineToggle={handleSimulateOfflineToggle}
                    isSimulatedOffline={isSimulatedOffline}
                  />
                  <ToastContainer />

                  {/* Mobile Bottom Navigation Bar */}
                  <BottomNav />

                  {/* Modals */}
                  <AccessibilityModal
                    isOpen={isAccessibilityOpen}
                    onClose={() => setIsAccessibilityOpen(false)}
                  />

                  <VoiceAssistantModal
                    isOpen={isVoiceOpen}
                    onClose={() => setIsVoiceOpen(false)}
                  />

                  <QRScannerModal
                    isOpen={isDemoQRScannerOpen}
                    onClose={() => setIsDemoQRScannerOpen(false)}
                    checkpoints={demoCheckpoints}
                    onCheckpointScanned={(nodeId) => {
                      window.location.href = `/navigation?dest=${nodeId}`;
                    }}
                  />

                  {/* Global Footer */}
                  <Footer />
                </div>
              </Router>
            </PatientVisitProvider>
          </SocketProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
