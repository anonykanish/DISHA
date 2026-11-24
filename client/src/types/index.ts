export interface Hospital {
  id: string;
  name: string;
  address: string;
  is_demo: number;
  emergency_contact: string;
  operating_hours: string;
}

export interface Department {
  id: string;
  hospital_id: string;
  name: string;
  code: string;
  floor: number;
  block: string;
  room_number: string;
  average_service_time: number;
  status: 'open' | 'paused' | 'closed';
  open_counters: number;
  wait_threshold_low: number;
  wait_threshold_high: number;
  announcement?: string;
  queueState?: QueueState;
}

export interface QueueState {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  floor: number;
  block: string;
  roomNumber: string;
  status: string;
  openCounters: number;
  averageServiceTime: number;
  nowServingToken: string | null;
  nowServingCounter: string | null;
  totalWaiting: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  estimatedWaitMinutes: number;
  announcement?: string;
}

export interface QueueToken {
  id: string;
  visit_id: string;
  department_id: string;
  token_number: string;
  status: 'waiting' | 'approaching' | 'called' | 'completed' | 'missed' | 'cancelled';
  priority: 'standard' | 'urgent' | 'elderly' | 'wheelchair';
  created_at: string;
  called_at?: string | null;
  completed_at?: string | null;
  counter_number?: string | null;
  department_name?: string;
  department_code?: string;
  floor?: number;
  block?: string;
  room_number?: string;
}

export interface JourneyStep {
  id: string;
  visit_id: string;
  department_id: string;
  step_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  created_at: string;
  completed_at?: string | null;
  department_name?: string;
  department_code?: string;
  floor?: number;
  block?: string;
  room_number?: string;
  average_service_time?: number;
}

export interface Visit {
  id: string;
  access_token: string;
  hospital_id: string;
  purpose: string;
  language: string;
  patient_name?: string;
  patient_phone?: string;
  patient_age?: number;
  patient_gender?: string;
  visit_status: 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface MapNode {
  id: string;
  hospital_id: string;
  floor: number;
  name: string;
  node_type: 'entrance' | 'counter' | 'department' | 'elevator' | 'stairs' | 'toilet' | 'water' | 'helpdesk' | 'waiting' | 'canteen' | 'junction';
  x: number;
  y: number;
  is_accessible: number;
  description: string;
  qrPayload?: string;
  qrDataUrl?: string;
}

export interface MapEdge {
  id: string;
  hospital_id: string;
  source_node: string;
  destination_node: string;
  distance: number;
  wheelchair_accessible: number;
  direction_hint: string;
}

export interface NavigationStep {
  stepNumber: number;
  fromNode: MapNode;
  toNode: MapNode;
  instruction: string;
  distanceMeters: number;
  floorChange: boolean;
  fromFloor: number;
  toFloor: number;
  isWheelchairAccessible: boolean;
}

export interface RouteResult {
  path: MapNode[];
  steps: NavigationStep[];
  totalDistanceMeters: number;
  estimatedWalkTimeMinutes: number;
  wheelchairAccessible: boolean;
  floorsCovered: number[];
}

export interface Announcement {
  id: string;
  hospital_id: string;
  department_id?: string | null;
  title: string;
  message: string;
  priority: 'normal' | 'urgent';
  created_at: string;
  department_name?: string;
}

export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  simpleMode: boolean;
  voiceGuidance: boolean;
  speechSpeed: number; // 0.8, 1.0, 1.2
}

export interface PatientAheadInfo {
  token: QueueToken;
  department: QueueState;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  nowServing: string | null;
  nowServingCounter: string | null;
}
