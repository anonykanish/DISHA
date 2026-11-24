import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCaregiverView } from '../services/api';
import { Building2, Users, MapPin, CheckCircle2, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export const CaregiverViewPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!shareToken) throw new Error('Missing token');
        const res = await fetchCaregiverView(shareToken);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Link is invalid, expired, or has been revoked.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500">Loading patient visit status securely...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs">
          {error}
        </div>
        <Link to="/" className="text-xs font-bold text-teal-600 hover:underline">
          Return to DISHA Home
        </Link>
      </div>
    );
  }

  const activeToken = data.activeToken;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Caregiver Connect • Safe Family View</span>
        </div>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">
          Patient Hospital Visit Status
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {data.hospital?.name || 'Disha Demo Government Hospital'}
        </p>
      </div>

      {/* Main Token & Queue Box */}
      {activeToken && (
        <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border-2 border-teal-500 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Current Queue Token</span>
            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              {activeToken.status}
            </span>
          </div>

          <div className="text-center py-2">
            <span className="text-4xl font-black text-disha-lightPrimary dark:text-disha-darkPrimary">
              {activeToken.token_number}
            </span>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold mt-1">
              {activeToken.department_name}
            </p>
            <p className="text-xs text-gray-400">
              Floor {activeToken.floor ?? 0}, {activeToken.block} (Room {activeToken.room_number})
            </p>
          </div>
        </div>
      )}

      {/* Journey Stages */}
      <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Visit Stages
        </h3>

        <div className="space-y-2">
          {data.steps.map((st: any) => (
            <div
              key={st.step_order}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                st.status === 'completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                  : st.status === 'in_progress'
                  ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-300 text-teal-900 dark:text-teal-200 font-bold'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500'
              }`}
            >
              <span>Step {st.step_order}: {st.department_name}</span>
              <span className="text-[10px] font-bold uppercase">{st.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-[11px] text-gray-400">
        🔒 Diagnosis, prescriptions, and confidential medical records are never displayed on this link.
      </div>
    </div>
  );
};
