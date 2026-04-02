"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { resetDemoDataInD1, seedDemoDataInD1 } from "@/lib/server/d1-admin-store";

export async function seedCloudflareDemoDataAction() {
  await requireRole(["Admin"]);
  await seedDemoDataInD1();
  revalidatePath("/dashboard");
  revalidatePath("/vehicles");
  revalidatePath("/tow-requests");
  revalidatePath("/cf/dashboard");
  revalidatePath("/cf/vehicles");
  revalidatePath("/cf/tow-requests");
  redirect("/cf/admin/data?status=seeded");
}

export async function resetCloudflareDemoDataAction() {
  await requireRole(["Admin"]);
  await resetDemoDataInD1();
  revalidatePath("/dashboard");
  revalidatePath("/vehicles");
  revalidatePath("/tow-requests");
  revalidatePath("/cf/dashboard");
  revalidatePath("/cf/vehicles");
  revalidatePath("/cf/tow-requests");
  redirect("/cf/admin/data?status=reset");
}
