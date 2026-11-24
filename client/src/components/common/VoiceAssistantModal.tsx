import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { speechService, SpeechResponse } from '../../services/speech';
import { usePatientVisit } from '../../context/PatientVisitContext';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  MapPin,
  AlertCircle
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { activeToken, tokenInfo } = usePatientVisit();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<SpeechResponse | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);

  const isRecognitionSupported = speechService.isSpeechRecognitionSupported();

  useEffect(() => {
    if (!isOpen) {
      speechService.stopListening();
      speechService.stopSpeaking();
      setIsListening(false);
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartListening = () => {
    if (!isRecognitionSupported) return;

    setTranscript('');
    setResponse(null);
    setIsListening(true);

    const started = speechService.startListening(
      i18n.language,
      (text) => {
        setTranscript(text);
        handleProcessQuery(text);
      },
      (err) => {
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!started) {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const handleProcessQuery = (queryText: string) => {
    const res = speechService.processVoiceCommand(queryText, {
      tokenNumber: activeToken?.token_number,
      patientsAhead: tokenInfo?.patientsAhead,
      waitMinutes: tokenInfo?.estimatedWaitMinutes,
      language: i18n.language
    });

    setResponse(res);
    setIsPlayingAudio(true);
    speechService.speak(res.spokenText, i18n.language, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleRepeat = () => {
    if (!response) return;
    setIsPlayingAudio(true);
    speechService.speak(response.spokenText, i18n.language, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleStopAudio = () => {
    speechService.stopSpeaking();
    setIsPlayingAudio(false);
  };

  const handleSpeedChange = (speed: number) => {
    setSpeechSpeed(speed);
    speechService.setRate(speed);
    if (response) {
      handleRepeat();
    }
  };

  const handleNavigateDestination = () => {
    if (response?.actionDestinationNodeId) {
      onClose();
      navigate(`/navigation?dest=${response.actionDestinationNodeId}`);
    }
  };

  const quickQueries = [
    'Where is the pharmacy?',
    'Where is the registration counter?',
    'What is my token number?',
    'How long is my wait?',
    'Where is the pathology lab?',
    'Where can I find drinking water?'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-disha-darkCard w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-teal-50/50 dark:bg-teal-950/30">
          <div className="flex items-center gap-2 text-disha-lightPrimary dark:text-disha-darkPrimary font-bold text-base">
            <Sparkles className="w-5 h-5" />
            <span>{t('voice.title')}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Microphone Animation Area */}
          <div className="flex flex-col items-center justify-center space-y-3 py-2">
            <div className="relative">
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-teal-400/40 animate-ping" />
                  <div className="absolute -inset-2 rounded-full bg-teal-300/20 animate-pulse" />
                </>
              )}

              <button
                onClick={isListening ? handleStopListening : handleStartListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200 dark:ring-red-950'
                    : 'bg-disha-lightPrimary dark:bg-disha-darkPrimary dark:text-disha-darkBg hover:opacity-95'
                }`}
                title={isListening ? 'Click to Stop' : 'Click to Speak'}
                aria-label="Toggle Microphone"
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {isListening ? t('voice.listening') : t('voice.idle')}
            </p>

            {!isRecognitionSupported && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center max-w-xs">
                {t('voice.notSupported')}
              </p>
            )}
          </div>

          {/* Transcript / Spoken Result Box */}
          {(transcript || response) && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 space-y-3">
              {transcript && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  You asked: "{transcript}"
                </p>
              )}

              {response && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                    {response.spokenText}
                  </p>

                  {/* Audio Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleRepeat}
                        className="p-1.5 rounded-lg bg-white dark:bg-disha-darkCard border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1"
                        title={t('voice.repeat')}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t('voice.repeat')}</span>
                      </button>

                      {isPlayingAudio && (
                        <button
                          onClick={handleStopAudio}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold flex items-center gap-1"
                        >
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>{t('voice.stop')}</span>
                        </button>
                      )}
                    </div>

                    {/* Speed options */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-gray-400">{t('voice.speed')}:</span>
                      {[0.8, 1.0, 1.2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            speechSpeed === s
                              ? 'bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg'
                              : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Link to Navigate */}
                  {response.actionDestinationNodeId && (
                    <button
                      onClick={handleNavigateDestination}
                      className="w-full py-2.5 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Show Route on Map</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Voice Prompt Suggestions */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Or Tap to Ask:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setTranscript(q);
                    handleProcessQuery(q);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-disha-lightPrimary dark:hover:text-disha-darkPrimary text-xs font-medium text-gray-700 dark:text-gray-300 transition border border-gray-200 dark:border-gray-700 text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Non-Medical Disclaimer */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>DISHA provides hospital navigation and queue information only. It does not diagnose medical conditions or advise on treatments.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
