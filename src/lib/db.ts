import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  let dbPath = process.env.DATABASE_PATH 
    ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
    : path.resolve(process.cwd(), 'data', 'noleya.db');

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpPath = path.resolve('/tmp', 'noleya.db');
    const candidatePaths = [
      process.env.DATABASE_PATH ? path.resolve(process.cwd(), process.env.DATABASE_PATH) : null,
      path.resolve(process.cwd(), 'data', 'noleya.db'),
      path.resolve(__dirname, 'data', 'noleya.db'),
      path.resolve(__dirname, '..', 'data', 'noleya.db'),
      path.resolve(__dirname, '../..', 'data', 'noleya.db'),
      path.resolve(__dirname, '../../..', 'data', 'noleya.db'),
      path.resolve(__dirname, '../../../../data/noleya.db'),
      process.env.LAMBDA_TASK_ROOT ? path.resolve(process.env.LAMBDA_TASK_ROOT, 'data', 'noleya.db') : null,
    ].filter(Boolean) as string[];

    let foundSource: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundSource = p;
        break;
      }
    }

    try {
      if (!fs.existsSync(tmpPath) || fs.statSync(tmpPath).size < 1000) {
        if (foundSource) {
          fs.copyFileSync(foundSource, tmpPath);
        }
      }
      if (fs.existsSync(tmpPath)) {
        dbPath = tmpPath;
      }
    } catch (e) {
      console.error('Failed to copy database to /tmp:', e);
    }
  }

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  try {
    db.exec('PRAGMA journal_mode = WAL;');
  } catch (e) {
    try {
      db.exec('PRAGMA journal_mode = MEMORY;');
    } catch {}
  }
  try {
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA synchronous = NORMAL;');
  } catch {}

  // Ensure username column exists on users table
  try {
    db.exec('ALTER TABLE users ADD COLUMN username TEXT;');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);');
  } catch {}

  // Ensure FishyBetty owner user exists and is up to date
  try {
    const existing = db.prepare("SELECT id FROM users WHERE LOWER(email) = 'fishybetty' OR LOWER(username) = 'fishybetty'").get();
    if (!existing) {
      const salt = crypto.randomBytes(32).toString('hex');
      const hash = crypto.pbkdf2Sync('FishyBetty', salt, 100000, 64, 'sha512').toString('hex');
      const firstOwner = db.prepare("SELECT id FROM users WHERE role = 'OWNER' LIMIT 1").get() as { id: number } | undefined;
      if (firstOwner) {
        db.prepare("UPDATE users SET email = 'FishyBetty', username = 'FishyBetty', password_hash = ?, salt = ?, must_change_password = 0 WHERE id = ?")
          .run(hash, salt, firstOwner.id);
      } else {
        db.prepare("INSERT INTO users (email, username, password_hash, salt, name, role, status, must_change_password) VALUES ('FishyBetty', 'FishyBetty', ?, ?, 'Noléya Executive Admin', 'OWNER', 'active', 0)")
          .run(hash, salt);
      }
    }
  } catch (e) {
    console.error('Failed to ensure FishyBetty owner:', e);
  }

  dbInstance = db;
  return dbInstance;
}

export function query<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  return rows.map((r: any) => ({ ...r })) as unknown as T[];
}

export function get<T = any>(sql: string, params: any[] = []): T | undefined {
  const db = getDb();
  const stmt = db.prepare(sql);
  const row = stmt.get(...params);
  return row ? ({ ...(row as any) } as unknown as T) : undefined;
}

export function run(sql: string, params: any[] = []): { changes: number | bigint; lastInsertRowid: number | bigint } {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

export function exec(sql: string): void {
  const db = getDb();
  db.exec(sql);
}

export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec('BEGIN TRANSACTION;');
  try {
    const result = fn();
    db.exec('COMMIT;');
    return result;
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}
