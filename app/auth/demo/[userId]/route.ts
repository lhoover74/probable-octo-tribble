import { NextResponse } from "next/server";
import { users } from "@/lib/mock-data";

export async function GET(request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("demo_user_id", user.id, { path: "/", httpOnly: true, sameSite: "lax" });
  response.cookies.set("demo_user_name", user.name, { path: "/", httpOnly: true, sameSite: "lax" });
  response.cookies.set("demo_role", user.role, { path: "/", httpOnly: true, sameSite: "lax" });

  return response;
}
