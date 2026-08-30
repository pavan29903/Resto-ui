import { NextResponse, type NextRequest } from "next/server";

/**
 * Subdomain routing.
 *
 * Each restaurant answers on its own address — bluetokai.menusnap.in — which
 * reads like the cafe's own site rather than a row in ours. Internally those
 * requests are still served by /r/[slug]; this rewrite is what joins the two.
 *
 * Rewrite, not redirect: the diner keeps seeing the restaurant's address in
 * the URL bar, which is the whole point.
 */

/** Hosts that are ours, never a restaurant's. Mirrors RESERVED_SLUGS in
 *  resto-api/app/modules/restaurants/service.py — keep the two in step. */
const RESERVED = new Set([
  "www", "api", "app", "admin", "dashboard", "mail", "smtp", "ftp", "cdn",
  "static", "assets", "blog", "help", "support", "status", "docs", "menu",
  "menus", "auth", "login", "signup", "account", "billing", "test", "staging",
  "dev", "demo", "internal", "root", "system",
]);

function subdomainOf(host: string): string | null {
  // Strip the port: "bluetokai.localhost:3000" -> "bluetokai.localhost"
  const hostname = host.split(":")[0].toLowerCase();

  // Local development: <slug>.localhost resolves without any DNS setup, so the
  // subdomain flow is testable before a domain is bought.
  if (hostname.endsWith(".localhost")) {
    const label = hostname.slice(0, -".localhost".length);
    return label && !label.includes(".") ? label : null;
  }

  const root = process.env.NEXT_PUBLIC_MENU_DOMAIN?.toLowerCase();
  if (!root || hostname === root) return null;
  if (!hostname.endsWith(`.${root}`)) return null;

  const label = hostname.slice(0, -(root.length + 1));
  // Only a single label: "a.b.menusnap.in" is not a restaurant.
  return label && !label.includes(".") ? label : null;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const slug = subdomainOf(host);

  if (!slug || RESERVED.has(slug)) return NextResponse.next();

  const url = request.nextUrl.clone();
  // Already the menu route (or an internal asset) — leave it alone.
  if (url.pathname.startsWith("/r/")) return NextResponse.next();

  url.pathname = `/r/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except Next internals, the API proxy, and static files.
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};
