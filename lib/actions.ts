"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createVehicleRecord, updateVehicleRecord } from "@/lib/server/vehicle-store";
import type { TowStatus } from "@/lib/types";

export async function createVehicleAction(formData: FormData) {
  const record = await createVehicleRecord({
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

  revalidatePath("/dashboard");
  revalidatePath("/vehicles");
  revalidatePath("/tow-requests");
  revalidatePath("/live/dashboard");
  revalidatePath("/live/vehicles");
  redirect(`/live/vehicles/${record.id}`);
}

export async function updateVehicleAction(id: string, formData: FormData) {
  const updated = await updateVehicleRecord(id, {
    currentStatus: String(formData.get("currentStatus") || "Observed").trim() as TowStatus,
    notes: String(formData.get("notes") || "").trim()
  });

  if (!updated) {
    redirect("/live/vehicles");
  }

  revalidatePath("/dashboard");
  revalidatePath("/vehicles");
  revalidatePath(`/live/vehicles/${id}`);
  revalidatePath("/tow-requests");
  revalidatePath("/live/dashboard");
  revalidatePath("/live/vehicles");
  redirect(`/live/vehicles/${id}`);
}
