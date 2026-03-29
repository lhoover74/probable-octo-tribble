import { NextResponse } from "next/server";
import { readVehicleFromD1, updateVehicleInD1 } from "@/lib/server/d1-vehicle-store";
import type { TowStatus } from "@/lib/types";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const vehicle = await readVehicleFromD1(id);

  if (!vehicle) {
    return NextResponse.json({ ok: false, message: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, vehicle });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const vehicle = await updateVehicleInD1(id, {
    currentStatus: String(body.currentStatus || "Observed").trim() as TowStatus,
    notes: String(body.notes || "").trim()
  });

  if (!vehicle) {
    return NextResponse.json({ ok: false, message: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, vehicle });
}
