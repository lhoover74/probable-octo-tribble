"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resetDemoDataInD1, seedDemoDataInD1 } from "@/lib/server/d1-admin-store";

async function requireAdmin() {
  const cookieStore = await cookies();
  const role = cookieStore.get("demo_role")?.value;

  if (role !== "Admin") {
    redirect("/");
  }
}

export async function seedCloudflareDemoDataAction() {
  await requireAdmin();
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
  await requireAdmin();
  await resetDemoDataInD1();
  revalidatePath("/dashboard");
  revalidatePath("/vehicles");
  revalidatePath("/tow-requests");
  revalidatePath("/cf/dashboard");
  revalidatePath("/cf/vehicles");
  revalidatePath("/cf/tow-requests");
  redirect("/cf/admin/data?status=reset");
}
