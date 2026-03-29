import { withDb } from "@/lib/server/sqlite";
import type { TowStatus, VehicleRecord } from "@/lib/types";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

export function readVehiclesFromSqlite(): VehicleRecord[] {
  return withDb((db) => {
    const rows = db.prepare("SELECT * FROM vehicles ORDER BY date_time_first_observed DESC").all() as any[];
    const photoStmt = db.prepare("SELECT * FROM vehicle_photos WHERE vehicle_id = ? ORDER BY timestamp DESC");
    const activityStmt = db.prepare("SELECT * FROM vehicle_activity WHERE vehicle_id = ? ORDER BY timestamp DESC");

    return rows.map((row) => mapVehicleRow(row, photoStmt.all(row.id), activityStmt.all(row.id)));
  });
}

export function readVehicleFromSqlite(id: string): VehicleRecord | null {
  return withDb((db) => {
    const row = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(id) as any;
    if (!row) return null;
    const photos = db.prepare("SELECT * FROM vehicle_photos WHERE vehicle_id = ? ORDER BY timestamp DESC").all(id) as any[];
    const activity = db.prepare("SELECT * FROM vehicle_activity WHERE vehicle_id = ? ORDER BY timestamp DESC").all(id) as any[];
    return mapVehicleRow(row, photos, activity);
  });
}

export function createVehicleInSqlite(input: {
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
  return withDb((db) => {
    const repeatMatches = db.prepare(
      "SELECT COUNT(*) as count FROM vehicles WHERE lower(plate) = lower(?) OR lower(vin) = lower(?)"
    ).get(input.plate || "", input.vin || "") as { count: number };

    const now = new Date().toISOString().slice(0, 16);
    const id = createId("veh");
    const towReference = input.currentStatus === "Tow Requested" ? createId("REQ") : null;

    db.prepare(`
      INSERT INTO vehicles (
        id, plate, plate_state, vin, make, model, year, color, body_style, property_name, zone, exact_location,
        unit_association, tow_reason, notes, current_status, date_time_first_observed, date_time_warning_placed,
        date_time_marked_for_tow, date_time_tow_requested, date_time_tow_completed, towing_company, tow_reference_number,
        created_by, last_updated_by, watchlist, repeat_offender, prior_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
      repeatMatches.count > 0 ? 1 : 0,
      repeatMatches.count
    );

    db.prepare(
      "INSERT INTO vehicle_activity (id, vehicle_id, type, by_user, timestamp, detail) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      createId("act"),
      id,
      "Record Created",
      "Demo User",
      now.replace("T", " "),
      `Vehicle ${input.plate || input.vin || "new record"} created at ${input.propertyName}, ${input.zone}.`
    );

    return readVehicleFromSqlite(id)!;
  });
}

export function updateVehicleInSqlite(id: string, input: { currentStatus: TowStatus; notes: string }) {
  return withDb((db) => {
    const current = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(id) as any;
    if (!current) return null;

    const now = new Date().toISOString().slice(0, 16);

    if (current.current_status !== input.currentStatus) {
      db.prepare(
        "INSERT INTO vehicle_activity (id, vehicle_id, type, by_user, timestamp, detail) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(createId("act"), id, "Status Change", "Demo User", now.replace("T", " "), `${current.current_status} → ${input.currentStatus}`);
    }

    if (input.notes.trim() && input.notes.trim() !== String(current.notes || "").trim()) {
      db.prepare(
        "INSERT INTO vehicle_activity (id, vehicle_id, type, by_user, timestamp, detail) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(createId("act"), id, "Note", "Demo User", now.replace("T", " "), input.notes.trim());
    }

    db.prepare(`
      UPDATE vehicles SET
        current_status = ?,
        notes = ?,
        last_updated_by = ?,
        date_time_warning_placed = CASE WHEN ? = 'Warning Placed' AND date_time_warning_placed IS NULL THEN ? ELSE date_time_warning_placed END,
        date_time_marked_for_tow = CASE WHEN ? = 'Marked for Tow' AND date_time_marked_for_tow IS NULL THEN ? ELSE date_time_marked_for_tow END,
        date_time_tow_requested = CASE WHEN ? = 'Tow Requested' AND date_time_tow_requested IS NULL THEN ? ELSE date_time_tow_requested END,
        date_time_tow_completed = CASE WHEN ? = 'Towed' AND date_time_tow_completed IS NULL THEN ? ELSE date_time_tow_completed END,
        tow_reference_number = CASE WHEN ? = 'Tow Requested' AND tow_reference_number IS NULL THEN ? ELSE tow_reference_number END
      WHERE id = ?
    `).run(
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
    );

    return readVehicleFromSqlite(id)!;
  });
}
