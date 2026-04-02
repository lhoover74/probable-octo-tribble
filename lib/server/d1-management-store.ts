import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createOrUpdateCredential } from "@/lib/server/auth-store";

type D1Env = { DB: any };

type ReadOptions = {
  includeInactive?: boolean;
};

function getDb(): any {
  const { env } = getCloudflareContext();
  return (env as D1Env).DB;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureManagementSchema() {
  const db = getDb();
  const result = await db.prepare("PRAGMA table_info(properties)").all();
  const columns = ((result.results || []) as Array<{ name: string }>).map((column) => column.name);

  if (!columns.includes("active")) {
    await db.prepare("ALTER TABLE properties ADD COLUMN active INTEGER NOT NULL DEFAULT 1").run();
  }
}

export async function readUsersFromD1() {
  const db = getDb();
  const result = await db.prepare(
    `SELECT users.*, CASE WHEN auth_credentials.user_id IS NULL THEN 0 ELSE 1 END AS password_configured
     FROM users
     LEFT JOIN auth_credentials ON auth_credentials.user_id = users.id
     ORDER BY users.name ASC`
  ).all();
  return (result.results || []) as Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    property: string;
    status: string;
    password_configured: number;
  }>;
}

export async function readUserFromD1(id: string) {
  const db = getDb();
  const row = await db.prepare(
    `SELECT users.*, CASE WHEN auth_credentials.user_id IS NULL THEN 0 ELSE 1 END AS password_configured
     FROM users
     LEFT JOIN auth_credentials ON auth_credentials.user_id = users.id
     WHERE users.id = ?
     LIMIT 1`
  ).bind(id).first();
  return row as {
    id: string;
    name: string;
    email: string;
    role: string;
    property: string;
    status: string;
    password_configured: number;
  } | null;
}

export async function readPropertiesFromD1(options: ReadOptions = {}) {
  await ensureManagementSchema();
  const db = getDb();
  const query = options.includeInactive
    ? "SELECT * FROM properties ORDER BY name ASC"
    : "SELECT * FROM properties WHERE active = 1 ORDER BY name ASC";
  const result = await db.prepare(query).all();
  return ((result.results || []) as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address,
    zones: JSON.parse(row.zones_json || "[]") as string[],
    towingRules: row.towing_rules,
    defaultTowCompany: row.default_tow_company,
    notes: row.notes,
    active: Number(row.active ?? 1)
  }));
}

export async function readPropertyFromD1(id: string) {
  await ensureManagementSchema();
  const db = getDb();
  const row = await db.prepare("SELECT * FROM properties WHERE id = ? LIMIT 1").bind(id).first();
  if (!row) return null;
  return {
    id: (row as any).id,
    name: (row as any).name,
    code: (row as any).code,
    address: (row as any).address,
    zones: JSON.parse(String((row as any).zones_json || "[]")) as string[],
    towingRules: (row as any).towing_rules,
    defaultTowCompany: (row as any).default_tow_company,
    notes: (row as any).notes,
    active: Number((row as any).active ?? 1)
  };
}

export async function readTowingCompaniesFromD1(options: ReadOptions = {}) {
  const db = getDb();
  const query = options.includeInactive
    ? "SELECT * FROM towing_companies ORDER BY company_name ASC"
    : "SELECT * FROM towing_companies WHERE active = 1 ORDER BY company_name ASC";
  const result = await db.prepare(query).all();
  return (result.results || []) as Array<{
    id: string;
    company_name: string;
    phone: string;
    email: string;
    dispatch_contact: string;
    notes: string;
    active: number;
  }>;
}

export async function readTowingCompanyFromD1(id: string) {
  const db = getDb();
  const row = await db.prepare("SELECT * FROM towing_companies WHERE id = ? LIMIT 1").bind(id).first();
  return row as {
    id: string;
    company_name: string;
    phone: string;
    email: string;
    dispatch_contact: string;
    notes: string;
    active: number;
  } | null;
}

export async function createUserInD1(input: {
  name: string;
  email: string;
  role: string;
  property: string;
  status: string;
  password?: string;
}) {
  const db = getDb();
  const id = createId("user");
  await db.prepare(
    `INSERT INTO users (id, name, email, role, property, status)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, input.name, input.email, input.role, input.property, input.status).run();

  if (input.password?.trim()) {
    await createOrUpdateCredential(id, input.password);
  }

  return id;
}

export async function updateUserInD1(id: string, input: {
  name: string;
  email: string;
  role: string;
  property: string;
  status: string;
  password?: string;
}) {
  const db = getDb();
  await db.prepare(
    `UPDATE users
     SET name = ?, email = ?, role = ?, property = ?, status = ?
     WHERE id = ?`
  ).bind(input.name, input.email, input.role, input.property, input.status, id).run();

  if (input.password?.trim()) {
    await createOrUpdateCredential(id, input.password);
  }

  if (input.status !== "Active") {
    await db.prepare("DELETE FROM auth_sessions WHERE user_id = ?").bind(id).run();
  }
}

export async function createPropertyInD1(input: {
  name: string;
  code: string;
  address: string;
  zonesCsv: string;
  towingRules: string;
  defaultTowCompany: string;
  notes: string;
}) {
  await ensureManagementSchema();
  const db = getDb();
  const id = createId("prop");
  const zones = input.zonesCsv
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await db.prepare(
    `INSERT INTO properties (id, name, code, address, zones_json, towing_rules, default_tow_company, notes, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).bind(
    id,
    input.name,
    input.code,
    input.address,
    JSON.stringify(zones),
    input.towingRules,
    input.defaultTowCompany,
    input.notes
  ).run();

  return id;
}

export async function updatePropertyInD1(id: string, input: {
  name: string;
  code: string;
  address: string;
  zonesCsv: string;
  towingRules: string;
  defaultTowCompany: string;
  notes: string;
  active: boolean;
}) {
  await ensureManagementSchema();
  const db = getDb();
  const zones = input.zonesCsv
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await db.prepare(
    `UPDATE properties
     SET name = ?, code = ?, address = ?, zones_json = ?, towing_rules = ?, default_tow_company = ?, notes = ?, active = ?
     WHERE id = ?`
  ).bind(
    input.name,
    input.code,
    input.address,
    JSON.stringify(zones),
    input.towingRules,
    input.defaultTowCompany,
    input.notes,
    input.active ? 1 : 0,
    id
  ).run();
}

export async function createTowingCompanyInD1(input: {
  companyName: string;
  phone: string;
  email: string;
  dispatchContact: string;
  notes: string;
  active: boolean;
}) {
  const db = getDb();
  const id = createId("tow");
  await db.prepare(
    `INSERT INTO towing_companies (id, company_name, phone, email, dispatch_contact, notes, active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    input.companyName,
    input.phone,
    input.email,
    input.dispatchContact,
    input.notes,
    input.active ? 1 : 0
  ).run();

  return id;
}

export async function updateTowingCompanyInD1(id: string, input: {
  companyName: string;
  phone: string;
  email: string;
  dispatchContact: string;
  notes: string;
  active: boolean;
}) {
  const db = getDb();
  await db.prepare(
    `UPDATE towing_companies
     SET company_name = ?, phone = ?, email = ?, dispatch_contact = ?, notes = ?, active = ?
     WHERE id = ?`
  ).bind(
    input.companyName,
    input.phone,
    input.email,
    input.dispatchContact,
    input.notes,
    input.active ? 1 : 0,
    id
  ).run();
}
