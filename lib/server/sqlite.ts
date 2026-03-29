import { mkdirSync, existsSync, readFileSync } from "fs";
import path from "path";
import { properties, towingCompanies, users } from "@/lib/mock-data";

const sqlite = require("node:sqlite") as any;
const { DatabaseSync } = sqlite;

const dbDir = path.join(process.cwd(), "data", "sqlite");
const dbPath = path.join(dbDir, "towtrack.sqlite");
const schemaPath = path.join(process.cwd(), "db", "schema.sql");
const jsonSeedPath = path.join(process.cwd(), "data", "vehicles.json");

let initialized = false;

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function getDb() {
  mkdirSync(dbDir, { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");
  if (!initialized) {
    const schema = readFileSync(schemaPath, "utf-8");
    db.exec(schema);
    seedReferenceData(db);
    seedVehiclesFromJson(db);
    initialized = true;
  }
  return db;
}

function seedReferenceData(db: any) {
  const propertyCount = db.prepare("SELECT COUNT(*) as count FROM properties").get() as { count: number };
  if (propertyCount.count === 0) {
    const stmt = db.prepare(`
      INSERT INTO properties (id, name, code, address, zones_json, towing_rules, default_tow_company, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const property of properties) {
      stmt.run(
        property.id,
        property.name,
        property.code,
        property.address,
        JSON.stringify(property.zones),
        property.towingRules,
        property.defaultTowCompany,
        property.notes
      );
    }
  }

  const companyCount = db.prepare("SELECT COUNT(*) as count FROM towing_companies").get() as { count: number };
  if (companyCount.count === 0) {
    const stmt = db.prepare(`
      INSERT INTO towing_companies (id, company_name, phone, email, dispatch_contact, notes, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const company of towingCompanies) {
      stmt.run(
        company.id,
        company.companyName,
        company.phone,
        company.email,
        company.dispatchContact,
        company.notes,
        company.active ? 1 : 0
      );
    }
  }

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, role, property, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const user of users) {
      stmt.run(user.id, user.name, user.email, user.role, user.property, user.status);
    }
  }
}

function seedVehiclesFromJson(db: any) {
  const vehicleCount = db.prepare("SELECT COUNT(*) as count FROM vehicles").get() as { count: number };
  if (vehicleCount.count > 0 || !existsSync(jsonSeedPath)) {
    return;
  }

  const json = parseJson<any[]>(readFileSync(jsonSeedPath, "utf-8"));
  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (
      id, plate, plate_state, vin, make, model, year, color, body_style, property_name, zone, exact_location,
      unit_association, tow_reason, notes, current_status, date_time_first_observed, date_time_warning_placed,
      date_time_marked_for_tow, date_time_tow_requested, date_time_tow_completed, towing_company, tow_reference_number,
      created_by, last_updated_by, watchlist, repeat_offender, prior_history
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPhoto = db.prepare(`
    INSERT INTO vehicle_photos (id, vehicle_id, label, user_name, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertActivity = db.prepare(`
    INSERT INTO vehicle_activity (id, vehicle_id, type, by_user, timestamp, detail)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const vehicle of json) {
    insertVehicle.run(
      vehicle.id,
      vehicle.plate,
      vehicle.plateState,
      vehicle.vin,
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.color,
      vehicle.bodyStyle,
      vehicle.propertyName,
      vehicle.zone,
      vehicle.exactLocation,
      vehicle.unitAssociation,
      vehicle.towReason,
      vehicle.notes,
      vehicle.currentStatus,
      vehicle.dateTimeFirstObserved,
      vehicle.dateTimeWarningPlaced || null,
      vehicle.dateTimeMarkedForTow || null,
      vehicle.dateTimeTowRequested || null,
      vehicle.dateTimeTowCompleted || null,
      vehicle.towingCompany,
      vehicle.towReferenceNumber || null,
      vehicle.createdBy,
      vehicle.lastUpdatedBy,
      vehicle.watchlist ? 1 : 0,
      vehicle.repeatOffender ? 1 : 0,
      vehicle.priorHistory || 0
    );

    for (const photo of vehicle.photos || []) {
      insertPhoto.run(photo.id, vehicle.id, photo.label, photo.user, photo.timestamp);
    }

    for (const activity of vehicle.activity || []) {
      insertActivity.run(activity.id, vehicle.id, activity.type, activity.by, activity.timestamp, activity.detail);
    }
  }
}

export function withDb<T>(callback: (db: any) => T): T {
  const db = getDb();
  return callback(db);
}
