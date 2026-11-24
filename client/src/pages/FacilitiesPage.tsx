import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientVisit } from '../context/PatientVisitContext';
import { createCaregiverShare, revokeCaregiverShare } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Droplets,
  Accessibility,
  HelpCircle,
  Coffee,
  ShieldAlert,
  Search,
  Share2,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Trash2
} from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const { visit } = usePatientVisit();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Caregiver state
  const [caregiverLink, setCaregiverLink] = useState<string | null>(null);
  const [linkId, setLinkId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const facilities = [
    { id: 'f-1', name: 'Ground Floor Drinking Water Cooler', category: 'water', floor: 0, location: 'Near Central Waiting Area Pillars', nodeId: 'N-G-WATER-1', desc: 'Purified cold & normal water' },
    { id: 'f-2', name: '1st Floor Drinking Water Station', category: 'water', floor: 1, location: 'Opposite Lab Report Waiting Lounge', nodeId: 'N-1-WATER', desc: 'RO filtered water' },
    { id: 'f-3', name: '2nd Floor Drinking Water Cooler', category: 'water', floor: 2, location: 'East Corridor next to Follow-up desk', nodeId: 'N-2-WATER', desc: 'Cold drinking water' },
    { id: 'f-4', name: 'Accessible Restrooms (Divyangjan & Senior)', category: 'toilet', floor: 0, location: 'West corridor past Registration Counter', nodeId: 'N-G-TOILET-1', desc: 'Wheelchair friendly grab bars & ramp' },
    { id: 'f-5', name: '1st Floor Restrooms', category: 'toilet', floor: 1, location: 'Near Lab sample collection rooms', nodeId: 'N-1-TOILET', desc: 'Clean toilets with sample shelves' },
    { id: 'f-6', name: '2nd Floor Restrooms', category: 'toilet', floor: 2, location: 'West corridor beside Orthopaedics', nodeId: 'N-2-TOILET', desc: 'Accessible toilets' },
    { id: 'f-7', name: 'Elevator Lift A (Wheelchair Stretcher Lift)', category: 'lift', floor: 0, location: 'Central Hall', nodeId: 'N-G-LIFT-A', desc: 'Connects Ground, 1st & 2nd floors with broad doorway' },
    { id: 'f-8', name: 'Central Help Desk & Inquiry', category: 'helpdesk', floor: 0, location: 'Central Atrium (Room G-00)', nodeId: 'N-G-HELPDESK', desc: 'Wheelchair marshals & token assistance' },
    { id: 'f-9', name: 'Hospital Canteen & Snack Bar', category: 'canteen', floor: 0, location: 'East Wing outdoor garden door', nodeId: 'N-G-CANTEEN', desc: 'Clean drinking tea, warm meals & snacks' },
    { id: 'f-10', name: 'Emergency Casualty & Trauma Unit', category: 'emergency', floor: 0, location: 'Block C (Room G-EM)', nodeId: 'N-G-EMERGENCY', desc: 'Open 24 hours every day' }
  ];

  const filteredFacilities = facilities.filter((f) => {
    const matchesCat = activeCategory === 'all' || f.category === activeCategory;
    const matchesQuery = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleCreateCaregiverLink = async () => {
    try {
      setIsGeneratingLink(true);
      const visitId = visit?.id || 'visit-demo-judge';
      const res = await createCaregiverShare(visitId);
      const fullUrl = `${window.location.origin}/caregiver/${res.shareToken}`;
      setCaregiverLink(fullUrl);
      setLinkId(res.linkId);
    } catch (err) {
      alert('Could not generate link');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!caregiverLink) return;
    navigator.clipboard.writeText(caregiverLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeLink = async () => {
    if (linkId) {
      await revokeCaregiverShare(linkId);
      setCaregiverLink(null);
      setLinkId(null);
      alert('Caregiver access revoked.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-disha-lightPrimary dark:text-disha-darkPrimary" />
            <span>{t('facilities.title')}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Locate drinking water, accessible restrooms, elevators, help desks, and share visit status with family
          </p>
        </div>
      </div>

      {/* CAREGIVER CONNECT SECTION */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 p-6 rounded-card border border-teal-200 dark:border-teal-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-disha-lightPrimary dark:text-disha-darkPrimary font-extrabold text-base">
              <Share2 className="w-5 h-5" />
              <span>{t('caregiver.title')}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xl">
              {t('caregiver.subtitle')}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-400 italic">
              🔒 {t('caregiver.privacyNote')}
            </p>
          </div>

          {!caregiverLink ? (
            <button
              onClick={handleCreateCaregiverLink}
              disabled={isGeneratingLink}
              className="py-2.5 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 shrink-0"
            >
              <Share2 className="w-4 h-4" />
              <span>{isGeneratingLink ? 'Generating...' : t('caregiver.createLink')}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRevokeLink}
                className="py-2.5 px-3 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title="Revoke link"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('caregiver.revokeLink')}</span>
              </button>
            </div>
          )}
        </div>

        {caregiverLink && (
          <div className="p-3 bg-white dark:bg-disha-darkCard rounded-xl border border-teal-300 dark:border-teal-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <div className="truncate max-w-lg text-xs font-mono text-gray-700 dark:text-gray-300">
              {caregiverLink}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-initial py-1.5 px-3 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link' : 'Copy'}</span>
              </button>
              <a
                href={caregiverLink}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-100 flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open View</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* FACILITY FINDER SEARCH & CATEGORY PILLS */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('facilities.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {[
            { id: 'all', label: 'All Amenities' },
            { id: 'water', label: 'Drinking Water' },
            { id: 'toilet', label: 'Accessible Toilets' },
            { id: 'lift', label: 'Elevators / Lifts' },
            { id: 'helpdesk', label: 'Help Desk' },
            { id: 'canteen', label: 'Canteen' },
            { id: 'emergency', label: 'Emergency Ward' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg border transition ${
                activeCategory === cat.id
                  ? 'bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg border-teal-600'
                  : 'bg-white dark:bg-disha-darkCard text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-white dark:bg-disha-darkCard p-4 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-teal-400 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    Floor {fac.floor === 0 ? 'Ground' : fac.floor}
                  </span>
                  <span className="text-xs text-gray-400">~35m away</span>
                </div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                  {fac.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {fac.location}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                  {fac.desc}
                </p>
              </div>

              <button
                onClick={() => navigate(`/navigation?dest=${fac.nodeId}`)}
                className="w-full py-2 px-3 rounded-xl bg-disha-lightSecondary/60 dark:bg-disha-darkSecondary/40 hover:bg-disha-lightSecondary text-disha-lightPrimary dark:text-disha-darkPrimary font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Show Route on Map</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
