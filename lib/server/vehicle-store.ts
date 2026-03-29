import { promises as fs } from "fs";
import path from "path";
import type { TowStatus, VehicleRecord } from "@/lib/types";

const dataPath = path.join(process.cwd(), "data", "vehicles.json");

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureDataFile() {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, "[]\n", "utf-8");
  }
}

export async function readVehicles(): Promise<VehicleRecord[]> {
  await ensureDataFile();
  const raw = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(raw) as VehicleRecord[];
}

async function writeVehicles(vehicles: VehicleRecord[]) {
  await fs.writeFile(dataPath, JSON.stringify(vehicles, null, 2) + "\n", "utf-8");
}

export async function readVehicleById(id: string) {
  const vehicles = await readVehicles();
  return vehicles.find((vehicle) => vehicle.id === id) ?? null;
}

export async function createVehicleRecord(input: {
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
  const vehicles = await readVehicles();
  const repeatMatches = vehicles.filter(
    (vehicle) =>
      (input.plate && vehicle.plate.toLowerCase() === input.plate.toLowerCase()) ||
      (input.vin && vehicle.vin.toLowerCase() === input.vin.toLowerCase())
  );

  const now = new Date().toISOString().slice(0, 16);
  const newRecord: VehicleRecord = {
    id: createId("veh"),
    plate: input.plate,
    plateState: input.plateState,
    vin: input.vin,
    make: input.make,
    model: input.model,
    year: input.year,
    color: input.color,
    bodyStyle: input.bodyStyle,
    propertyName: input.propertyName,
    zone: input.zone,
    exactLocation: input.exactLocation,
    unitAssociation: input.unitAssociation,
    towReason: input.towReason,
    notes: input.notes,
    currentStatus: input.currentStatus,
    dateTimeFirstObserved: now,
    dateTimeWarningPlaced: input.currentStatus === "Warning Placed" ? now : undefined,
    dateTimeMarkedForTow: input.currentStatus === "Marked for Tow" ? now : undefined,
    dateTimeTowRequested: input.currentStatus === "Tow Requested" ? now : undefined,
    dateTimeTowCompleted: input.currentStatus === "Towed" ? now : undefined,
    towingCompany: input.towingCompany,
    towReferenceNumber: input.currentStatus === "Tow Requested" ? createId("REQ") : undefined,
    createdBy: "Demo User",
    lastUpdatedBy: "Demo User",
    watchlist: false,
    repeatOffender: repeatMatches.length > 0,
    priorHistory: repeatMatches.length,
    photos: [],
    activity: [
      {
        id: createId("act"),
        type: "Record Created",
        by: "Demo User",
        timestamp: now.replace("T", " "),
        detail: `Vehicle ${input.plate || input.vin || "new record"} created at ${input.propertyName}, ${input.zone}.`
      }
    ]
  };

  await writeVehicles([newRecord, ...vehicles]);
  return newRecord;
}

export async function updateVehicleRecord(
  id: string,
  input: {
    currentStatus: TowStatus;
    notes: string;
  }
) {
  const vehicles = await readVehicles();
  const index = vehicles.findIndex((vehicle) => vehicle.id === id);

  if (index === -1) {
    return null;
  }

  const current = vehicles[index];
  const now = new Date().toISOString().slice(0, 16);
  const activity = [...current.activity];

  if (current.currentStatus !== input.currentStatus) {
    activity.unshift({
      id: createId("act"),
      type: "Status Change",
      by: "Demo User",
      timestamp: now.replace("T", " "),
      detail: `${current.currentStatus} → ${input.currentStatus}`
    });
  }

  if (input.notes.trim() && input.notes.trim() !== current.notes.trim()) {
    activity.unshift({
      id: createId("act"),
      type: "Note",
      by: "Demo User",
      timestamp: now.replace("T", " "),
      detail: input.notes.trim()
    });
  }

  const updated: VehicleRecord = {
    ...current,
    currentStatus: input.currentStatus,
    notes: input.notes,
    lastUpdatedBy: "Demo User",
    dateTimeWarningPlaced:
      input.currentStatus === "Warning Placed" && !current.dateTimeWarningPlaced
        ? now
        : current.dateTimeWarningPlaced,
    dateTimeMarkedForTow:
      input.currentStatus === "Marked for Tow" && !current.dateTimeMarkedForTow
        ? now
        : current.dateTimeMarkedForTow,
    dateTimeTowRequested:
      input.currentStatus === "Tow Requested" && !current.dateTimeTowRequested
        ? now
        : current.dateTimeTowRequested,
    dateTimeTowCompleted:
      input.currentStatus === "Towed" && !current.dateTimeTowCompleted
        ? now
        : current.dateTimeTowCompleted,
    towReferenceNumber:
      input.currentStatus === "Tow Requested" && !current.towReferenceNumber
        ? createId("REQ")
        : current.towReferenceNumber,
    activity
  };

  vehicles[index] = updated;
  await writeVehicles(vehicles);
  return updated;
}
