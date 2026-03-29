"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createVehicleInSqlite, updateVehicleInSqlite } from "@/lib/server/sqlite-vehicle-store";
import type { TowStatus } from "@/lib/types";

export async function createSqliteVehicleAction(formData: FormData) {
  const record = createVehicleInSqlite({
    plate: String(formData.get("plate") || "").trim(),
    plateState: String(formData.get("plateState") || "IL").trim(),
    vin: String(formData.get("vin") || "").trim(),
    make: String(formData.get("make") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    year: String(formData.get("year") || "").trim(),
    color: String(formData.get("color") || "").trim(),
    bodyStyle: String(formData.get("bodyStyle") || "").trim(),
    propertyName: String(formData.get("propertyName") || "").trim(),
    zone: String(formData.get("zone") || "").trim(),
    exactLocation: String(formData.get("exactLocation") || "").trim(),
    unitAssociation: String(formData.get("unitAssociation") || "").trim(),
    towReason: String(formData.get("towReason") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    currentStatus: String(formData.get("currentStatus") || "Observed").trim() as TowStatus,
    towingCompany: String(formData.get("towingCompany") || "").trim()
  });

  revalidatePath("/db/dashboard");
  revalidatePath("/db/vehicles");
  revalidatePath("/db/tow-requests");
  redirect(`/db/vehicles/${record.id}`);
}

export async function updateSqliteVehicleAction(id: string, formData: FormData) {
  const updated = updateVehicleInSqlite(id, {
    currentStatus: String(formData.get("currentStatus") || "Observed").trim() as TowStatus,
    notes: String(formData.get("notes") || "").trim()
  });

  if (!updated) {
    redirect("/db/vehicles");
  }

  revalidatePath("/db/dashboard");
  revalidatePath("/db/vehicles");
  revalidatePath(`/db/vehicles/${id}`);
  revalidatePath("/db/tow-requests");
  redirect(`/db/vehicles/${id}`);
}
