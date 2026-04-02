import { getCloudflareContext } from "@opennextjs/cloudflare";

type D1Env = { DB: any };

function getDb(): any {
  const { env } = getCloudflareContext();
  return (env as D1Env).DB;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function readUsersFromD1() {
  const db = getDb();
  const result = await db.prepare("SELECT * FROM users ORDER BY name ASC").all();
  return (result.results || []) as Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    property: string;
    status: string;
  }>;
}

export async function readPropertiesFromD1() {
  const db = getDb();
  const result = await db.prepare("SELECT * FROM properties ORDER BY name ASC").all();
  return ((result.results || []) as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address,
    zones: JSON.parse(row.zones_json || "[]") as string[],
    towingRules: row.towing_rules,
    defaultTowCompany: row.default_tow_company,
    notes: row.notes
  }));
}

export async function createUserInD1(input: {
  name: string;
  email: string;
  role: string;
  property: string;
  status: string;
}) {
  const db = getDb();
  const id = createId("user");
  await db.prepare(
    `INSERT INTO users (id, name, email, role, property, status)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, input.name, input.email, input.role, input.property, input.status).run();
  return id;
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
  const db = getDb();
  const id = createId("prop");
  const zones = input.zonesCsv
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await db.prepare(
    `INSERT INTO properties (id, name, code, address, zones_json, towing_rules, default_tow_company, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
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
