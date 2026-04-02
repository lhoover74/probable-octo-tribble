import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function buildTarget(pathname: string) {
  if (pathname === "/dashboard") return "/cf/dashboard";
  if (pathname === "/vehicles") return "/cf/vehicles";
  if (pathname === "/vehicles/new") return "/cf/vehicles/new";
  if (pathname === "/tow-requests") return "/cf/tow-requests";
  if (pathname === "/users") return "/cf/admin/users";
  if (pathname === "/properties") return "/cf/admin/properties";
  if (pathname === "/settings") return "/cf/admin/towing-companies";
  if (pathname === "/api/vehicles") return "/api/cf-vehicles";

  const vehicleMatch = pathname.match(/^\/vehicles\/([^/]+)$/);
  if (vehicleMatch) {
    return `/cf/vehicles/${vehicleMatch[1]}`;
  }

  const apiVehicleMatch = pathname.match(/^\/api\/vehicles\/([^/]+)$/);
  if (apiVehicleMatch) {
    return `/api/cf-vehicles/${apiVehicleMatch[1]}`;
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
    "/users",
    "/properties",
    "/settings",
    "/api/vehicles",
    "/api/vehicles/:path*"
  ]
};
