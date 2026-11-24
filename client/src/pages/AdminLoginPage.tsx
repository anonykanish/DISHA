import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { staffLogin } from '../services/api';
import { ShieldCheck, Lock, User, KeyRound, Sparkles, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('disha2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await staffLogin({ username, password });
      localStorage.setItem('disha_staff_token', res.token);
      localStorage.setItem('disha_staff_profile', JSON.stringify(res.staff));
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-disha-lightPrimary dark:text-disha-darkPrimary flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">
            {t('admin.title')}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Authorized hospital personnel authentication
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{t('admin.username')}</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-medium text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>{t('admin.password')}</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-medium text-gray-900 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmitting ? 'Signing In...' : t('admin.loginButton')}</span>
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Pills for Hackathon Judges */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Demonstration Staff Accounts:</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'disha2026')}
              className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 text-left border border-teal-200 dark:border-teal-800"
            >
              <p className="font-bold">Hospital Admin</p>
              <p className="text-[10px] opacity-80">admin / disha2026</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('doctor_opd', 'staff123')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-left border border-gray-200 dark:border-gray-700"
            >
              <p className="font-bold">OPD Doctor</p>
              <p className="text-[10px] opacity-80">doctor_opd / staff123</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
