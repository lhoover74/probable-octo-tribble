"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPropertyInD1, createUserInD1 } from "@/lib/server/d1-management-store";

async function requireAdmin() {
  const cookieStore = await cookies();
  const role = cookieStore.get("demo_role")?.value;

  if (role !== "Admin") {
    redirect("/");
  }
}

export async function createCloudflareUserAction(formData: FormData) {
  await requireAdmin();

  await createUserInD1({
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    role: String(formData.get("role") || "Viewer").trim(),
    property: String(formData.get("property") || "").trim(),
    status: String(formData.get("status") || "Active").trim()
  });

  revalidatePath("/users");
  revalidatePath("/cf/admin/users");
  redirect("/cf/admin/users?status=created");
}

export async function createCloudflarePropertyAction(formData: FormData) {
  await requireAdmin();

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
  redirect("/cf/admin/properties?status=created");
}
