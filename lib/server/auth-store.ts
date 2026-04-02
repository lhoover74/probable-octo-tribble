import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type D1Env = { DB: any };

export type AuthSessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  property: string;
  status: string;
};

const SESSION_TTL_DAYS = 14;

function getDb(): any {
  const { env } = getCloudflareContext();
  return (env as D1Env).DB;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function expiresIso() {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_TTL_DAYS);
  return expires.toISOString();
}

export async function ensureAuthTables() {
  const db = getDb();
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS auth_credentials (
      user_id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      password_updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ).run();
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at)").run();
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [, salt, hash] = storedHash.split("$");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, "hex");
  return storedBuffer.length === derived.length && timingSafeEqual(storedBuffer, derived);
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function hasAnyAuthCredentials() {
  await ensureAuthTables();
  const db = getDb();
  const row = await db.prepare("SELECT COUNT(*) as count FROM auth_credentials").first();
  return Number((row as any)?.count || 0) > 0;
}

export async function createOrUpdateCredential(userId: string, password: string) {
  await ensureAuthTables();
  const db = getDb();
  const passwordHash = hashPassword(password);
  await db.prepare(
    `INSERT INTO auth_credentials (user_id, password_hash, password_updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET password_hash = excluded.password_hash, password_updated_at = excluded.password_updated_at`
  ).bind(userId, passwordHash, nowIso()).run();
}

export async function setupInitialAdmin(input: { name: string; email: string; password: string }) {
  await ensureAuthTables();
  const db = getDb();

  if (await hasAnyAuthCredentials()) {
    throw new Error("Initial setup already completed.");
  }

  const existingUser = await db.prepare("SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1").bind(input.email).first();
  const userId = (existingUser as any)?.id || createId("user");

  if (existingUser) {
    await db.prepare(
      `UPDATE users
       SET name = ?, role = 'Admin', property = 'All Properties', status = 'Active'
       WHERE id = ?`
    ).bind(input.name, userId).run();
  } else {
    await db.prepare(
      `INSERT INTO users (id, name, email, role, property, status)
       VALUES (?, ?, ?, 'Admin', 'All Properties', 'Active')`
    ).bind(userId, input.name, input.email, 'Admin', 'All Properties', 'Active').run();
  }

  await createOrUpdateCredential(userId, input.password);
  const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
  return user as AuthSessionUser;
}

export async function authenticateUser(email: string, password: string) {
  await ensureAuthTables();
  const db = getDb();
  const row = await db.prepare(
    `SELECT users.*, auth_credentials.password_hash
     FROM users
     LEFT JOIN auth_credentials ON auth_credentials.user_id = users.id
     WHERE lower(users.email) = lower(?)
     LIMIT 1`
  ).bind(email).first();

  if (!row || (row as any).status !== 'Active' || !(row as any).password_hash) {
    return null;
  }

  if (!verifyPassword(password, String((row as any).password_hash))) {
    return null;
  }

  return {
    id: String((row as any).id),
    name: String((row as any).name),
    email: String((row as any).email),
    role: String((row as any).role),
    property: String((row as any).property),
    status: String((row as any).status)
  } satisfies AuthSessionUser;
}

export async function createSessionForUser(input: {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await ensureAuthTables();
  const db = getDb();
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const createdAt = nowIso();
  const expiresAt = expiresIso();

  await db.prepare(
    `INSERT INTO auth_sessions (
      id, user_id, session_token_hash, expires_at, created_at, last_seen_at, ip_address, user_agent
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    createId('sess'),
    input.userId,
    tokenHash,
    expiresAt,
    createdAt,
    createdAt,
    input.ipAddress || null,
    input.userAgent || null
  ).run();

  return { token, expiresAt };
}

export async function getSessionByToken(token: string) {
  await ensureAuthTables();
  const db = getDb();
  const tokenHash = hashSessionToken(token);
  const row = await db.prepare(
    `SELECT users.*, auth_sessions.expires_at
     FROM auth_sessions
     INNER JOIN users ON users.id = auth_sessions.user_id
     WHERE auth_sessions.session_token_hash = ?
       AND auth_sessions.expires_at > ?
       AND users.status = 'Active'
     LIMIT 1`
  ).bind(tokenHash, nowIso()).first();

  if (!row) {
    return null;
  }

  await db.prepare(
    `UPDATE auth_sessions SET last_seen_at = ? WHERE session_token_hash = ?`
  ).bind(nowIso(), tokenHash).run();

  return {
    user: {
      id: String((row as any).id),
      name: String((row as any).name),
      email: String((row as any).email),
      role: String((row as any).role),
      property: String((row as any).property),
      status: String((row as any).status)
    } satisfies AuthSessionUser,
    expiresAt: String((row as any).expires_at)
  };
}

export async function deleteSessionByToken(token: string) {
  await ensureAuthTables();
  const db = getDb();
  await db.prepare("DELETE FROM auth_sessions WHERE session_token_hash = ?").bind(hashSessionToken(token)).run();
}
