import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { TowStatus, VehicleRecord } from "@/lib/types";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDb(): any {
  const { env } = getCloudflareContext();
  return env.DB;
}

function mapVehicleRow(row: any, photos: any[], activity: any[]): VehicleRecord {
  return {
    id: row.id,
    plate: row.plate,
    plateState: row.plate_state,
    vin: row.vin,
    make: row.make,
    model: row.model,
    year: row.year,
    color: row.color,
    bodyStyle: row.body_style,
    propertyName: row.property_name,
    zone: row.zone,
    exactLocation: row.exact_location,
    unitAssociation: row.unit_association,
    towReason: row.tow_reason,
    notes: row.notes,
    currentStatus: row.current_status,
    dateTimeFirstObserved: row.date_time_first_observed,
    dateTimeWarningPlaced: row.date_time_warning_placed || undefined,
    dateTimeMarkedForTow: row.date_time_marked_for_tow || undefined,
    dateTimeTowRequested: row.date_time_tow_requested || undefined,
    dateTimeTowCompleted: row.date_time_tow_completed || undefined,
    towingCompany: row.towing_company,
    towReferenceNumber: row.tow_reference_number || undefined,
    createdBy: row.created_by,
    lastUpdatedBy: row.last_updated_by,
    watchlist: Boolean(row.watchlist),
    repeatOffender: Boolean(row.repeat_offender),
    priorHistory: Number(row.prior_history || 0),
    photos: photos.map((photo) => ({
      id: photo.id,
      label: photo.label,
      user: photo.user_name,
      timestamp: photo.timestamp
    })),
    activity: activity.map((entry) => ({
      id: entry.id,
      type: entry.type,
      by: entry.by_user,
      timestamp: entry.timestamp,
      detail: entry.detail
    }))
  };
}

export async function readVehiclesFromD1(): Promise<VehicleRecord[]> {
  const db = getDb();
  const vehicleResult = await db.prepare("SELECT * FROM vehicles ORDER BY date_time_first_observed DESC").all();
  const rows = (vehicleResult.results || []) as any[];

  return Promise.all(
    rows.map(async (row) => {
      const photoResult = await db.prepare("SELECT * FROM vehicle_photos WHERE vehicle_id = ? ORDER BY timestamp DESC").bind(row.id).all();
      const activityResult = await db.prepare("SELECT * FROM vehicle_activity WHERE vehicle_id = ? ORDER BY timestamp DESC").bind(row.id).all();
      return mapVehicleRow(row, photoResult.results || [], activityResult.results || []);
    })
  );
}

export async function readVehicleFromD1(id: string): Promise<VehicleRecord | null> {
  const db = getDb();
  const row = await db.prepare("SELECT * FROM vehicles WHERE id = ?").bind(id).first();
  if (!row) return null;
  const photoResult = await db.prepare("SELECT * FROM vehicle_photos WHERE vehicle_id = ? ORDER BY timestamp DESC").bind(id).all();
  const activityResult = await db.prepare("SELECT * FROM vehicle_activity WHERE vehicle_id = ? ORDER BY timestamp DESC").bind(id).all();
  return mapVehicleRow(row, photoResult.results || [], activityResult.results || []);
}

