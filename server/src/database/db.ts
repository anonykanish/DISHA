import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';

let dbInstance: Database | null = null;
let SQL: SqlJsStatic | null = null;

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'disha.sqlite');

function sanitizeParams(params: any[]): any[] {
  return params.map(val => (val === undefined ? null : val));
}

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Enable foreign keys
  dbInstance.run('PRAGMA foreign_keys = ON;');

  return dbInstance;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database file:', err);
  }
}

/**
 * Execute a query that returns multiple rows
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const cleanParams = sanitizeParams(params);
  const stmt = db.prepare(sql);
  stmt.bind(cleanParams);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

/**
 * Execute a query that returns a single row
 */
export async function getOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT, UPDATE, or DELETE statement and save the database
 */
export async function run(sql: string, params: any[] = []): Promise<{ changes: number }> {
  const db = await getDb();
  const cleanParams = sanitizeParams(params);
  db.run(sql, cleanParams);
  saveDb();
  return { changes: db.getRowsModified() };
}

/**
 * Execute raw multi-line SQL statements (e.g. schema creation)
 */
export async function exec(sql: string): Promise<void> {
  const db = await getDb();
  db.exec(sql);
  saveDb();
}
