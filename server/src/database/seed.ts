import { initSchema } from './schema.js';
import { run, exec, getOne, saveDb } from './db.js';
import { v4 as uuidv4 } from 'uuid';

export async function seedDatabase(force = false): Promise<void> {
  await initSchema();

  const existingHospital = await getOne('SELECT id FROM hospitals WHERE id = ?', ['hosp-demo-01']);
  if (existingHospital && !force) {
    console.log('Database already seeded. Skipping seed.');
    return;
  }

  console.log('Seeding Disha Demo Government Hospital database...');

  // Clear existing if force
  if (force) {
    await exec(`
      DELETE FROM missed_token_requests;
      DELETE FROM caregiver_links;
      DELETE FROM feedback;
      DELETE FROM announcements;
      DELETE FROM staff;
      DELETE FROM map_edges;
      DELETE FROM map_nodes;
      DELETE FROM journey_steps;
      DELETE FROM queue_tokens;
      DELETE FROM visits;
      DELETE FROM departments;
      DELETE FROM hospitals;
    `);
  }

  // 1. Hospital
  await run(`
    INSERT OR REPLACE INTO hospitals (id, name, address, is_demo, emergency_contact, operating_hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    'hosp-demo-01',
    'Disha Demo Government Hospital',
    'Near Civil Lines, Health District, New Delhi - 110001 (DEMONSTRATION ONLY)',
    1,
    '102 / 011-23456789',
    '24x7 Emergency | OPD: 8:00 AM - 2:00 PM'
  ]);

  // 2. Departments
  const departments = [
    // Ground Floor (0)
    { id: 'dept-reg', code: 'REG', name: 'Registration Counter', floor: 0, block: 'Block A', room: 'G-01', time: 5, counters: 4, announcement: 'Counters 1-3 open for OPD registration. Counter 4 for Senior Citizens.' },
    { id: 'dept-opd', code: 'OPD', name: 'General OPD', floor: 0, block: 'Block A', room: 'G-12', time: 8, counters: 3, announcement: 'Dr. Sharma and Dr. Verma are currently consulting in Rooms 12 & 13.' },
    { id: 'dept-emg', code: 'EMG', name: 'Emergency Department', floor: 0, block: 'Block C', room: 'G-EM', time: 5, counters: 2, announcement: 'Emergency triage active. Priority for acute and trauma cases.' },
    { id: 'dept-pha', code: 'PHA', name: 'Pharmacy', floor: 0, block: 'Block B', room: 'G-08', time: 6, counters: 3, announcement: 'Keep doctor prescription and token ready before approaching the counter.' },
    { id: 'dept-hlp', code: 'HLP', name: 'Help Desk & Inquiry', floor: 0, block: 'Central Atrium', room: 'G-00', time: 3, counters: 2, announcement: 'Wheelchair assistance and language marshals available here.' },
    
    // First Floor (1)
    { id: 'dept-lab', code: 'LAB', name: 'Pathology Laboratory', floor: 1, block: 'Block A', room: '1-05', time: 7, counters: 3, announcement: 'Sample collection on fasting required for lipid profile and glucose.' },
    { id: 'dept-bld', code: 'BLD', name: 'Blood Sample Collection', floor: 1, block: 'Block A', room: '1-06', time: 5, counters: 2, announcement: 'Reports available digitally within 2 hours or collect from Counter 6.' },
    { id: 'dept-rad', code: 'RAD', name: 'Radiology', floor: 1, block: 'Block B', room: '1-14', time: 12, counters: 2, announcement: 'Ultrasound and CT scan appointments proceed to reception desk 1-14.' },
    { id: 'dept-xry', code: 'XRY', name: 'X-Ray Department', floor: 1, block: 'Block B', room: '1-16', time: 8, counters: 2, announcement: 'Remove metallic items before entering radiation room.' },
    
    // Second Floor (2)
    { id: 'dept-spc', code: 'SPC', name: 'Specialist OPD', floor: 2, block: 'Block A', room: '2-01', time: 10, counters: 2, announcement: 'Super-specialty consultations by referral token only.' },
    { id: 'dept-ort', code: 'ORT', name: 'Orthopaedics', floor: 2, block: 'Block A', room: '2-08', time: 10, counters: 2, announcement: 'Plaster room and mobility assistance available near room 2-09.' },
    { id: 'dept-car', code: 'CAR', name: 'Cardiology', floor: 2, block: 'Block B', room: '2-15', time: 12, counters: 2, announcement: 'ECG room 2-16 is open for immediate screening.' },
    { id: 'dept-ent', code: 'ENT', name: 'ENT Clinic', floor: 2, block: 'Block B', room: '2-20', time: 8, counters: 2, announcement: 'Hearing test booth operates between 9:00 AM and 1:00 PM.' },
    { id: 'dept-flw', code: 'FLW', name: 'Follow-up Counter', floor: 2, block: 'Central Hall', room: '2-00', time: 4, counters: 2, announcement: 'Book your next review slot and print digital summary here.' }
  ];

  for (const dept of departments) {
    await run(`
      INSERT OR REPLACE INTO departments 
      (id, hospital_id, name, code, floor, block, room_number, average_service_time, status, open_counters, announcement)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
    `, [
      dept.id,
      'hosp-demo-01',
      dept.name,
      dept.code,
      dept.floor,
      dept.block,
      dept.room,
      dept.time,
      dept.counters,
      dept.announcement
    ]);
  }

  // 3. Map Nodes (SVG coordinates on 800x600 canvas)
  const nodes = [
    // GROUND FLOOR (floor 0)
    { id: 'N-G-ENTRANCE', floor: 0, name: 'Main Entrance & Checkpoint', type: 'entrance', x: 400, y: 550, is_accessible: 1, desc: 'Main gate entry with security and wheelchair ramp' },
    { id: 'N-G-LOBBY', floor: 0, name: 'Central Atrium Lobby', type: 'junction', x: 400, y: 440, is_accessible: 1, desc: 'Central junction connecting all wings' },
    { id: 'N-G-HELPDESK', floor: 0, name: 'Help Desk & Inquiry', type: 'helpdesk', x: 490, y: 440, is_accessible: 1, desc: 'Information, token assistance and wheelchairs' },
    { id: 'N-G-REG', floor: 0, name: 'Registration Counter', type: 'counter', x: 260, y: 440, is_accessible: 1, desc: 'OPD registration and visit token issue' },
    { id: 'N-G-WAITING-1', floor: 0, name: 'Ground Floor Waiting Area', type: 'waiting', x: 320, y: 350, is_accessible: 1, desc: 'Seating benches with queue announcement display' },
    { id: 'N-G-WATER-1', floor: 0, name: 'Drinking Water Station', type: 'water', x: 230, y: 350, is_accessible: 1, desc: 'Purified cold and normal drinking water' },
    { id: 'N-G-TOILET-1', floor: 0, name: 'Accessible Toilets', type: 'toilet', x: 180, y: 440, is_accessible: 1, desc: 'Divyangjan and senior citizen friendly restrooms' },
    { id: 'N-G-OPD', floor: 0, name: 'General OPD', type: 'department', x: 200, y: 220, is_accessible: 1, desc: 'General medicine and basic consultations' },
    { id: 'N-G-PHARMACY', floor: 0, name: 'Pharmacy (Jan Aushadhi)', type: 'department', x: 600, y: 440, is_accessible: 1, desc: 'Free generic medicine dispensary' },
    { id: 'N-G-EMERGENCY', floor: 0, name: 'Emergency Department', type: 'department', x: 640, y: 220, is_accessible: 1, desc: 'Emergency triage and casualty ward' },
    { id: 'N-G-CANTEEN', floor: 0, name: 'Hospital Canteen', type: 'canteen', x: 600, y: 540, is_accessible: 1, desc: 'Clean food and refreshments' },
    { id: 'N-G-LIFT-A', floor: 0, name: 'Elevator Lift A (Wheelchair)', type: 'elevator', x: 360, y: 200, is_accessible: 1, desc: 'Stretcher and wheelchair friendly lift to Floors 1 & 2' },
    { id: 'N-G-STAIRS-A', floor: 0, name: 'Staircase A', type: 'stairs', x: 440, y: 200, is_accessible: 0, desc: 'Stairwell to Floors 1 & 2 (Not wheelchair accessible)' },

    // FIRST FLOOR (floor 1)
    { id: 'N-1-LOBBY', floor: 1, name: 'First Floor Central Lobby', type: 'junction', x: 400, y: 320, is_accessible: 1, desc: 'First floor foyer' },
    { id: 'N-1-LIFT-A', floor: 1, name: 'Elevator Lift A (Floor 1)', type: 'elevator', x: 360, y: 200, is_accessible: 1, desc: 'Lift access to Ground and Second floors' },
    { id: 'N-1-STAIRS-A', floor: 1, name: 'Staircase A (Floor 1)', type: 'stairs', x: 440, y: 200, is_accessible: 0, desc: 'Stairs landing on Floor 1' },
    { id: 'N-1-LAB', floor: 1, name: 'Pathology Laboratory', type: 'department', x: 190, y: 200, is_accessible: 1, desc: 'Clinical pathology and diagnostic investigations' },
    { id: 'N-1-BLOOD', floor: 1, name: 'Blood Sample Collection', type: 'department', x: 190, y: 320, is_accessible: 1, desc: 'Phlebotomy counter for blood tests' },
    { id: 'N-1-RAD', floor: 1, name: 'Radiology & Ultrasound', type: 'department', x: 610, y: 200, is_accessible: 1, desc: 'Sonography, MRI and CT services' },
    { id: 'N-1-XRAY', floor: 1, name: 'X-Ray Department', type: 'department', x: 610, y: 320, is_accessible: 1, desc: 'Digital radiography and bone scans' },
    { id: 'N-1-WAITING', floor: 1, name: 'First Floor Waiting Lounge', type: 'waiting', x: 400, y: 440, is_accessible: 1, desc: 'Waiting area for lab and imaging results' },
    { id: 'N-1-TOILET', floor: 1, name: 'First Floor Toilets', type: 'toilet', x: 270, y: 440, is_accessible: 1, desc: 'Restrooms with sample collection support' },
    { id: 'N-1-WATER', floor: 1, name: 'Drinking Water Station', type: 'water', x: 530, y: 440, is_accessible: 1, desc: 'Clean drinking water outlet' },

    // SECOND FLOOR (floor 2)
    { id: 'N-2-LOBBY', floor: 2, name: 'Second Floor Central Foyer', type: 'junction', x: 400, y: 320, is_accessible: 1, desc: 'Second floor specialist clinic junction' },
    { id: 'N-2-LIFT-A', floor: 2, name: 'Elevator Lift A (Floor 2)', type: 'elevator', x: 360, y: 200, is_accessible: 1, desc: 'Lift access to Ground and First floors' },
    { id: 'N-2-STAIRS-A', floor: 2, name: 'Staircase A (Floor 2)', type: 'stairs', x: 440, y: 200, is_accessible: 0, desc: 'Stairs landing on Floor 2' },
    { id: 'N-2-SPEC-OPD', floor: 2, name: 'Specialist OPD Clinic', type: 'department', x: 190, y: 200, is_accessible: 1, desc: 'Senior physician specialist consultations' },
    { id: 'N-2-ORTHO', floor: 2, name: 'Orthopaedics Department', type: 'department', x: 190, y: 320, is_accessible: 1, desc: 'Joint, spine and bone care' },
    { id: 'N-2-CARDIO', floor: 2, name: 'Cardiology Department', type: 'department', x: 610, y: 200, is_accessible: 1, desc: 'Heart clinic and ECG screening' },
    { id: 'N-2-ENT', floor: 2, name: 'ENT Clinic', type: 'department', x: 610, y: 320, is_accessible: 1, desc: 'Ear, Nose and Throat specialist rooms' },
    { id: 'N-2-FOLLOWUP', floor: 2, name: 'Follow-up Counter', type: 'counter', x: 400, y: 440, is_accessible: 1, desc: 'Follow-up appointments and discharge summary desk' },
    { id: 'N-2-TOILET', floor: 2, name: 'Second Floor Toilets', type: 'toilet', x: 270, y: 440, is_accessible: 1, desc: 'Accessible restrooms' },
    { id: 'N-2-WATER', floor: 2, name: 'Drinking Water Station', type: 'water', x: 530, y: 440, is_accessible: 1, desc: 'Purified water station' }
  ];

  for (const node of nodes) {
    await run(`
      INSERT OR REPLACE INTO map_nodes (id, hospital_id, floor, name, node_type, x, y, is_accessible, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      node.id,
      'hosp-demo-01',
      node.floor,
      node.name,
      node.type,
      node.x,
      node.y,
      node.is_accessible,
      node.desc
    ]);
  }

  // 4. Map Edges (corridor graph connections)
  // Distance is Euclidean distance approximately
  const edges = [
    // Ground Floor Connections
    { s: 'N-G-ENTRANCE', d: 'N-G-LOBBY', dist: 110, acc: 1, hint: 'Walk straight through the main glass doorway into the Central Atrium' },
    { s: 'N-G-LOBBY', d: 'N-G-REG', dist: 140, acc: 1, hint: 'Turn left along the wide corridor towards Registration Counter' },
    { s: 'N-G-LOBBY', d: 'N-G-HELPDESK', dist: 90, acc: 1, hint: 'Proceed right towards the Central Help Desk' },
    { s: 'N-G-REG', d: 'N-G-TOILET-1', dist: 80, acc: 1, hint: 'Accessible toilets are located just past the registration counters' },
    { s: 'N-G-REG', d: 'N-G-WAITING-1', dist: 110, acc: 1, hint: 'Walk diagonally into the central waiting area' },
    { s: 'N-G-LOBBY', d: 'N-G-WAITING-1', dist: 120, acc: 1, hint: 'Proceed forward into the ground floor waiting lounge' },
    { s: 'N-G-WAITING-1', d: 'N-G-WATER-1', dist: 90, acc: 1, hint: 'Drinking water dispenser is by the waiting room pillars' },
    { s: 'N-G-WAITING-1', d: 'N-G-OPD', dist: 180, acc: 1, hint: 'Continue straight down the west corridor to General OPD' },
    { s: 'N-G-WAITING-1', d: 'N-G-LIFT-A', dist: 150, acc: 1, hint: 'Head towards the central elevator lobby' },
    { s: 'N-G-WAITING-1', d: 'N-G-STAIRS-A', dist: 170, acc: 0, hint: 'Take Staircase A next to the elevator shaft (Not wheelchair accessible)' },
    { s: 'N-G-HELPDESK', d: 'N-G-PHARMACY', dist: 110, acc: 1, hint: 'Walk right down East Wing Corridor to the Pharmacy' },
    { s: 'N-G-PHARMACY', d: 'N-G-CANTEEN', dist: 100, acc: 1, hint: 'Canteen is directly opposite the outdoor garden door' },
    { s: 'N-G-LOBBY', d: 'N-G-EMERGENCY', dist: 320, acc: 1, hint: 'Follow red floor guidelines to Emergency Department' },
    { s: 'N-G-STAIRS-A', d: 'N-G-LIFT-A', dist: 80, acc: 1, hint: 'Pass between the stairs landing and elevator lobby' },

    // Inter-Floor Vertical Connectors
    // Elevator connects all 3 floors (Wheelchair accessible)
    { s: 'N-G-LIFT-A', d: 'N-1-LIFT-A', dist: 50, acc: 1, hint: 'Take Elevator Lift A up to the 1st Floor' },
    { s: 'N-1-LIFT-A', d: 'N-2-LIFT-A', dist: 50, acc: 1, hint: 'Take Elevator Lift A up to the 2nd Floor' },
    
    // Stairs connect all 3 floors (NOT wheelchair accessible)
    { s: 'N-G-STAIRS-A', d: 'N-1-STAIRS-A', dist: 60, acc: 0, hint: 'Climb Staircase A flight up to the 1st Floor (Stairs only)' },
    { s: 'N-1-STAIRS-A', d: 'N-2-STAIRS-A', dist: 60, acc: 0, hint: 'Climb Staircase A flight up to the 2nd Floor (Stairs only)' },

    // First Floor Connections
    { s: 'N-1-LIFT-A', d: 'N-1-LOBBY', dist: 130, acc: 1, hint: 'Exit elevator and enter the First Floor Lobby' },
    { s: 'N-1-STAIRS-A', d: 'N-1-LOBBY', dist: 130, acc: 0, hint: 'Exit staircase and enter the First Floor Lobby' },
    { s: 'N-1-LIFT-A', d: 'N-1-STAIRS-A', dist: 80, acc: 1, hint: 'Elevator and staircase corridor connector' },
    { s: 'N-1-LOBBY', d: 'N-1-BLOOD', dist: 210, acc: 1, hint: 'Walk left along West Wing Corridor to Blood Sample Collection' },
    { s: 'N-1-BLOOD', d: 'N-1-LAB', dist: 120, acc: 1, hint: 'Proceed straight to the main Pathology Laboratory' },
    { s: 'N-1-LOBBY', d: 'N-1-WAITING', dist: 120, acc: 1, hint: 'Walk down into the First Floor Waiting Lounge' },
    { s: 'N-1-WAITING', d: 'N-1-TOILET', dist: 130, acc: 1, hint: 'Turn towards the restrooms on the left wing' },
    { s: 'N-1-WAITING', d: 'N-1-WATER', dist: 130, acc: 1, hint: 'Drinking water dispenser located beside the central notice board' },
    { s: 'N-1-LOBBY', d: 'N-1-XRAY', dist: 210, acc: 1, hint: 'Walk right along East Wing Corridor to X-Ray Department' },
    { s: 'N-1-XRAY', d: 'N-1-RAD', dist: 120, acc: 1, hint: 'Continue down corridor to Radiology & Ultrasound Desk' },

    // Second Floor Connections
    { s: 'N-2-LIFT-A', d: 'N-2-LOBBY', dist: 130, acc: 1, hint: 'Exit elevator into the Second Floor Specialist Foyer' },
    { s: 'N-2-STAIRS-A', d: 'N-2-LOBBY', dist: 130, acc: 0, hint: 'Exit staircase into the Second Floor Specialist Foyer' },
    { s: 'N-2-LIFT-A', d: 'N-2-STAIRS-A', dist: 80, acc: 1, hint: 'Corridor connecting elevator and stairs' },
    { s: 'N-2-LOBBY', d: 'N-2-ORTHO', dist: 210, acc: 1, hint: 'Turn left to Orthopaedics Consultation Wing' },
    { s: 'N-2-ORTHO', d: 'N-2-SPEC-OPD', dist: 120, acc: 1, hint: 'Walk north to Specialist OPD Consultation Rooms' },
    { s: 'N-2-LOBBY', d: 'N-2-ENT', dist: 210, acc: 1, hint: 'Turn right towards ENT Clinic' },
    { s: 'N-2-ENT', d: 'N-2-CARDIO', dist: 120, acc: 1, hint: 'Proceed straight to Cardiology Screening & ECG' },
    { s: 'N-2-LOBBY', d: 'N-2-FOLLOWUP', dist: 120, acc: 1, hint: 'Head straight to the Central Follow-up Counter' },
    { s: 'N-2-FOLLOWUP', d: 'N-2-TOILET', dist: 130, acc: 1, hint: 'Restrooms located on the west corridor' },
    { s: 'N-2-FOLLOWUP', d: 'N-2-WATER', dist: 130, acc: 1, hint: 'Drinking water station on the east corridor' }
  ];

  // Insert bidirectional edges
  for (const edge of edges) {
    const edgeId1 = `E-${edge.s}-${edge.d}`;
    const edgeId2 = `E-${edge.d}-${edge.s}`;

    await run(`
      INSERT OR REPLACE INTO map_edges (id, hospital_id, source_node, destination_node, distance, wheelchair_accessible, direction_hint)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [edgeId1, 'hosp-demo-01', edge.s, edge.d, edge.dist, edge.acc, edge.hint]);

    await run(`
      INSERT OR REPLACE INTO map_edges (id, hospital_id, source_node, destination_node, distance, wheelchair_accessible, direction_hint)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [edgeId2, 'hosp-demo-01', edge.d, edge.s, edge.dist, edge.acc, `Return path: ${edge.hint}`]);
  }

  // 5. Staff Accounts
  // Default password for demo is 'disha2026' or 'staff123'
  // Using fixed simple hash or demo salt
  const staffList = [
    { id: 'staff-admin', user: 'admin', pass: 'disha2026', name: 'Dr. Anita Roy', role: 'admin', dept: null },
    { id: 'staff-opd', user: 'doctor_opd', pass: 'staff123', name: 'Dr. Rajesh Sharma', role: 'doctor', dept: 'dept-opd' },
    { id: 'staff-lab', user: 'lab_tech', pass: 'staff123', name: 'Pooja Verma', role: 'lab_tech', dept: 'dept-lab' },
    { id: 'staff-pha', user: 'pharmacist', pass: 'staff123', name: 'Suresh Kumar', role: 'pharmacist', dept: 'dept-pha' },
    { id: 'staff-reg', user: 'reception', pass: 'staff123', name: 'Manish Singh', role: 'reception', dept: 'dept-reg' }
  ];

  for (const s of staffList) {
    await run(`
      INSERT OR REPLACE INTO staff (id, username, password_hash, name, role, department_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [s.id, s.user, s.pass, s.name, s.role, s.dept]);
  }

  // 6. Preloaded Hackathon Demo Visit (OPD-024)
  const demoVisitId = 'visit-demo-judge';
  const demoAccessToken = 'DISHA-DEMO-2026';
  const now = new Date().toISOString();

  await run(`
    INSERT OR REPLACE INTO visits 
    (id, access_token, hospital_id, purpose, language, patient_name, patient_phone, patient_age, patient_gender, visit_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    demoVisitId,
    demoAccessToken,
    'hosp-demo-01',
    'General OPD Consultation & Tests',
    'en',
    'Ramesh Kumar (Demo Patient)',
    '9876543210',
    58,
    'Male',
    'in_progress',
    now,
    now
  ]);

  // Seed simulated active queue for OPD
  // Now serving OPD-020. Ahead: 021, 022, 023. User is OPD-024!
  const opdTokens = [
    { token: 'OPD-019', status: 'completed', called_at: new Date(Date.now() - 25 * 60000).toISOString(), comp_at: new Date(Date.now() - 15 * 60000).toISOString() },
    { token: 'OPD-020', status: 'called', called_at: new Date(Date.now() - 4 * 60000).toISOString(), comp_at: null },
    { token: 'OPD-021', status: 'waiting', called_at: null, comp_at: null },
    { token: 'OPD-022', status: 'waiting', called_at: null, comp_at: null },
    { token: 'OPD-023', status: 'waiting', called_at: null, comp_at: null },
    { token: 'OPD-024', status: 'waiting', called_at: null, comp_at: null, visitId: demoVisitId } // Judge Demo Token!
  ];

  for (const [idx, t] of opdTokens.entries()) {
    const tokenId = `tok-opd-${20 + idx}`;
    const vId = t.visitId || `visit-sim-${idx}`;
    
    // Insert simulated visit if not existing
    if (!t.visitId) {
      await run(`
        INSERT OR IGNORE INTO visits (id, access_token, hospital_id, purpose, language, patient_name, visit_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [vId, `SIM-${idx}`, 'hosp-demo-01', 'General OPD', 'hi', `Patient ${t.token}`, 'in_progress', now, now]);
    }

    await run(`
      INSERT OR REPLACE INTO queue_tokens 
      (id, visit_id, department_id, token_number, status, priority, created_at, called_at, completed_at, counter_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tokenId,
      vId,
      'dept-opd',
      t.token,
      t.status,
      'standard',
      now,
      t.called_at,
      t.comp_at,
      t.status === 'called' ? 'Counter 2' : null
    ]);
  }

  // Preloaded Demo Journey for Judge:
  // Step 1: Registration (Completed)
  // Step 2: General OPD (Current - Token OPD-024)
  // Step 3: Pathology Laboratory (Upcoming)
  // Step 4: Pharmacy (Upcoming)
  const demoJourney = [
    { id: 'step-1', dept: 'dept-reg', order: 1, status: 'completed', comp: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: 'step-2', dept: 'dept-opd', order: 2, status: 'in_progress', comp: null },
    { id: 'step-3', dept: 'dept-lab', order: 3, status: 'pending', comp: null },
    { id: 'step-4', dept: 'dept-pha', order: 4, status: 'pending', comp: null }
  ];

  for (const j of demoJourney) {
    await run(`
      INSERT OR REPLACE INTO journey_steps (id, visit_id, department_id, step_order, status, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [j.id, demoVisitId, j.dept, j.order, j.status, now, j.comp]);
  }

  // 7. Seed Announcements
  const announcements = [
    { id: 'ann-1', dept: null, title: 'Dispensary Stock Replenished', msg: 'Jan Aushadhi pharmacy has received fresh stock of regular hypertension and diabetes medications.', prio: 'normal' },
    { id: 'ann-2', dept: 'dept-opd', title: 'Senior Citizen Express Line', msg: 'Dedicated Counter 4 is operating for senior citizens and persons with disabilities.', prio: 'urgent' },
    { id: 'ann-3', dept: 'dept-lab', title: 'Fast-Track Dengue & CBC Counter', msg: 'Blood collection counter 1-06 is prioritizing urgent viral screening today.', prio: 'normal' }
  ];

  for (const a of announcements) {
    await run(`
      INSERT OR REPLACE INTO announcements (id, hospital_id, department_id, title, message, priority, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [a.id, 'hosp-demo-01', a.dept, a.title, a.msg, a.prio, now]);
  }

  // 8. Seed Sample Feedback
  const sampleFeedbacks = [
    { id: 'fb-1', visit_id: 'visit-sim-0', nav: 5, wait: 4, ease: 5, comments: 'Dijkstra route was easy to follow. Finding the lift helped my grandmother.' },
    { id: 'fb-2', visit_id: 'visit-sim-1', nav: 4, wait: 4, ease: 5, comments: 'Voice assistant spoke Hindi very clearly. Reduced confusion completely.' },
    { id: 'fb-3', visit_id: 'visit-sim-2', nav: 5, wait: 5, ease: 5, comments: 'Caregiver link let my brother track my tests while he was in office!' }
  ];

  for (const f of sampleFeedbacks) {
    await run(`
      INSERT OR REPLACE INTO feedback (id, visit_id, rating_nav, rating_wait, rating_ease, comments, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [f.id, f.visit_id, f.nav, f.wait, f.ease, f.comments, now]);
  }

  saveDb();
  console.log('Database successfully seeded with realistic demonstration data!');
}

// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}` || process.argv.includes('--run')) {
  seedDatabase(true).then(() => {
    console.log('Seed completed successfully.');
    process.exit(0);
  }).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
