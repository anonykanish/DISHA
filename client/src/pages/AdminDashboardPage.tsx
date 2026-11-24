import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  fetchAdminOverview,
  fetchAdminAnalytics,
  adminCallNext,
  adminCompleteToken,
  adminMarkMissed,
  adminToggleQueue,
  adminUpdateServiceTime,
  adminFetchRecoveryRequests,
  adminResolveRecovery,
  adminBroadcastAnnouncement,
  fetchCheckpoints
} from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FastForward,
  Check,
  X,
  Pause,
  Play,
  Download,
  QrCode,
  Bell,
  MessageSquare,
  LogOut,
  Building,
  Printer,
  Sparkles
} from 'lucide-react';
import { CrowdHeatmapBadge } from '../components/queue/CrowdHeatmapBadge';

type AdminTab = 'overview' | 'queue' | 'departments' | 'qr' | 'announcements' | 'analytics';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [token, setToken] = useState<string | null>(null);
  const [staffProfile, setStaffProfile] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('dept-opd');
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPriority, setAnnPriority] = useState('normal');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('disha_staff_token');
    const profile = localStorage.getItem('disha_staff_profile');
    if (!savedToken) {
      navigate('/admin/login');
      return;
    }
    setToken(savedToken);
    if (profile) setStaffProfile(JSON.parse(profile));
    loadAll(savedToken);
  }, []);

  const loadAll = async (authToken: string) => {
    try {
      setIsLoading(true);
      const [ov, an, cps, recs] = await Promise.all([
        fetchAdminOverview(authToken),
        fetchAdminAnalytics(authToken),
        fetchCheckpoints('hosp-demo-01'),
        adminFetchRecoveryRequests(authToken)
      ]);
      setOverview(ov);
      setAnalytics(an);
      setCheckpoints(cps || []);
      setRecoveryRequests(recs || []);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showFlash = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCallNext = async (deptId: string) => {
    if (!token) return;
    try {
      const res = await adminCallNext(token, deptId, 'Counter 1');
      if (res.success) {
        showFlash(`Called token ${res.token?.token_number} to Counter 1!`);
        await loadAll(token);
      } else {
        showFlash(res.message || 'No patients waiting');
      }
    } catch (e) {
      showFlash('Failed to call next patient');
    }
  };

  const handleCompleteCurrent = async (tokenId: string) => {
    if (!token) return;
    try {
      await adminCompleteToken(token, tokenId);
      showFlash('Marked current token as completed!');
      await loadAll(token);
    } catch (e) {
      showFlash('Failed to complete token');
    }
  };

  const handleMarkMissed = async (tokenId: string) => {
    if (!token) return;
    try {
      await adminMarkMissed(token, tokenId);
      showFlash('Marked patient as missed/absent.');
      await loadAll(token);
    } catch (e) {
      showFlash('Failed to mark missed');
    }
  };

  const handleToggleQueue = async (deptId: string, pause: boolean) => {
    if (!token) return;
    try {
      await adminToggleQueue(token, deptId, pause);
      showFlash(`Queue ${pause ? 'paused' : 'resumed'} successfully.`);
      await loadAll(token);
    } catch (e) {
      showFlash('Failed to change queue status');
    }
  };

  const handleResolveRecovery = async (requestId: string, approve: boolean) => {
    if (!token) return;
    try {
      await adminResolveRecovery(token, requestId, approve);
      showFlash(`Recovery request ${approve ? 'approved' : 'rejected'}.`);
      await loadAll(token);
    } catch (e) {
      showFlash('Failed to resolve recovery');
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !annTitle || !annMessage) return;
    try {
      await adminBroadcastAnnouncement(token, {
        hospitalId: 'hosp-demo-01',
        title: annTitle,
        message: annMessage,
        priority: annPriority
      });
      setAnnTitle('');
      setAnnMessage('');
      showFlash('Announcement broadcasted to patient screens!');
    } catch (e) {
      showFlash('Failed to post announcement');
    }
  };

  const handleExportCSV = () => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';
    window.open(`${API_BASE}/admin/export-csv`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('disha_staff_token');
    localStorage.removeItem('disha_staff_profile');
    navigate('/admin/login');
  };

  const COLORS = ['#16A34A', '#087F70', '#DC2626', '#D97706'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-disha-darkBg pb-16">
      {/* Top Staff Navigation Header */}
      <div className="bg-white dark:bg-disha-darkCard border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 dark:text-gray-100">
              DISHA Hospital Staff Command Portal
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Logged in: <strong>{staffProfile?.name || 'Dr. Anita Roy'}</strong> ({staffProfile?.role?.toUpperCase() || 'ADMIN'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Operational CSV</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-3 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-300 rounded-xl text-xs font-bold text-center shadow-sm">
            {actionMessage}
          </div>
        </div>
      )}

      {/* Main Admin Content & Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          {[
            { id: 'overview', label: 'Operational Overview' },
            { id: 'queue', label: 'Queue Operations' },
            { id: 'departments', label: 'Departments & Counters' },
            { id: 'analytics', label: 'Analytics & Recharts' },
            { id: 'qr', label: 'Printable QR Checkpoints' },
            { id: 'announcements', label: 'Broadcasts' }
          ].map((tItem) => (
            <button
              key={tItem.id}
              onClick={() => setActiveTab(tItem.id as AdminTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tItem.id
                  ? 'bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg shadow'
                  : 'bg-white dark:bg-disha-darkCard text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {tItem.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-6 animate-in fade-in">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-disha-darkCard p-4 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Patients Currently Waiting</p>
                <p className="text-3xl font-black text-disha-lightPrimary dark:text-disha-darkPrimary">{overview.totalWaiting}</p>
                <p className="text-[10px] text-gray-400">Across all OPDs & Labs</p>
              </div>

              <div className="bg-white dark:bg-disha-darkCard p-4 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Hospital Visits</p>
                <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{overview.activeVisits}</p>
                <p className="text-[10px] text-gray-400">Registered today</p>
              </div>

              <div className="bg-white dark:bg-disha-darkCard p-4 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Average Waiting Time</p>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400">~{overview.averageWaitingMinutes}m</p>
                <p className="text-[10px] text-gray-400">Target benchmark: &lt;15m</p>
              </div>

              <div className="bg-white dark:bg-disha-darkCard p-4 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completed Visits</p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{overview.completedTokens}</p>
                <p className="text-[10px] text-gray-400">Consulted & served</p>
              </div>
            </div>

            {/* Department Live Heatmap Table */}
            <div className="bg-white dark:bg-disha-darkCard rounded-card border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden space-y-3 p-5">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                Department Live Queue & Crowd Overview
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Now Serving</th>
                      <th className="py-2.5 px-3">Waiting</th>
                      <th className="py-2.5 px-3">Est. Wait</th>
                      <th className="py-2.5 px-3">Crowd Status</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {overview.departments.map((d: any) => (
                      <tr key={d.departmentId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-gray-100">{d.departmentName}</td>
                        <td className="py-3 px-3 text-gray-500">Floor {d.floor === 0 ? 'G' : d.floor}, {d.block}</td>
                        <td className="py-3 px-3 font-extrabold text-disha-lightPrimary dark:text-disha-darkPrimary">{d.nowServingToken || '---'}</td>
                        <td className="py-3 px-3 font-semibold">{d.totalWaiting} patients</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-300 font-medium">~{d.estimatedWaitMinutes} mins</td>
                        <td className="py-3 px-3"><CrowdHeatmapBadge level={d.crowdLevel} /></td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleCallNext(d.departmentId)}
                            className="py-1 px-2.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-disha-lightPrimary dark:text-disha-darkPrimary rounded-lg text-xs font-bold border border-teal-200 dark:border-teal-800 transition"
                          >
                            Call Next
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUEUE OPERATIONS */}
        {activeTab === 'queue' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Quick Department Switcher */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Select Department Counter:</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-bold"
              >
                <option value="dept-opd">General OPD (Room G-12)</option>
                <option value="dept-reg">Registration Counter (Room G-01)</option>
                <option value="dept-lab">Pathology Lab (Room 1-05)</option>
                <option value="dept-pha">Jan Aushadhi Pharmacy (Room G-08)</option>
                <option value="dept-flw">Follow-up Counter (Room 2-00)</option>
              </select>
            </div>

            {/* Caller Control Box */}
            <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border-2 border-teal-500 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Active Consultation Room</span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  Counter 1 Control Console
                </h3>
                <p className="text-xs text-gray-500">
                  Manage patient calls, mark consultation completed, or handle missed tokens.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleCallNext(selectedDeptId)}
                  className="py-3 px-5 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-black text-sm rounded-xl shadow hover:opacity-95 transition flex items-center gap-2"
                >
                  <FastForward className="w-4 h-4" />
                  <span>Call Next Patient</span>
                </button>

                <button
                  onClick={() => handleToggleQueue(selectedDeptId, true)}
                  className="py-3 px-4 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 font-bold text-xs rounded-xl hover:bg-amber-100 transition flex items-center gap-1.5"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause Line</span>
                </button>

                <button
                  onClick={() => handleToggleQueue(selectedDeptId, false)}
                  className="py-3 px-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-100 transition flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume</span>
                </button>
              </div>
            </div>

            {/* Pending Missed-Token Recovery Requests */}
            <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Missed Token Reinstatement Requests</span>
                </h3>
                <span className="text-xs text-gray-400">{recoveryRequests.length} Pending</span>
              </div>

              {recoveryRequests.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No pending recovery requests.</p>
              ) : (
                <div className="space-y-2">
                  {recoveryRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-gray-900 dark:text-gray-100">Token {req.token_number}</span>
                        <span className="text-gray-400 mx-1.5">•</span>
                        <span className="text-gray-600 dark:text-gray-300">{req.department_name}</span>
                        <p className="text-gray-500 mt-0.5">Reason: "{req.reason}"</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResolveRecovery(req.id, true)}
                          className="py-1 px-3 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition"
                        >
                          Approve & Requeue
                        </button>
                        <button
                          onClick={() => handleResolveRecovery(req.id, false)}
                          className="py-1 px-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-bold text-xs hover:bg-gray-300 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENTS & COUNTERS */}
        {activeTab === 'departments' && overview && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
              Department Configuration & Average Service Duration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overview.departments.map((dept: any) => (
                <div
                  key={dept.departmentId}
                  className="bg-white dark:bg-disha-darkCard p-4 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{dept.departmentName}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-bold">
                      {dept.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Location: Floor {dept.floor === 0 ? 'G' : dept.floor}, {dept.block} (Room {dept.roomNumber})</p>
                    <p>Open Counters: <strong>{dept.openCounters}</strong></p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <label className="text-[11px] font-bold text-gray-500">Service Time (mins):</label>
                    <input
                      type="number"
                      defaultValue={dept.averageServiceTime}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (val > 0 && token) {
                          adminUpdateServiceTime(token, dept.departmentId, val);
                          showFlash(`Updated ${dept.departmentName} service time to ${val} mins.`);
                        }
                      }}
                      className="w-16 p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-bold text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RECHARTS ANALYTICS */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Hourly Visitor Traffic Line Chart */}
              <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                  Hourly Patient Footfall (8:00 AM - 2:00 PM)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.hourlyTraffic}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="time" textAnchor="end" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="patients" stroke="#087F70" strokeWidth={3} name="Total Arrived" />
                      <Line type="monotone" dataKey="processed" stroke="#16A34A" strokeWidth={2} name="Served" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. Average Waiting Time Bar Chart */}
              <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                  Average Waiting Times by Department (Minutes)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.waitTimes}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgWaitTime" fill="#087F70" name="Current Wait (m)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="targetWaitTime" fill="#D97706" name="Target (15m)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. Visit Completion Pie Chart */}
              <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                  Daily Visit Completion Distribution
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.visitStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {analytics.visitStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 4. Queue Status Distribution Bar Chart */}
              <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                  Queue Tokens by Lifecycle Status
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.statusBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#5CD6BD" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PRINTABLE QR CHECKPOINTS */}
        {activeTab === 'qr' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                  Hospital Wall Checkpoint QR Codes
                </h3>
                <p className="text-xs text-gray-500">
                  Mount these QR codes on hospital corridor walls. Patients scan to verify indoor location.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print All Wall QRs</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {checkpoints.map((cp) => (
                <div
                  key={cp.id}
                  className="bg-white dark:bg-disha-darkCard p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center space-y-2 shadow-sm"
                >
                  <img src={cp.qrDataUrl} alt={cp.name} className="w-32 h-32 mx-auto" />
                  <p className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">{cp.name}</p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    Floor {cp.floor === 0 ? 'G' : cp.floor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BROADCAST ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="max-w-xl mx-auto space-y-5 animate-in fade-in">
            <div className="bg-white dark:bg-disha-darkCard p-6 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-teal-600" />
                  <span>Broadcast Hospital Announcement</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Sent immediately to all patient screens and displays.
                </p>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Counter 4 open for Senior Citizens"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-semibold text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Message:</label>
                  <textarea
                    rows={3}
                    placeholder="Details of the announcement..."
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-medium text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Priority:</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-bold"
                  >
                    <option value="normal">Normal Information</option>
                    <option value="urgent">Urgent / Attention Required</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-disha-lightPrimary dark:bg-disha-darkPrimary text-white dark:text-disha-darkBg font-bold text-xs rounded-xl shadow transition"
                >
                  Send Announcement
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
