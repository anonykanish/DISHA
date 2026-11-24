import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientVisit } from '../context/PatientVisitContext';
import { JourneyTimeline } from '../components/journey/JourneyTimeline';
import { JourneyStep } from '../types';
import { useNavigate } from 'react-router-dom';
import { Route, Plus, CheckCircle2, MapPin, Sparkles } from 'lucide-react';

export const JourneyPage: React.FC = () => {
  const { t } = useTranslation();
  const { visit, journeySteps, refreshVisit } = usePatientVisit();
  const navigate = useNavigate();

  const [isAddingStep, setIsAddingStep] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('dept-xry');

  const handleNavigateToStep = (step: JourneyStep) => {
    let destNode = 'N-G-OPD';
    if (step.department_id === 'dept-lab') destNode = 'N-1-LAB';
    else if (step.department_id === 'dept-pha') destNode = 'N-G-PHARMACY';
    else if (step.department_id === 'dept-reg') destNode = 'N-G-REG';
    else if (step.department_id === 'dept-bld') destNode = 'N-1-BLOOD';
    else if (step.department_id === 'dept-flw') destNode = 'N-2-FOLLOWUP';
    else if (step.department_id === 'dept-xry') destNode = 'N-1-XRAY';
    else if (step.department_id === 'dept-car') destNode = 'N-2-CARDIO';

    navigate(`/navigation?dest=${destNode}`);
  };

  const availableDeptsToAdd = [
    { id: 'dept-xry', name: 'X-Ray Department (Floor 1, Room 1-16)' },
    { id: 'dept-rad', name: 'Radiology / Ultrasound (Floor 1, Room 1-14)' },
    { id: 'dept-car', name: 'Cardiology ECG (Floor 2, Room 2-15)' },
    { id: 'dept-ort', name: 'Orthopaedics Plaster Room (Floor 2, Room 2-08)' },
    { id: 'dept-flw', name: 'Follow-up Counter (Floor 2, Room 2-00)' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Route className="w-6 h-6 text-disha-lightPrimary dark:text-disha-darkPrimary" />
            <span>{t('journey.title')}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('journey.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsAddingStep(!isAddingStep)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-xs font-bold text-disha-lightPrimary dark:text-disha-darkPrimary border border-teal-200 dark:border-teal-800 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Doctor Prescribed Step</span>
        </button>
      </div>

      {/* Add Step Inline Box */}
      {isAddingStep && (
        <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3 animate-in fade-in">
          <h3 className="font-bold text-xs uppercase tracking-wider text-teal-900 dark:text-teal-200">
            Add Additional Clinical Investigation Step:
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-semibold text-gray-900 dark:text-gray-100"
            >
              {availableDeptsToAdd.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                alert('Added new prescribed journey step!');
                setIsAddingStep(false);
              }}
              className="py-2.5 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-xs rounded-xl shadow transition"
            >
              Confirm & Insert
            </button>
          </div>
        </div>
      )}

      {/* Timeline Component */}
      <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm">
        <JourneyTimeline
          steps={journeySteps}
          onNavigateToStep={handleNavigateToStep}
        />
      </div>
    </div>
  );
};