export async function createVehicleInD1(input: {
  plate: string;
  plateState: string;
  vin: string;
  make: string;
  model: string;
  year: string;
  color: string;
  bodyStyle: string;
  propertyName: string;
  zone: string;
  exactLocation: string;
  unitAssociation: string;
  towReason: string;
  notes: string;
  currentStatus: TowStatus;
  towingCompany: string;
}) {
  const db = getDb();
  const repeatRow = await db
    .prepare("SELECT COUNT(*) as count FROM vehicles WHERE lower(plate) = lower(?) OR lower(vin) = lower(?)")
    .bind(input.plate || "", input.vin || "")
    .first();
  const repeatCount = Number((repeatRow as any)?.count || 0);

  const now = new Date().toISOString().slice(0, 16);
  const id = createId("veh");
  const towReference = input.currentStatus === "Tow Requested" ? createId("REQ") : null;

  await db.prepare(
    `INSERT INTO vehicles (
      id, plate, plate_state, vin, make, model, year, color, body_style, property_name, zone, exact_location,
      unit_association, tow_reason, notes, current_status, date_time_first_observed, date_time_warning_placed,
      date_time_marked_for_tow, date_time_tow_requested, date_time_tow_completed, towing_company, tow_reference_number,
      created_by, last_updated_by, watchlist, repeat_offender, prior_history
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    input.plate,
    input.plateState,
    input.vin,
    input.make,
    input.model,
    input.year,
    input.color,
    input.bodyStyle,
    input.propertyName,
    input.zone,
    input.exactLocation,
    input.unitAssociation,
    input.towReason,
    input.notes,
    input.currentStatus,
    now,
    input.currentStatus === "Warning Placed" ? now : null,
    input.currentStatus === "Marked for Tow" ? now : null,
    input.currentStatus === "Tow Requested" ? now : null,
    input.currentStatus === "Towed" ? now : null,
    input.towingCompany,
    towReference,
    "Demo User",
    "Demo User",
    0,
    repeatCount > 0 ? 1 : 0,
    repeatCount
  ).run();

  await db.prepare(
    "INSERT INTO vehicle_activity (id, vehicle_id, type, by_user, timestamp, detail) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(
    createId("act"),
    id,
    "Record Created",
    "Demo User",
    now.replace("T", " "),
    `Vehicle ${input.plate || input.vin || "new record"} created at ${input.propertyName}, ${input.zone}.`
  ).run();

  return readVehicleFromD1(id) as Promise<VehicleRecord>;
}

export async function updateVehicleInD1(id: string, input: { currentStatus: TowStatus; notes: string }) {
  const db = getDb();
  const current = await db.prepare("SELECT * FROM vehicles WHERE id = ?").bind(id).first();
  if (!current) return null;

  const now = new Date().toISOString().slice(0, 16);

  if ((current as any).current_status !== input.currentStatus) {
    await db.prepare(
      "INSERT INTO vehicle_activity (id, vehicle_id, type, by_user, timestamp, detail) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(createId("act"), id, "Status Change", "Demo User", now.replace("T", " "), `${(current as any).current_status} → ${input.currentStatus}`).run();
  }

  if (input.notes.trim() && input.notes.trim() !== String((current as any).notes || "").trim()) {
    await db.prepare(
      "INSERT INTO vehicle_activity (id, vehicle_id, type, by_user, timestamp, detail) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(createId("act"), id, "Note", "Demo User", now.replace("T", " "), input.notes.trim()).run();
  }

  await db.prepare(
    `UPDATE vehicles SET
      current_status = ?,
      notes = ?,
      last_updated_by = ?,
      date_time_warning_placed = CASE WHEN ? = 'Warning Placed' AND date_time_warning_placed IS NULL THEN ? ELSE date_time_warning_placed END,
      date_time_marked_for_tow = CASE WHEN ? = 'Marked for Tow' AND date_time_marked_for_tow IS NULL THEN ? ELSE date_time_marked_for_tow END,
      date_time_tow_requested = CASE WHEN ? = 'Tow Requested' AND date_time_tow_requested IS NULL THEN ? ELSE date_time_tow_requested END,
      date_time_tow_completed = CASE WHEN ? = 'Towed' AND date_time_tow_completed IS NULL THEN ? ELSE date_time_tow_completed END,
      tow_reference_number = CASE WHEN ? = 'Tow Requested' AND tow_reference_number IS NULL THEN ? ELSE tow_reference_number END
    WHERE id = ?`
  ).bind(
    input.currentStatus,
    input.notes,
    "Demo User",
    input.currentStatus,
    now,
    input.currentStatus,
    now,
    input.currentStatus,
    now,
    input.currentStatus,
    now,
    input.currentStatus,
    createId("REQ"),
    id
  ).run();

  return readVehicleFromD1(id);
}
