import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function getLegacyRoutePath(pathname: string): string | null {
  if (/^\/foretag(?=\/|$)/.test(pathname)) {
    return pathname.replace(/^\/foretag(?=\/|$)/, "/company");
  }

  if (/^\/konto(?=\/|$)/.test(pathname)) {
    return pathname.replace(/^\/konto(?=\/|$)/, "/account");
  }

  if (/^\/jobb(?=\/|$)/.test(pathname)) {
    return pathname.replace(/^\/jobb(?=\/|$)/, "/jobs");
  }

  if (/^\/aktivitetsrapport(?=\/|$)/.test(pathname)) {
    return pathname.replace(/^\/aktivitetsrapport(?=\/|$)/, "/activity-report");
  }

  return null;
}

const isPublicRoute = createRouteMatcher([
  "/",
  "/auth(.*)",
  "/landing(.*)",
  "/company(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/gdpr(.*)",
]);

// Routes that don't require a DB profile (auth + the profile creation flow itself)
const isProfileExempt = createRouteMatcher([
  "/",
  "/auth(.*)",
  "/landing(.*)",
  "/company(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/gdpr(.*)",
  "/account/create-profile(.*)",
  "/api/user",
]);

export default clerkMiddleware(async (auth, req) => {
  const legacyRoutePath = getLegacyRoutePath(req.nextUrl.pathname);

  if (legacyRoutePath) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = legacyRoutePath;
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (!isProfileExempt(req)) {
    const { userId } = await auth();

    if (userId) {
      const res = await fetch(new URL("/api/user", req.url), {
        headers: { cookie: req.headers.get("cookie") ?? "" },
        redirect: "manual",
      });

      if (!res.ok) {
        return NextResponse.redirect(new URL("/account/create-profile", req.url));
      }
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
