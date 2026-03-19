import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest, USER_ID_HEADER_NAME } from "@/server/auth-session";

export async function middleware(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/auth");
  const isApiRoute = pathname.startsWith("/api");
  const isAuthApiRoute = pathname.startsWith("/api/auth");

  if (!userId && !isAuthPage && !isApiRoute) {
    const authUrl = request.nextUrl.clone();

    authUrl.pathname = "/auth";
    authUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(authUrl);
  }

  if (userId && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!userId && isAuthApiRoute) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);

  if (userId) {
    requestHeaders.set(USER_ID_HEADER_NAME, userId);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [String.raw`/((?!_next/static|_next/image|favicon.ico|.*\..*).*)`],
};