import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { deleteSessionByToken, getSessionByToken, type AuthSessionUser } from "@/lib/server/auth-store";

const SESSION_COOKIE = "tt_session";
const VEHICLE_WRITE_ROLES = ["Admin", "Manager", "Officer/Staff"];

export type AppSession = {
  sessionId: string;
  user: AuthSessionUser;
  expiresAt: string;
};

function parseCookieValue(cookieHeader: string | null, cookieName: string) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${cookieName}=`));
  return match ? decodeURIComponent(match.slice(cookieName.length + 1)) : null;
}

export async function setSessionCookie(token: string, expiresAt: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt)
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getSessionByToken(token);
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/");
  }
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireSession();
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}

export function canWriteVehicles(role: string) {
  return VEHICLE_WRITE_ROLES.includes(role);
}

export async function requireVehicleWriteRole() {
  return requireRole([...VEHICLE_WRITE_ROLES]);
}

export async function getSessionFromRequest(request: Request): Promise<AppSession | null> {
  const token = parseCookieValue(request.headers.get("cookie"), SESSION_COOKIE);
  if (!token) return null;
  return getSessionByToken(token);
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await deleteSessionByToken(token);
  }
  await clearSessionCookie();
}
