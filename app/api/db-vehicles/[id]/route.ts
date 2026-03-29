import { NextResponse } from "next/server";
import { readVehicleFromSqlite, updateVehicleInSqlite } from "@/lib/server/sqlite-vehicle-store";
import type { TowStatus } from "@/lib/types";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const vehicle = readVehicleFromSqlite(id);

  if (!vehicle) {
    return NextResponse.json({ ok: false, message: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, vehicle });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const vehicle = updateVehicleInSqlite(id, {
    currentStatus: String(body.currentStatus || "Observed").trim() as TowStatus,
    notes: String(body.notes || "").trim()
  });

  if (!vehicle) {
    return NextResponse.json({ ok: false, message: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, vehicle });
}
