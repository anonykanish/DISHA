import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { usePatientVisit } from '../context/PatientVisitContext';
import { createVisit } from '../services/api';
import {
  Languages,
  Building2,
  Stethoscope,
  User,
  QrCode,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const { setVisitData } = usePatientVisit();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedHospitalId, setSelectedHospitalId] = useState('hosp-demo-01');
  const [purpose, setPurpose] = useState('General OPD');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPass, setCreatedPass] = useState<any>(null);

  const purposeOptions = [
    { id: 'General OPD', label: t('onboarding.purposeOPD'), desc: 'Fever, cough, cold, general physician' },
    { id: 'Scheduled appointment', label: t('onboarding.purposeAppointment'), desc: 'Cardiology, Orthopaedics, ENT' },
    { id: 'Laboratory test', label: t('onboarding.purposeLab'), desc: 'Blood test, urine test, pathology' },
    { id: 'Pharmacy', label: t('onboarding.purposePharmacy'), desc: 'Jan Aushadhi free medicines collection' },
    { id: 'Follow-up visit', label: t('onboarding.purposeFollowup'), desc: 'Doctor review and discharge report' },
    { id: 'Hospital assistance', label: t('onboarding.purposeHelp'), desc: 'Wheelchair, general inquiry, lost card' }
  ];

  const handleFinishOnboarding = async () => {
    try {
      setIsSubmitting(true);
      const data = await createVisit({
        hospitalId: selectedHospitalId,
        purpose,
        language: currentLanguage,
        patientName: patientName.trim() || undefined,
        patientPhone: patientPhone.trim() || undefined,
        patientAge: patientAge ? parseInt(patientAge, 10) : undefined,
        patientGender
      });

      setCreatedPass(data);
      setVisitData({
        visit: data.visit,
        initialToken: data.initialToken,
        qrCode: data.qrCode
      });
      setStep(5);
    } catch (err) {
      alert('Failed to create visit pass. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
          <span>{t('onboarding.title')}</span>
          <span>{t('onboarding.step')} {step} {t('onboarding.of')} 5</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-disha-lightPrimary dark:bg-disha-darkPrimary transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: CHOOSE LANGUAGE */}
      {step === 1 && (
        <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Languages className="w-5 h-5 text-disha-lightPrimary dark:text-disha-darkPrimary" />
              <span>{t('onboarding.chooseLanguage')}</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The entire interface, map directions, and speech assistant will use this language.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {availableLanguages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-disha-lightSecondary/60 dark:bg-disha-darkSecondary/40 border-disha-lightPrimary dark:border-disha-darkPrimary shadow-sm ring-2 ring-teal-500/20'
                      : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{lang.native}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{lang.label}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: SELECT HOSPITAL */}
      {step === 2 && (
        <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-disha-lightPrimary dark:text-disha-darkPrimary" />
              <span>{t('onboarding.selectHospital')}</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Demonstration hospital is preselected for Microsoft Hackathon.
            </p>
          </div>

          <div className="p-4 rounded-xl border-2 border-disha-lightPrimary dark:border-disha-darkPrimary bg-teal-50/50 dark:bg-teal-950/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                Disha Demo Government Hospital
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300">
                Active Demo
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Near Civil Lines, Health District, New Delhi - 110001
            </p>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              3 Floors • Ground, 1st, 2nd • 14 Departments • Elevator & Wheelchair Access
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PURPOSE OF VISIT */}
      {step === 3 && (
        <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-disha-lightPrimary dark:text-disha-darkPrimary" />
              <span>{t('onboarding.purposeTitle')}</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('onboarding.purposeDesc')}
            </p>
          </div>

          <div className="space-y-2">
            {purposeOptions.map((opt) => {
              const isSelected = purpose === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPurpose(opt.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-disha-lightSecondary/60 dark:bg-disha-darkSecondary/40 border-disha-lightPrimary dark:border-disha-darkPrimary shadow-sm ring-2 ring-teal-500/20'
                      : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{opt.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-disha-lightPrimary dark:text-disha-darkPrimary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(2)}
              className="py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: OPTIONAL PATIENT DETAILS */}
      {step === 4 && (
        <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-disha-lightPrimary dark:text-disha-darkPrimary" />
              <span>{t('onboarding.optionalInfoTitle')}</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('onboarding.optionalInfoDesc')}
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t('onboarding.nameLabel')}
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar (or leave blank for Guest)"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t('onboarding.ageLabel')}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 58"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t('onboarding.genderLabel')}
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-sm font-medium"
                >
                  <option value="Male">{t('onboarding.genderMale')}</option>
                  <option value="Female">{t('onboarding.genderFemale')}</option>
                  <option value="Other">{t('onboarding.genderOther')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t('onboarding.phoneLabel')}
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210 (Optional)"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-sm font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Never requires Aadhaar or sensitive clinical data.</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              onClick={handleFinishOnboarding}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Generating Pass...' : t('onboarding.generateToken')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setPatientName('Guest Patient');
                handleFinishOnboarding();
              }}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl transition"
            >
              {t('onboarding.skipButton')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: VISIT PASS & TOKEN GENERATED */}
      {step === 5 && createdPass && (
        <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border-2 border-teal-500 shadow-xl space-y-6 text-center animate-in zoom-in-95">
          <div className="space-y-1">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              {t('onboarding.successTitle')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('onboarding.visitIdLabel')}: <strong className="text-disha-lightPrimary dark:text-disha-darkPrimary text-sm">{createdPass.accessToken}</strong>
            </p>
          </div>

          {/* Generated QR Pass */}
          <div className="p-4 bg-white rounded-2xl inline-block shadow-md border border-gray-200">
            <img src={createdPass.qrCode} alt="Visit Pass QR" className="w-44 h-44 mx-auto" />
          </div>

          {/* Initial Token Banner */}
          {createdPass.initialToken && (
            <div className="bg-teal-50 dark:bg-teal-950/40 p-4 rounded-xl border border-teal-200 dark:border-teal-800 space-y-1">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t('onboarding.tokenAssigned')}</span>
              <p className="text-3xl font-black text-disha-lightPrimary dark:text-disha-darkPrimary">
                {createdPass.initialToken.token_number}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                General OPD Consultation (Floor 0, Room G-12)
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 px-6 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-black text-sm rounded-xl shadow-lg hover:scale-102 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <span>{t('onboarding.proceedToDashboard')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
