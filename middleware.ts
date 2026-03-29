import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function buildTarget(pathname: string) {
  if (pathname === "/dashboard") return "/live/dashboard";
  if (pathname === "/vehicles") return "/live/vehicles";
  if (pathname === "/vehicles/new") return "/live/vehicles/new";
  if (pathname === "/tow-requests") return "/live/tow-requests";
  if (pathname === "/api/vehicles") return "/api/live-vehicles";

  const vehicleMatch = pathname.match(/^\/vehicles\/([^/]+)$/);
  if (vehicleMatch) {
    return `/live/vehicles/${vehicleMatch[1]}`;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const target = buildTarget(request.nextUrl.pathname);

  if (!target) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/dashboard", "/vehicles", "/vehicles/new", "/vehicles/:path*", "/tow-requests", "/api/vehicles"]
};
