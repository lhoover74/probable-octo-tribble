import { NextResponse } from "next/server";
import { vehicles } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    ok: true,
    count: vehicles.length,
    vehicles
  });
}
