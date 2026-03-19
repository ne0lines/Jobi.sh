import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApplyTrack",
  description: "Mobile-first jobbspårning byggd med Next.js",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ApplyTrack",
  },
  icons: {
    apple: "/icons/Assets.xcassets/AppIcon.appiconset/180.png",
    icon: "/icons/Assets.xcassets/AppIcon.appiconset/196.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6e33eb",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${bricolageGrotesque.variable} ${inter.variable} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
