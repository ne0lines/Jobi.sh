import Link from "next/link";
import { LanguageSwitcherCard } from "@/components/account/language-switcher-card";
import { PushNotificationCard } from "@/components/account/push-notification-card";
import { ThemePreferenceCard } from "@/components/account/theme-preference-card";
import { LogoutBtn } from "@/components/auth/logout-btn";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserProfile } from "../types";
import ProfileInfo from "@/components/account/profile-info";

async function getUserProfile(cookieHeader: string): Promise<UserProfile> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${protocol}://${host}/api/user`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }
  return res.json();
}

export default async function AccountPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const headersList = await headers();
  const profile = await getUserProfile(headersList.get("cookie") ?? "");
  const t = await getTranslations("account");

  return (
    <main className='app-page'>
      <section className='mx-auto app-page-content-compact w-full max-w-2xl md:max-w-none'>
        <div>
          <h1 className='font-display text-4xl sm:text-6xl'>{t("title")}</h1>
        </div>
        <ProfileInfo profile={profile} />
        <ThemePreferenceCard />
        <div className='md:hidden'>
          <LanguageSwitcherCard />
        </div>
        <PushNotificationCard />
        <article className='rounded-3xl border border-app-stroke bg-app-card p-5'>
          <dl className='space-y-3 text-base text-app-ink'>
            <dt className='font-semibold uppercase tracking-[0.08em] text-app-muted'>
              {t("privacyTitle")}
            </dt>
            <dd>
              <Link
                href='/gdpr'
                className='text-app-muted underline underline-offset-4'
              >
                {t("gdprLink")}
              </Link>
            </dd>
            <dd>
              <Link
                href='/terms'
                className='text-app-muted underline underline-offset-4'
              >
                {t("termsLink")}
              </Link>
            </dd>
            <dd>
              <Link
                href='/privacy'
                className='text-app-muted underline underline-offset-4'
              >
                {t("privacyPolicyLink")}
              </Link>
            </dd>
            <dd>{t("deleteNote")}</dd>
          </dl>
        </article>
        <LogoutBtn className='w-full md:hidden' />
      </section>
    </main>
  );
}
