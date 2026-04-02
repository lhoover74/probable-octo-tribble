"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireVehicleWriteRole } from "@/lib/auth";
import { createVehicleInD1, updateVehicleInD1 } from "@/lib/server/d1-vehicle-store";
import type { TowStatus } from "@/lib/types";

export async function createCloudflareVehicleAction(formData: FormData) {
  const session = await requireVehicleWriteRole();
  const record = await createVehicleInD1({
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
    towingCompany: String(formData.get("towingCompany") || "").trim(),
    actorName: session.user.name
  });

  revalidatePath("/cf/dashboard");
  revalidatePath("/cf/vehicles");
  revalidatePath("/cf/tow-requests");
  redirect(`/cf/vehicles/${record.id}`);
}

export async function updateCloudflareVehicleAction(id: string, formData: FormData) {
  const session = await requireVehicleWriteRole();
  const updated = await updateVehicleInD1(id, {
    currentStatus: String(formData.get("currentStatus") || "Observed").trim() as TowStatus,
    notes: String(formData.get("notes") || "").trim(),
    actorName: session.user.name
  });

  if (!updated) {
    redirect("/cf/vehicles");
  }

  revalidatePath("/cf/dashboard");
  revalidatePath("/cf/vehicles");
  revalidatePath(`/cf/vehicles/${id}`);
  revalidatePath("/cf/tow-requests");
  redirect(`/cf/vehicles/${id}`);
}
