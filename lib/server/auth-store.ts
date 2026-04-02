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

export type InviteRecord = {
  id: string;
  email: string;
  role: string;
  property: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string | null;
};

export type SessionRecord = {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type SecurityAuditLog = {
  id: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  detail: string;
  ipAddress?: string | null;
  createdAt: string;
};

const SESSION_TTL_DAYS = 14;
const INVITE_TTL_HOURS = 72;
const RESET_TTL_MINUTES = 30;

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

function shiftIso(input: { days?: number; hours?: number; minutes?: number }) {
  const date = new Date();
  if (input.days) date.setDate(date.getDate() + input.days);
  if (input.hours) date.setHours(date.getHours() + input.hours);
  if (input.minutes) date.setMinutes(date.getMinutes() + input.minutes);
  return date.toISOString();
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

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createOpaqueToken() {
  return randomBytes(32).toString("base64url");
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
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS auth_invites (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      property TEXT NOT NULL,
      invited_by_user_id TEXT,
      invite_token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      accepted_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`
  ).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_auth_invites_email ON auth_invites(email)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_auth_invites_expires_at ON auth_invites(expires_at)").run();
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reset_token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)").run();
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS security_audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      actor_email TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      detail TEXT NOT NULL,
      ip_address TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`
  ).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_security_audit_logs_actor_user_id ON security_audit_logs(actor_user_id)").run();
}

export async function createSecurityAuditLog(input: {
  actorUserId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  detail: string;
  ipAddress?: string | null;
}) {
  await ensureAuthTables();
  const db = getDb();
  await db.prepare(
    `INSERT INTO security_audit_logs (
      id, actor_user_id, actor_email, action, target_type, target_id, detail, ip_address, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    createId("audit"),
    input.actorUserId || null,
    input.actorEmail || null,
    input.action,
    input.targetType,
    input.targetId || null,
    input.detail,
    input.ipAddress || null,
    nowIso()
  ).run();
}

export async function hasAnyAuthCredentials() {
  await ensureAuthTables();
  const db = getDb();
  const row = await db.prepare("SELECT COUNT(*) as count FROM auth_credentials").first();
  return Number((row as any)?.count || 0) > 0;
}

export async function createOrUpdateCredential(userId: string, password: string) {
  await ensureAuthTables();
  if (password.trim().length < 10) {
    throw new Error("Password must be at least 10 characters.");
  }
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
    ).bind(userId, input.name, input.email).run();
  }

  await createOrUpdateCredential(userId, input.password);
  await createSecurityAuditLog({
    actorUserId: userId,
    actorEmail: input.email,
    action: "auth.initial_admin_setup",
    targetType: "user",
    targetId: userId,
    detail: "Initial admin account created."
  });

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

  if (!row || (row as any).status !== "Active" || !(row as any).password_hash) {
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
  const token = createOpaqueToken();
  const tokenHash = hashToken(token);
  const createdAt = nowIso();
  const expiresAt = shiftIso({ days: SESSION_TTL_DAYS });
  const sessionId = createId("sess");

  await db.prepare(
    `INSERT INTO auth_sessions (
      id, user_id, session_token_hash, expires_at, created_at, last_seen_at, ip_address, user_agent
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    sessionId,
    input.userId,
    tokenHash,
    expiresAt,
    createdAt,
    createdAt,
    input.ipAddress || null,
    input.userAgent || null
  ).run();

  return { sessionId, token, expiresAt };
}

export async function getSessionByToken(token: string) {
  await ensureAuthTables();
  const db = getDb();
  const tokenHash = hashToken(token);
  const row = await db.prepare(
    `SELECT users.*, auth_sessions.id as session_id, auth_sessions.expires_at
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
    sessionId: String((row as any).session_id),
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
  await db.prepare("DELETE FROM auth_sessions WHERE session_token_hash = ?").bind(hashToken(token)).run();
}

export async function listSessionsForUser(userId: string): Promise<SessionRecord[]> {
  await ensureAuthTables();
  const db = getDb();
  const result = await db.prepare(
    `SELECT id, created_at, last_seen_at, expires_at, ip_address, user_agent
     FROM auth_sessions WHERE user_id = ? ORDER BY last_seen_at DESC`
  ).bind(userId).all();
  return ((result.results || []) as any[]).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    expiresAt: row.expires_at,
    ipAddress: row.ip_address,
    userAgent: row.user_agent
  }));
}

export async function revokeOtherSessionsForUser(userId: string, currentSessionId: string) {
  await ensureAuthTables();
  const db = getDb();
  const result = await db.prepare(
    `DELETE FROM auth_sessions WHERE user_id = ? AND id != ?`
  ).bind(userId, currentSessionId).run();
  return Number((result as any)?.meta?.changes || 0);
}

export async function createInvite(input: {
  email: string;
  role: string;
  property: string;
  invitedByUserId?: string | null;
  invitedByEmail?: string | null;
}) {
  await ensureAuthTables();
  const db = getDb();
  const token = createOpaqueToken();
  const expiresAt = shiftIso({ hours: INVITE_TTL_HOURS });
  const createdAt = nowIso();

  await db.prepare(
    `INSERT INTO auth_invites (
      id, email, role, property, invited_by_user_id, invite_token_hash, expires_at, accepted_at, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  ).bind(
    createId("invite"),
    input.email,
    input.role,
    input.property,
    input.invitedByUserId || null,
    hashToken(token),
    expiresAt,
    createdAt
  ).run();

  await createSecurityAuditLog({
    actorUserId: input.invitedByUserId || null,
    actorEmail: input.invitedByEmail || null,
    action: "auth.invite_created",
    targetType: "invite",
    targetId: input.email,
    detail: `Invite created for ${input.email} with role ${input.role}.`
  });

  return { token, expiresAt };
}

export async function listPendingInvites(limit = 20): Promise<InviteRecord[]> {
  await ensureAuthTables();
  const db = getDb();
  const result = await db.prepare(
    `SELECT id, email, role, property, expires_at, created_at, accepted_at
     FROM auth_invites
     WHERE accepted_at IS NULL AND expires_at > ?
     ORDER BY created_at DESC
     LIMIT ?`
  ).bind(nowIso(), limit).all();
  return ((result.results || []) as any[]).map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    property: row.property,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at
  }));
}

export async function readInviteByToken(token: string): Promise<InviteRecord | null> {
  await ensureAuthTables();
  const db = getDb();
  const row = await db.prepare(
    `SELECT id, email, role, property, expires_at, created_at, accepted_at
     FROM auth_invites
     WHERE invite_token_hash = ?
       AND accepted_at IS NULL
       AND expires_at > ?
     LIMIT 1`
  ).bind(hashToken(token), nowIso()).first();
  if (!row) return null;
  return {
    id: String((row as any).id),
    email: String((row as any).email),
    role: String((row as any).role),
    property: String((row as any).property),
    expiresAt: String((row as any).expires_at),
    createdAt: String((row as any).created_at),
    acceptedAt: (row as any).accepted_at || null
  };
}

export async function acceptInvite(input: { token: string; name: string; password: string }) {
  await ensureAuthTables();
  const db = getDb();
  const invite = await readInviteByToken(input.token);
  if (!invite) {
    return null;
  }

  const existingUser = await db.prepare(
    `SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1`
  ).bind(invite.email).first();
  const userId = (existingUser as any)?.id || createId("user");

  if (existingUser) {
    await db.prepare(
      `UPDATE users
       SET name = ?, role = ?, property = ?, status = 'Active'
       WHERE id = ?`
    ).bind(input.name, invite.role, invite.property, userId).run();
  } else {
    await db.prepare(
      `INSERT INTO users (id, name, email, role, property, status)
       VALUES (?, ?, ?, ?, ?, 'Active')`
    ).bind(userId, input.name, invite.email, invite.role, invite.property).run();
  }

  await createOrUpdateCredential(userId, input.password);
  await db.prepare(
    `UPDATE auth_invites SET accepted_at = ? WHERE id = ?`
  ).bind(nowIso(), invite.id).run();

  await createSecurityAuditLog({
    actorUserId: userId,
    actorEmail: invite.email,
    action: "auth.invite_accepted",
    targetType: "user",
    targetId: userId,
    detail: `Invite accepted for ${invite.email}.`
  });

  const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
  return user as AuthSessionUser;
}

export async function createPasswordResetToken(email: string) {
  await ensureAuthTables();
  const db = getDb();
  const user = await db.prepare(
    `SELECT * FROM users WHERE lower(email) = lower(?) AND status = 'Active' LIMIT 1`
  ).bind(email).first();

  if (!user) {
    return null;
  }

  await db.prepare(
    `UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL`
  ).bind(nowIso(), (user as any).id).run();

  const token = createOpaqueToken();
  const expiresAt = shiftIso({ minutes: RESET_TTL_MINUTES });
  await db.prepare(
    `INSERT INTO password_reset_tokens (id, user_id, reset_token_hash, expires_at, used_at, created_at)
     VALUES (?, ?, ?, ?, NULL, ?)`
  ).bind(createId("reset"), (user as any).id, hashToken(token), expiresAt, nowIso()).run();

  await createSecurityAuditLog({
    actorUserId: (user as any).id,
    actorEmail: String((user as any).email),
    action: "auth.password_reset_requested",
    targetType: "user",
    targetId: String((user as any).id),
    detail: `Password reset requested for ${String((user as any).email)}.`
  });

  return {
    token,
    expiresAt,
    userId: String((user as any).id),
    email: String((user as any).email),
    name: String((user as any).name)
  };
}

export async function readPasswordResetToken(token: string) {
  await ensureAuthTables();
  const db = getDb();
  const row = await db.prepare(
    `SELECT password_reset_tokens.id, password_reset_tokens.expires_at, users.id as user_id, users.email, users.name
     FROM password_reset_tokens
     INNER JOIN users ON users.id = password_reset_tokens.user_id
     WHERE password_reset_tokens.reset_token_hash = ?
       AND password_reset_tokens.used_at IS NULL
       AND password_reset_tokens.expires_at > ?
     LIMIT 1`
  ).bind(hashToken(token), nowIso()).first();

  if (!row) {
    return null;
  }

  return {
    id: String((row as any).id),
    userId: String((row as any).user_id),
    email: String((row as any).email),
    name: String((row as any).name),
    expiresAt: String((row as any).expires_at)
  };
}

export async function consumePasswordResetToken(input: { token: string; password: string }) {
  await ensureAuthTables();
  const db = getDb();
  const tokenRecord = await readPasswordResetToken(input.token);
  if (!tokenRecord) {
    return null;
  }

  await createOrUpdateCredential(tokenRecord.userId, input.password);
  await db.prepare(
    `UPDATE password_reset_tokens SET used_at = ? WHERE id = ?`
  ).bind(nowIso(), tokenRecord.id).run();
  await db.prepare(`DELETE FROM auth_sessions WHERE user_id = ?`).bind(tokenRecord.userId).run();

  await createSecurityAuditLog({
    actorUserId: tokenRecord.userId,
    actorEmail: tokenRecord.email,
    action: "auth.password_reset_completed",
    targetType: "user",
    targetId: tokenRecord.userId,
    detail: `Password reset completed for ${tokenRecord.email}.`
  });

  const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(tokenRecord.userId).first();
  return user as AuthSessionUser;
}

export async function listSecurityAuditLogs(limit = 25): Promise<SecurityAuditLog[]> {
  await ensureAuthTables();
  const db = getDb();
  const result = await db.prepare(
    `SELECT * FROM security_audit_logs ORDER BY created_at DESC LIMIT ?`
  ).bind(limit).all();
  return ((result.results || []) as any[]).map((row) => ({
    id: row.id,
    actorUserId: row.actor_user_id,
    actorEmail: row.actor_email,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    detail: row.detail,
    ipAddress: row.ip_address,
    createdAt: row.created_at
  }));
}

export async function listSecurityAuditLogsForUser(userId: string, limit = 20): Promise<SecurityAuditLog[]> {
  await ensureAuthTables();
  const db = getDb();
  const result = await db.prepare(
    `SELECT * FROM security_audit_logs
     WHERE actor_user_id = ? OR target_id = ?
     ORDER BY created_at DESC
     LIMIT ?`
  ).bind(userId, userId, limit).all();
  return ((result.results || []) as any[]).map((row) => ({
    id: row.id,
    actorUserId: row.actor_user_id,
    actorEmail: row.actor_email,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    detail: row.detail,
    ipAddress: row.ip_address,
    createdAt: row.created_at
  }));
}
