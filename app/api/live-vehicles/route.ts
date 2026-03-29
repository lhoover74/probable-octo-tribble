import { NextResponse } from "next/server";
import { createVehicleRecord, readVehicles } from "@/lib/server/vehicle-store";
import type { TowStatus } from "@/lib/types";

export async function GET() {
  const vehicles = await readVehicles();
  return NextResponse.json({ ok: true, count: vehicles.length, vehicles });
}

export async function POST(request: Request) {
  const body = await request.json();
  const record = await createVehicleRecord({
    plate: String(body.plate || "").trim(),
    plateState: String(body.plateState || "IL").trim(),
    vin: String(body.vin || "").trim(),
    make: String(body.make || "").trim(),
    model: String(body.model || "").trim(),
    year: String(body.year || "").trim(),
    color: String(body.color || "").trim(),
    bodyStyle: String(body.bodyStyle || "").trim(),
    propertyName: String(body.propertyName || "").trim(),
    zone: String(body.zone || "").trim(),
    exactLocation: String(body.exactLocation || "").trim(),
    unitAssociation: String(body.unitAssociation || "").trim(),
    towReason: String(body.towReason || "").trim(),
    notes: String(body.notes || "").trim(),
    currentStatus: String(body.currentStatus || "Observed").trim() as TowStatus,
    towingCompany: String(body.towingCompany || "").trim()
  });

  return NextResponse.json({ ok: true, vehicle: record }, { status: 201 });
}
