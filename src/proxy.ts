import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/auth(.*)",
  "/landing(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/gdpr(.*)",
]);

// Routes that don't require a DB profile (auth + the profile creation flow itself)
const isProfileExempt = createRouteMatcher([
  "/",
  "/auth(.*)",
  "/landing(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/gdpr(.*)",
  "/konto/create-profile(.*)",
  "/api/user",
]);

export default clerkMiddleware(async (auth, req) => {
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
        return NextResponse.redirect(new URL("/konto/create-profile", req.url));
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
