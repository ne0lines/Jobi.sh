import Link from 'next/link';
import { PushNotificationCard } from '@/components/account/push-notification-card';
import { ThemePreferenceCard } from '@/components/account/theme-preference-card';
import { LogoutBtn } from '@/components/auth/logout-btn';
import { auth } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

type UserProfile = {
  id: string;
  email: string;
  name: string;
  profession: string;
};

async function getUserProfile(
  cookieHeader: string,
): Promise<UserProfile | null> {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  const res = await fetch(`${protocol}://${host}/api/user`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return res.json() as Promise<UserProfile>;
}

export default async function AccountPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const headersList = await headers();
  const profile = await getUserProfile(headersList.get('cookie') ?? '');
  const t = await getTranslations('account');

  return (
    <main className='app-page'>
      <section className='mx-auto app-page-content-compact w-full max-w-2xl md:max-w-none'>
        <div>
          <h1 className='font-display text-4xl sm:text-6xl'>{t('title')}</h1>
          {profile?.name && (
            <p className='mt-3 text-base text-app-muted sm:text-lg'>
              {profile.name}
            </p>
          )}
        </div>

        <article className='app-card'>
          <dl className='space-y-3 text-base text-app-ink'>
            <div>
              <dt className='text-sm font-semibold uppercase tracking-[0.08em] text-app-muted'>
                {t('nameLabel')}
              </dt>
              <dd className='mt-1'>{profile?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className='text-sm font-semibold uppercase tracking-[0.08em] text-app-muted'>
                {t('emailLabel')}
              </dt>
              <dd className='mt-1'>{profile?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className='text-sm font-semibold uppercase tracking-[0.08em] text-app-muted'>
                {t('professionLabel')}
              </dt>
              <dd className='mt-1'>{profile?.profession ?? '—'}</dd>
            </div>
          </dl>
        </article>
        <ThemePreferenceCard />
        <PushNotificationCard />
        <article className='rounded-3xl border border-app-stroke bg-app-card p-5'>
          <dl className='space-y-3 text-base text-app-ink'>
            <dt className='font-semibold uppercase tracking-[0.08em] text-app-muted'>
              {t('privacyTitle')}
            </dt>
            <dd>
              <Link href='/gdpr' className='text-app-muted underline underline-offset-4'>
                {t('gdprLink')}
              </Link>
            </dd>
            <dd>
              <Link href='/terms' className='text-app-muted underline underline-offset-4'>
                Användarvillkor
              </Link>
            </dd>
            <dd>
              <Link
                href='/privacy'
                className='text-app-muted underline underline-offset-4'
              >
                Integritetspolicy
              </Link>
            </dd>
            <dd>{t('deleteNote')}</dd>
          </dl>
        </article>
        <LogoutBtn className='w-full md:hidden' />
      </section>
    </main>
  );
}
