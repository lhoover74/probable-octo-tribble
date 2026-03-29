import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function buildTarget(pathname: string) {
  if (pathname === "/dashboard") return "/db/dashboard";
  if (pathname === "/vehicles") return "/db/vehicles";
  if (pathname === "/vehicles/new") return "/db/vehicles/new";
  if (pathname === "/tow-requests") return "/db/tow-requests";
  if (pathname === "/api/vehicles") return "/api/db-vehicles";

  const vehicleMatch = pathname.match(/^\/vehicles\/([^/]+)$/);
  if (vehicleMatch) {
    return `/db/vehicles/${vehicleMatch[1]}`;
  }

  const apiVehicleMatch = pathname.match(/^\/api\/vehicles\/([^/]+)$/);
  if (apiVehicleMatch) {
    return `/api/db-vehicles/${apiVehicleMatch[1]}`;
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
  matcher: [
    "/dashboard",
    "/vehicles",
    "/vehicles/new",
    "/vehicles/:path*",
    "/tow-requests",
    "/api/vehicles",
    "/api/vehicles/:path*"
  ]
};
