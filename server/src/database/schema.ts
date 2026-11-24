import { exec } from './db.js';

export async function initSchema(): Promise<void> {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS hospitals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      is_demo INTEGER DEFAULT 1,
      emergency_contact TEXT,
      operating_hours TEXT
    );

    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      hospital_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      floor INTEGER NOT NULL,
      block TEXT NOT NULL,
      room_number TEXT,
      average_service_time INTEGER NOT NULL DEFAULT 10,
      status TEXT NOT NULL DEFAULT 'open',
      open_counters INTEGER DEFAULT 3,
      wait_threshold_low INTEGER DEFAULT 5,
      wait_threshold_high INTEGER DEFAULT 15,
      announcement TEXT,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY,
      access_token TEXT NOT NULL UNIQUE,
      hospital_id TEXT NOT NULL,
      purpose TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      patient_name TEXT,
      patient_phone TEXT,
      patient_age INTEGER,
      patient_gender TEXT,
      visit_status TEXT NOT NULL DEFAULT 'in_progress',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS queue_tokens (
      id TEXT PRIMARY KEY,
      visit_id TEXT NOT NULL,
      department_id TEXT NOT NULL,
      token_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting',
      priority TEXT NOT NULL DEFAULT 'standard',
      created_at TEXT NOT NULL,
      called_at TEXT,
      completed_at TEXT,
      counter_number TEXT,
      FOREIGN KEY (visit_id) REFERENCES visits(id),
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS journey_steps (
      id TEXT PRIMARY KEY,
      visit_id TEXT NOT NULL,
      department_id TEXT NOT NULL,
      step_order INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (visit_id) REFERENCES visits(id),
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS map_nodes (
      id TEXT PRIMARY KEY,
      hospital_id TEXT NOT NULL,
      floor INTEGER NOT NULL,
      name TEXT NOT NULL,
      node_type TEXT NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      is_accessible INTEGER DEFAULT 1,
      description TEXT,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS map_edges (
      id TEXT PRIMARY KEY,
      hospital_id TEXT NOT NULL,
      source_node TEXT NOT NULL,
      destination_node TEXT NOT NULL,
      distance REAL NOT NULL,
      wheelchair_accessible INTEGER DEFAULT 1,
      direction_hint TEXT,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
      FOREIGN KEY (source_node) REFERENCES map_nodes(id),
      FOREIGN KEY (destination_node) REFERENCES map_nodes(id)
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department_id TEXT,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      hospital_id TEXT NOT NULL,
      department_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      created_at TEXT NOT NULL,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      visit_id TEXT NOT NULL,
      rating_nav INTEGER NOT NULL,
      rating_wait INTEGER NOT NULL,
      rating_ease INTEGER NOT NULL,
      comments TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (visit_id) REFERENCES visits(id)
    );

    CREATE TABLE IF NOT EXISTS caregiver_links (
      id TEXT PRIMARY KEY,
      visit_id TEXT NOT NULL,
      share_token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      revoked INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (visit_id) REFERENCES visits(id)
    );

    CREATE TABLE IF NOT EXISTS missed_token_requests (
      id TEXT PRIMARY KEY,
      token_id TEXT NOT NULL,
      visit_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_at TEXT NOT NULL,
      resolved_at TEXT,
      FOREIGN KEY (token_id) REFERENCES queue_tokens(id),
      FOREIGN KEY (visit_id) REFERENCES visits(id)
    );
  `;

  await exec(schemaSql);
}
