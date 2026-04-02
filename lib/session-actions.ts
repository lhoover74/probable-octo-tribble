"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function genericLoginAction(formData: FormData) {
  const userName = String(formData.get("userName") || "Admin User").trim();
  const userEmail = String(formData.get("userEmail") || "").trim();
  const role = String(formData.get("role") || "Admin").trim();

  const cookieStore = await cookies();
  cookieStore.set("demo_user_id", `manual-${Date.now()}`, { path: "/", httpOnly: true, sameSite: "lax" });
  cookieStore.set("demo_user_name", userName, { path: "/", httpOnly: true, sameSite: "lax" });
  cookieStore.set("demo_user_email", userEmail, { path: "/", httpOnly: true, sameSite: "lax" });
  cookieStore.set("demo_role", role, { path: "/", httpOnly: true, sameSite: "lax" });

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("demo_user_id");
  cookieStore.delete("demo_user_name");
  cookieStore.delete("demo_user_email");
  cookieStore.delete("demo_role");
  redirect("/");
}
