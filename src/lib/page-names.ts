type RouteEntry = { pattern: RegExp | string; name: string };

const ROUTES: RouteEntry[] = [
  { pattern: "/", name: "Landing" },
  { pattern: "/landing", name: "Landing" },
  { pattern: "/dashboard", name: "Dashboard" },
  { pattern: "/jobb/new", name: "New Application" },
  { pattern: /^\/jobb\/[^/]+$/, name: "Application Detail" },
  { pattern: "/konto/create-profile", name: "Create Profile" },
  { pattern: "/konto", name: "Account" },
  { pattern: "/aktivitetsrapport", name: "Activity Report" },
  { pattern: "/report", name: "Report" },
];

export function getPageName(pathname: string): string {
  for (const { pattern, name } of ROUTES) {
    if (typeof pattern === "string" ? pathname === pattern : pattern.test(pathname)) {
      return name;
    }
  }
  return pathname;
}
