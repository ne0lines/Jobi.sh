import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, Inter, Geist } from "next/font/google";
import "./globals.css";
import { AppNavigationShell } from "@/components/navigation/bottom-nav";
import { QueryProvider } from "@/components/providers/query-provider";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

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
    <html lang="sv" className={cn("font-sans", geist.variable)}>
      <body
        className={`${bricolageGrotesque.variable} ${inter.variable} min-h-svh antialiased`}
      >
        <ClerkProvider>
          <QueryProvider>
            <RegisterServiceWorker />
            <AppNavigationShell>{children}</AppNavigationShell>
            <Toaster />
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
