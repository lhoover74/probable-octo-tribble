"use server";

import { redirect } from "next/navigation";
import { authenticateUser, createSessionForUser, hasAnyAuthCredentials, setupInitialAdmin } from "@/lib/server/auth-store";
import { destroyCurrentSession, setSessionCookie } from "@/lib/auth";

export async function setupInitialAdminAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (password.length < 10) {
    redirect("/?error=password_too_short");
  }

  if (password !== confirmPassword) {
    redirect("/?error=password_mismatch");
  }

  if (await hasAnyAuthCredentials()) {
    redirect("/?error=setup_disabled");
  }

  const user = await setupInitialAdmin({ name, email, password });
  const session = await createSessionForUser({ userId: user.id });
  await setSessionCookie(session.token, session.expiresAt);
  redirect("/dashboard?welcome=1");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const user = await authenticateUser(email, password);

  if (!user) {
    redirect("/?error=invalid_credentials");
  }

  const session = await createSessionForUser({ userId: user.id });
  await setSessionCookie(session.token, session.expiresAt);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/");
}
