"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createPropertyInD1, createTowingCompanyInD1, createUserInD1 } from "@/lib/server/d1-management-store";

export async function createCloudflareUserAction(formData: FormData) {
  await requireRole(["Admin"]);

  await createUserInD1({
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    role: String(formData.get("role") || "Viewer").trim(),
    property: String(formData.get("property") || "").trim(),
    status: String(formData.get("status") || "Active").trim(),
    password: String(formData.get("password") || "").trim()
  });

  revalidatePath("/users");
  revalidatePath("/cf/admin/users");
  redirect("/cf/admin/users?status=created");
}

export async function createCloudflarePropertyAction(formData: FormData) {
  await requireRole(["Admin"]);

  await createPropertyInD1({
    name: String(formData.get("name") || "").trim(),
    code: String(formData.get("code") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    zonesCsv: String(formData.get("zonesCsv") || "").trim(),
    towingRules: String(formData.get("towingRules") || "").trim(),
    defaultTowCompany: String(formData.get("defaultTowCompany") || "").trim(),
    notes: String(formData.get("notes") || "").trim()
  });

  revalidatePath("/properties");
  revalidatePath("/cf/admin/properties");
  revalidatePath("/vehicles/new");
  revalidatePath("/cf/vehicles/new");
  redirect("/cf/admin/properties?status=created");
}

export async function createCloudflareTowingCompanyAction(formData: FormData) {
  await requireRole(["Admin"]);

  await createTowingCompanyInD1({
    companyName: String(formData.get("companyName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    dispatchContact: String(formData.get("dispatchContact") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    active: String(formData.get("active") || "on") === "on"
  });

  revalidatePath("/cf/admin/towing-companies");
  revalidatePath("/cf/admin/properties");
  revalidatePath("/vehicles/new");
  revalidatePath("/cf/vehicles/new");
  redirect("/cf/admin/towing-companies?status=created");
}
