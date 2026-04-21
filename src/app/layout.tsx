import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, Inter, Geist, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Script from "next/script";
import "./globals.css";
import { UserRole } from "@/app/generated/prisma/enums";
import { AppNavigationShell } from "@/components/navigation/bottom-nav";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PostHogPageView } from "@/components/analytics/posthog-page-view";
import { PostHogServerPageView } from "@/components/analytics/posthog-server-page-view";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { Toaster } from "@/components/ui/sonner";
import { CookieNotice } from "@/components/gdpr/cookie-notice";
import {
  DEFAULT_THEME_PREFERENCE,
  themeInitializationScript,
} from "@/lib/theme";
import { getCurrentDbUser } from "@/lib/auth/current-db-user";
import { hasRmAccess } from "@/lib/rm-access";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Jobi.sh - Lite mindre jobbigt. Mer jobi.sh",
  description: "Lite mindre jobbigt. Mer jobi.sh",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jobi.sh",
  },
  icons: {
    apple: "/icons/Assets.xcassets/AppIcon.appiconset/180.png",
    icon: [
      {
        url: "/icons/Assets.xcassets/AppIcon.appiconset/32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/Assets.xcassets/AppIcon.appiconset/192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#6e33eb",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const navUser = await getCurrentDbUser({
    role: true,
    rmOrganizationId: true,
  });
  const canAccessAdmin = navUser?.role === UserRole.admin;
  const canAccessRm = hasRmAccess(navUser);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={cn("font-sans", geist.variable, notoSansArabic.variable)}
      style={{ colorScheme: DEFAULT_THEME_PREFERENCE }}
      suppressHydrationWarning
    >
      <body
        className={`${bricolageGrotesque.variable} ${inter.variable} ${notoSansArabic.variable} min-h-svh antialiased p-3 md:p-4`}
      >
        <Script id="theme-preference-init" strategy="beforeInteractive">
          {themeInitializationScript}
        </Script>
        <PostHogProvider>
          <PostHogServerPageView />
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ClerkProvider>
              <QueryProvider>
                <ThemeProvider>
                  <RegisterServiceWorker />
                  <AppNavigationShell
                    canAccessAdmin={canAccessAdmin}
                    canAccessRm={canAccessRm}
                  >
                    {children}
                  </AppNavigationShell>
                  <Toaster />
                  <CookieNotice />
                  <SpeedInsights />
                </ThemeProvider>
              </QueryProvider>
            </ClerkProvider>
          </NextIntlClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
