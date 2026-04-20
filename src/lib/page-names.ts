type RouteEntry = { pattern: RegExp | string; name: string };

const ROUTES: RouteEntry[] = [
  { pattern: "/", name: "Landing" },
  { pattern: "/landing", name: "Landing" },
  { pattern: "/company", name: "Company" },
  { pattern: "/dashboard", name: "Dashboard" },
  { pattern: "/jobs/new", name: "New Application" },
  { pattern: /^\/jobs\/[^/]+$/, name: "Application Detail" },
  { pattern: "/account/create-profile", name: "Create Profile" },
  { pattern: "/account", name: "Account" },
  { pattern: "/activity-report", name: "Activity Report" },
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
