import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, Inter, Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PostHogProvider>
      <html
        lang="sv"
        className={cn("font-sans", geist.variable)}
        style={{ colorScheme: DEFAULT_THEME_PREFERENCE }}
        suppressHydrationWarning
      >
        <body
          className={`${bricolageGrotesque.variable} ${inter.variable} min-h-svh antialiased p-3`}
        >
          <Script id="theme-preference-init" strategy="beforeInteractive">
            {themeInitializationScript}
          </Script>
          <PostHogServerPageView />
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <ClerkProvider>
            <ThemeProvider>
              <QueryProvider>
                <RegisterServiceWorker />
                <AppNavigationShell>{children}</AppNavigationShell>
                <Toaster />
                <CookieNotice />
              </QueryProvider>
            </ThemeProvider>
          </ClerkProvider>
        </body>
      </html>
    </PostHogProvider>
  );
}
