"use client";

import { LogoutBtn } from "@/components/auth/logout-btn";
import { Btn } from "@/components/ui/btn";
import { cn } from "@/lib/utils";
import { BriefcaseBusiness, House, Plus, Puzzle, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    icon: House,
    label: "Översikt",
    match: (pathname: string) => pathname === "/",
  },
  {
    href: "/jobb",
    icon: BriefcaseBusiness,
    label: "Sökta jobb",
    match: (pathname: string) => pathname.startsWith("/jobb"),
  },
  {
    href: "/konto",
    icon: UserRound,
    label: "Profil",
    match: (pathname: string) => pathname.startsWith("/konto"),
  },
  {
    href: "/aktivitetsrapport",
    iconSrc: "/ams-logo.svg",
    label: "Aktivitetsrapportera",
    match: (pathname: string) => pathname.startsWith("/aktivitetsrapport"),
  },
] as const;

const navShellClassName =
  "rounded-2xl border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(242,245,251,0.68))] shadow-[0_10px_24px_rgba(17,23,40,0.10),0_28px_70px_rgba(17,23,40,0.18)] ring-1 ring-black/6 backdrop-blur-xl supports-backdrop-filter:bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(242,245,251,0.42))] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.94),rgba(15,15,18,0.9))] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28),0_28px_70px_rgba(0,0,0,0.46)] dark:ring-white/8 dark:supports-backdrop-filter:bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(15,15,18,0.62))]";

const navItemInactiveClassName =
  "text-app-ink/72 hover:bg-white/34 hover:text-app-ink dark:text-white/62 dark:hover:bg-white/6 dark:hover:text-white";

const navItemActiveClassName =
  "border border-white/70 bg-white/76 text-app-primary shadow-[0_8px_18px_rgba(17,23,40,0.10)] dark:border-white/10 dark:bg-white/7 dark:text-app-primary dark:shadow-[0_10px_24px_rgba(0,0,0,0.34)]";

const activityReportActiveClassName =
  "border border-[#00005A] bg-[#00005A] text-white shadow-[0_8px_18px_rgba(0,0,90,0.24)] dark:border-white/10 dark:bg-white/7 dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.34)]";

function getNavItemClasses(isActive: boolean, isActivityReport: boolean) {
  if (isActivityReport) {
    return isActive ? activityReportActiveClassName : navItemInactiveClassName;
  }

  return isActive ? navItemActiveClassName : navItemInactiveClassName;
}

function getNavIconClasses(isActive: boolean, isActivityReport: boolean) {
  if (isActive && isActivityReport) {
    return "text-white";
  }

  if (isActive) {
    return "text-app-primary";
  }

  return "text-app-ink/78 dark:text-white/70";
}

type AppNavigationShellProps = {
  children: React.ReactNode;
};

export function AppNavigationShell({
  children,
}: Readonly<AppNavigationShellProps>) {
  const pathname = usePathname();
  const hideNavigation =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/konto/create-profile") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/gdpr");
  const showNavigation = !hideNavigation;

  return (
    <>
      {showNavigation ? (
        <div className="mx-auto w-full max-w-270 md:px-4">
          <div className="md:flex md:items-start md:gap-8">
            <aside className="hidden md:block md:w-72 md:shrink-0 md:py-4">
              <div className={cn(navShellClassName, "fixed top-4 flex h-[calc(100svh-2rem)] w-72 flex-col p-4")}>
                <Link
                  href="/"
                  className="block w-full rounded-2xl px-3 py-2 transition hover:bg-white/30 dark:hover:bg-white/4"
                >
                  <h1 className="w-full text-[3.5rem] leading-none tracking-[-0.04em]">
                    Jobi<span className="text-app-primary">.sh</span>
                  </h1>
                </Link>

                <nav aria-label="Primär navigation" className="mt-8 flex flex-col gap-2">
                  {navItems.map((item) => {
                    const isActive = item.match(pathname);
                    const isActivityReport = item.href === "/aktivitetsrapport";

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-[1.35rem] px-4 py-3 text-sm font-medium tracking-[0.01em] transition duration-200",
                          getNavItemClasses(isActive, isActivityReport),
                        )}
                      >
                        {"icon" in item ? (
                          <item.icon
                            className={cn(
                              "size-5 shrink-0",
                              getNavIconClasses(isActive, isActivityReport),
                            )}
                            strokeWidth={2.1}
                          />
                        ) : (
                          <Image
                            alt="AMS"
                            className="shrink-0"
                            height={20}
                            src={item.iconSrc}
                            unoptimized
                            width={20}
                          />
                        )}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 border-t border-black/6 pt-5 dark:border-white/8">
                  <Link
                    href="/extension"
                    className={cn(
                      "flex items-center gap-3 rounded-[1.35rem] px-4 py-3 text-sm font-medium tracking-[0.01em] transition duration-200",
                      pathname.startsWith("/extension")
                        ? navItemActiveClassName
                        : navItemInactiveClassName,
                    )}
                  >
                    <Puzzle
                      className={cn(
                        "size-5 shrink-0",
                        pathname.startsWith("/extension")
                          ? "text-app-primary"
                          : "text-app-ink/78 dark:text-white/70",
                      )}
                      strokeWidth={2.1}
                    />
                    <span>Extension</span>
                  </Link>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-6">
                  <Btn className="w-full" href="/jobb/new" icon={Plus}>
                    Lägg till jobb
                  </Btn>
                  <LogoutBtn className="w-full" />
                </div>
              </div>
            </aside>

            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-300">{children}</div>
      )}

      {showNavigation ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4 md:hidden">
          <div className="mx-auto w-full max-w-300">
            <nav
              aria-label="Primär navigation"
              className={cn(
                navShellClassName,
                "pointer-events-auto mx-auto flex w-full items-center justify-between p-2",
              )}
            >
              {navItems.map((item) => {
                const isActive = item.match(pathname);
                const isActivityReport = item.href === "/aktivitetsrapport";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.35rem] px-3 py-2 text-center text-[0.72rem] font-medium tracking-[0.01em] transition duration-200",
                      getNavItemClasses(isActive, isActivityReport),
                    )}
                  >
                    {"icon" in item ? (
                      <item.icon
                        className={cn(
                          "size-5 shrink-0",
                          getNavIconClasses(isActive, isActivityReport),
                        )}
                        strokeWidth={2.1}
                      />
                    ) : (
                      <Image
                        alt="AMS"
                        className="shrink-0"
                        height={20}
                        src={item.iconSrc}
                        unoptimized
                        width={20}
                      />
                    )}
                    <span className="text-[0.64rem] leading-tight whitespace-normal">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
