"use server";

import { redirect } from "next/navigation";
import { requireRole, requireSession, setSessionCookie, destroyCurrentSession } from "@/lib/auth";
import {
  acceptInvite,
  authenticateUser,
  createInvite,
  createPasswordResetToken,
  createSecurityAuditLog,
  createSessionForUser,
  hasAnyAuthCredentials,
  consumePasswordResetToken,
  revokeOtherSessionsForUser,
  setupInitialAdmin
} from "@/lib/server/auth-store";

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
    await createSecurityAuditLog({
      actorEmail: email,
      action: "auth.login_failed",
      targetType: "session",
      detail: `Failed login attempt for ${email}.`
    });
    redirect("/?error=invalid_credentials");
  }

  const session = await createSessionForUser({ userId: user.id });
  await setSessionCookie(session.token, session.expiresAt);
  await createSecurityAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action: "auth.login_succeeded",
    targetType: "session",
    targetId: session.sessionId,
    detail: `User ${user.email} signed in.`
  });
  redirect("/dashboard");
}

export async function logoutAction() {
  const session = await requireSession();
  await createSecurityAuditLog({
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    action: "auth.logout",
    targetType: "session",
    targetId: session.sessionId,
    detail: `User ${session.user.email} signed out.`
  });
  await destroyCurrentSession();
  redirect("/");
}

export async function createInviteAction(formData: FormData) {
  const session = await requireRole(["Admin"]);
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "Viewer").trim();
  const property = String(formData.get("property") || "").trim();

  const invite = await createInvite({
    email,
    role,
    property,
    invitedByUserId: session.user.id,
    invitedByEmail: session.user.email
  });

  redirect(`/cf/admin/access?created=1&email=${encodeURIComponent(email)}&token=${encodeURIComponent(invite.token)}`);
}

export async function acceptInviteAction(formData: FormData) {
  const token = String(formData.get("token") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!token) {
    redirect("/accept-invite?error=missing_token");
  }
  if (password.length < 10) {
    redirect(`/accept-invite?token=${encodeURIComponent(token)}&error=password_too_short`);
  }
  if (password !== confirmPassword) {
    redirect(`/accept-invite?token=${encodeURIComponent(token)}&error=password_mismatch`);
  }

  const user = await acceptInvite({ token, name, password });
  if (!user) {
    redirect("/accept-invite?error=invalid_or_expired");
  }

  const session = await createSessionForUser({ userId: user.id });
  await setSessionCookie(session.token, session.expiresAt);
  redirect("/dashboard?invited=1");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const reset = await createPasswordResetToken(email);

  if (!reset) {
    redirect(`/reset-password?requested=1&email=${encodeURIComponent(email)}`);
  }

  redirect(`/reset-password?requested=1&email=${encodeURIComponent(email)}&token=${encodeURIComponent(reset.token)}`);
}

export async function completePasswordResetAction(formData: FormData) {
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!token) {
    redirect("/reset-password?error=missing_token");
  }
  if (password.length < 10) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=password_too_short`);
  }
  if (password !== confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=password_mismatch`);
  }

  const user = await consumePasswordResetToken({ token, password });
  if (!user) {
    redirect("/reset-password?error=invalid_or_expired");
  }

  redirect("/?reset=1");
}

export async function revokeOtherSessionsAction() {
  const session = await requireSession();
  const count = await revokeOtherSessionsForUser(session.user.id, session.sessionId);
  await createSecurityAuditLog({
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    action: "auth.sessions_revoked",
    targetType: "session",
    targetId: session.sessionId,
    detail: `Revoked ${count} other active session(s).`
  });
  redirect(`/cf/account/security?status=revoked&count=${count}`);
}
