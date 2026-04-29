import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "hamrobichar.com";
const LEGACY_HOSTS = new Set(["hamrobichar.app", "www.hamrobichar.app", "www.hamrobichar.com"]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();

  if (!host) {
    return NextResponse.next();
  }

  if (LEGACY_HOSTS.has(host)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    redirectUrl.host = CANONICAL_HOST;

    return NextResponse.redirect(redirectUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
