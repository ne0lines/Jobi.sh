import type { Metadata, Viewport } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Bricolage_Grotesque, Inter, Geist } from "next/font/google";
import "./globals.css";
import { AppNavigationShell } from "@/components/navigation/bottom-nav";
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
          <AppNavigationShell>{children}</AppNavigationShell>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
