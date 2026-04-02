import { getCloudflareContext } from "@opennextjs/cloudflare";
import { properties, towingCompanies, users, vehicles } from "@/lib/mock-data";

type D1Env = { DB: any };

function getDb(): any {
  const { env } = getCloudflareContext();
  return (env as D1Env).DB;
}

export async function seedDemoDataInD1() {
  const db = getDb();

  for (const property of properties) {
    await db.prepare(
      `INSERT OR IGNORE INTO properties (id, name, code, address, zones_json, towing_rules, default_tow_company, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      property.id,
      property.name,
      property.code,
      property.address,
      JSON.stringify(property.zones),
      property.towingRules,
      property.defaultTowCompany,
      property.notes
    ).run();
  }

  for (const company of towingCompanies) {
    await db.prepare(
      `INSERT OR IGNORE INTO towing_companies (id, company_name, phone, email, dispatch_contact, notes, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      company.id,
      company.companyName,
      company.phone,
      company.email,
      company.dispatchContact,
      company.notes,
      company.active ? 1 : 0
    ).run();
  }

  for (const user of users) {
    await db.prepare(
      `INSERT OR IGNORE INTO users (id, name, email, role, property, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(user.id, user.name, user.email, user.role, user.property, user.status).run();
  }

  for (const vehicle of vehicles) {
    await db.prepare(
      `INSERT OR IGNORE INTO vehicles (
        id, plate, plate_state, vin, make, model, year, color, body_style, property_name, zone, exact_location,
        unit_association, tow_reason, notes, current_status, date_time_first_observed, date_time_warning_placed,
        date_time_marked_for_tow, date_time_tow_requested, date_time_tow_completed, towing_company, tow_reference_number,
        created_by, last_updated_by, watchlist, repeat_offender, prior_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
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
    ).run();

    for (const photo of vehicle.photos) {
      await db.prepare(
        `INSERT OR IGNORE INTO vehicle_photos (id, vehicle_id, label, user_name, timestamp)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(photo.id, vehicle.id, photo.label, photo.user, photo.timestamp).run();
    }

    for (const activity of vehicle.activity) {
      await db.prepare(
        `INSERT OR IGNORE INTO vehicle_activity (id, vehicle_id, type, by_user, timestamp, detail)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(activity.id, vehicle.id, activity.type, activity.by, activity.timestamp, activity.detail).run();
    }
  }
}

export async function resetDemoDataInD1() {
  const db = getDb();

  await db.prepare("DELETE FROM vehicle_activity").run();
  await db.prepare("DELETE FROM vehicle_photos").run();
  await db.prepare("DELETE FROM vehicles").run();
  await db.prepare("DELETE FROM users").run();
  await db.prepare("DELETE FROM towing_companies").run();
  await db.prepare("DELETE FROM properties").run();

  await seedDemoDataInD1();
}
