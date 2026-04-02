import { NextResponse } from "next/server";
import { canWriteVehicles, getSessionFromRequest } from "@/lib/auth";
import { createVehicleInD1, readVehiclesFromD1 } from "@/lib/server/d1-vehicle-store";
import type { TowStatus } from "@/lib/types";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const vehicles = await readVehiclesFromD1();
  return NextResponse.json({ ok: true, count: vehicles.length, vehicles });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (!canWriteVehicles(session.user.role)) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const vehicle = await createVehicleInD1({
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
    towingCompany: String(body.towingCompany || "").trim(),
    actorName: session.user.name
  });

  return NextResponse.json({ ok: true, vehicle }, { status: 201 });
}
