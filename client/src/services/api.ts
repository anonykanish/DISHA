import { Hospital, Department, RouteResult, Visit, QueueToken, Announcement, PatientAheadInfo } from '../types';
import { saveOfflineMap, getOfflineMap, cacheOfflineRoute, getCachedOfflineRoute } from './offlineStore';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

export async function fetchHospitals(): Promise<Hospital[]> {
  try {
    const res = await fetch(`${API_BASE}/hospitals`);
    if (!res.ok) throw new Error('Failed to fetch hospitals');
    const data = await res.json();
    localStorage.setItem('disha_cached_hospitals', JSON.stringify(data));
    return data;
  } catch (err) {
    const cached = localStorage.getItem('disha_cached_hospitals');
    if (cached) return JSON.parse(cached);
    return [
      {
        id: 'hosp-demo-01',
        name: 'Disha Demo Government Hospital',
        address: 'Civil Lines, Health District, New Delhi - 110001 (DEMO)',
        is_demo: 1,
        emergency_contact: '102 / 011-23456789',
        operating_hours: '24x7 Emergency | OPD: 8:00 AM - 2:00 PM'
      }
    ];
  }
}

export async function fetchDepartments(hospitalId: string = 'hosp-demo-01'): Promise<Department[]> {
  try {
    const res = await fetch(`${API_BASE}/departments?hospitalId=${hospitalId}`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    const data = await res.json();
    localStorage.setItem(`disha_cached_departments_${hospitalId}`, JSON.stringify(data));
    return data;
  } catch (err) {
    const cached = localStorage.getItem(`disha_cached_departments_${hospitalId}`);
    if (cached) return JSON.parse(cached);
    return [];
  }
}

export async function fetchHospitalMap(hospitalId: string = 'hosp-demo-01'): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/map/${hospitalId}`);
    if (!res.ok) throw new Error('Failed to fetch hospital map');
    const data = await res.json();
    await saveOfflineMap(hospitalId, data);
    return data;
  } catch (err) {
    const offlineMap = await getOfflineMap(hospitalId);
    if (offlineMap) return offlineMap;
    throw err;
  }
}

export async function fetchCheckpoints(hospitalId: string = 'hosp-demo-01'): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/map/checkpoints/${hospitalId}`);
    if (!res.ok) throw new Error('Failed to fetch checkpoints');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function calculateRoute(
  hospitalId: string,
  startNodeId: string,
  destinationNodeId: string,
  wheelchairAccessible: boolean = false
): Promise<RouteResult> {
  const routeKey = `${hospitalId}_${startNodeId}_${destinationNodeId}_${wheelchairAccessible ? 'wc' : 'std'}`;
  try {
    const res = await fetch(`${API_BASE}/navigation/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitalId, startNodeId, destinationNodeId, wheelchairAccessible })
    });
    if (!res.ok) throw new Error('No route found');
    const data = await res.json();
    await cacheOfflineRoute(routeKey, data);
    return data;
  } catch (err) {
    const cached = await getCachedOfflineRoute(routeKey);
    if (cached) return cached;
    throw err;
  }
}

export async function createVisit(visitData: {
  hospitalId: string;
  purpose: string;
  language: string;
  patientName?: string;
  patientPhone?: string;
  patientAge?: number;
  patientGender?: string;
}): Promise<{ visit: Visit; accessToken: string; qrCode: string; initialToken: QueueToken }> {
  const res = await fetch(`${API_BASE}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitData)
  });
  if (!res.ok) throw new Error('Failed to create patient visit');
  return res.json();
}

export async function fetchVisitDetails(accessTokenOrId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/visits/${accessTokenOrId}`);
  if (!res.ok) throw new Error('Visit not found');
  return res.json();
}

export async function fetchTokenInfo(tokenOrVisitId: string): Promise<PatientAheadInfo> {
  const res = await fetch(`${API_BASE}/queue/token/${tokenOrVisitId}`);
  if (!res.ok) throw new Error('Failed to fetch token info');
  return res.json();
}

export async function requestMissedRecovery(tokenId: string, reason: string): Promise<any> {
  const res = await fetch(`${API_BASE}/queue/missed-recovery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenId, reason })
  });
  return res.json();
}

export async function createCaregiverShare(visitId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/caregiver/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitId })
  });
  return res.json();
}

export async function fetchCaregiverView(shareToken: string): Promise<any> {
  const res = await fetch(`${API_BASE}/caregiver/view/${shareToken}`);
  if (!res.ok) throw new Error('Link invalid or revoked');
  return res.json();
}

export async function revokeCaregiverShare(linkId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/caregiver/revoke/${linkId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function submitFeedback(feedbackData: {
  visitId: string;
  ratingNav: number;
  ratingWait: number;
  ratingEase: number;
  comments?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedbackData)
  });
  return res.json();
}

export async function fetchAnnouncements(hospitalId: string = 'hosp-demo-01'): Promise<Announcement[]> {
  try {
    const res = await fetch(`${API_BASE}/announcements?hospitalId=${hospitalId}`);
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return res.json();
  } catch (err) {
    return [];
  }
}

// Staff / Admin APIs
export async function staffLogin(credentials: { username: string; password: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Login failed');
  }
  return res.json();
}

export async function fetchAdminOverview(token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function fetchAdminAnalytics(token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function adminCallNext(token: string, departmentId: string, counterNumber?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/queue/call-next`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ departmentId, counterNumber })
  });
  return res.json();
}

export async function adminCompleteToken(token: string, tokenId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/queue/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ tokenId })
  });
  return res.json();
}

export async function adminMarkMissed(token: string, tokenId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/queue/missed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ tokenId })
  });
  return res.json();
}

export async function adminUpdateServiceTime(token: string, departmentId: string, averageServiceTime: number): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/queue/service-duration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ departmentId, averageServiceTime })
  });
  return res.json();
}

export async function adminToggleQueue(token: string, departmentId: string, pause: boolean): Promise<any> {
  const endpoint = pause ? 'pause' : 'resume';
  const res = await fetch(`${API_BASE}/admin/queue/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ departmentId })
  });
  return res.json();
}

export async function adminFetchRecoveryRequests(token: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/admin/queue/recovery-requests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function adminResolveRecovery(token: string, requestId: string, approve: boolean): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/queue/resolve-recovery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ requestId, approve })
  });
  return res.json();
}

export async function adminBroadcastAnnouncement(token: string, announcement: {
  hospitalId: string;
  departmentId?: string;
  title: string;
  message: string;
  priority?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(announcement)
  });
  return res.json();
}

// Hackathon Demo APIs
export async function demoReset(): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  return res.json();
}

export async function demoAdvanceQueue(departmentId: string = 'dept-opd'): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/advance-queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ departmentId })
  });
  return res.json();
}

export async function demoSimulateAnnouncement(title?: string, message?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/simulate-announcement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, message })
  });
  return res.json();
}

export async function demoCompleteJourney(visitId?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/complete-journey`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitId })
  });
  return res.json();
}
