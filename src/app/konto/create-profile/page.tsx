'use client';

import { Btn } from '@/components/ui/btn';
import { Input } from '@/components/ui/input';
import { TERMS_VERSION } from '@/lib/legal';
import { useUser } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type FormState = {
  name: string;
  profession: string;
};

type ExistingProfile = {
  name: string;
  profession: string;
  termsVersion: string | null;
};

export default function CreateProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const t = useTranslations('createProfile');

  const email = user?.emailAddresses[0]?.emailAddress ?? '';

  const [form, setForm] = useState<FormState>({ name: '', profession: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [existingProfile, setExistingProfile] =
    useState<ExistingProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = (await res.json()) as ExistingProfile;
          if (data.termsVersion === TERMS_VERSION) {
            router.replace('/dashboard');
            return;
          }
          setExistingProfile(data);
          setForm({ name: data.name, profession: data.profession });
        }
      } catch {
        // No existing profile, proceed with empty form
      } finally {
        setIsLoadingProfile(false);
      }
    }
    void fetchProfile();
  }, [router]);

  const needsTermsUpdate =
    existingProfile !== null && existingProfile.termsVersion !== TERMS_VERSION;

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitProfile() {
    setIsSubmitting(true);
    setFeedback('');

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          profession: form.profession,
          termsAccepted,
          termsVersion: TERMS_VERSION,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setFeedback(data.error ?? t('saveError'));
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setFeedback(t('saveError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSubmit: React.ComponentProps<'form'>['onSubmit'] = (e) => {
    e.preventDefault();
    void submitProfile();
  };

  if (isLoadingProfile) {
    return (
      <main className='flex min-h-dvh flex-col gap-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'>
        <h1 className='font-display text-4xl leading-none'>
          Jobi<span className='text-app-primary'>.sh</span>
        </h1>
      </main>
    );
  }

  return (
    <main className='flex min-h-dvh flex-col gap-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'>
      <h1 className='font-display text-4xl leading-none'>
        Jobi<span className='text-app-primary'>.sh</span>
      </h1>
      <section className='mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center'>
        <div className='app-page-content-compact flex-1 items-center justify-center'>
          <div className='app-heading-stack-tight w-full text-center'>
            {needsTermsUpdate ? (
              <>
                <h2 className='text-2xl'>{t('updatedTermsTitle')}</h2>
                <p className='text-base text-app-muted'>
                  {t('updatedTermsSubtitle')}
                </p>
              </>
            ) : (
              <>
                <h2 className='text-2xl'>{t('title')}</h2>
                <p className='text-base text-app-muted'>
                  {t('subtitle')}
                </p>
              </>
            )}
            {feedback ? (
              <p className='app-feedback-card text-sm text-red-500'>
                {feedback}
              </p>
            ) : null}
          </div>

          {needsTermsUpdate && (
            <div className='app-feedback-card w-full border-amber-200 bg-amber-50 text-sm leading-6 text-amber-800'>
              {t('termsReviewNote')}
            </div>
          )}

          <form className='app-form-stack flex w-full' onSubmit={handleSubmit}>
            <label className='app-form-field font-semibold text-app-muted'>
              <span className='block'>{t('emailLabel')}</span>
              <Input
                className='bg-app-card text-app-muted'
                disabled
                type='email'
                value={email}
              />
            </label>

            <label className='app-form-field font-semibold text-app-muted'>
              <span className='block'>{t('nameLabel')}</span>
              <Input
                name='name'
                placeholder={t('namePlaceholder')}
                required
                type='text'
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </label>

            <label className='app-form-field font-semibold text-app-muted'>
              <span className='block'>{t('professionLabel')}</span>
              <Input
                name='profession'
                placeholder={t('professionPlaceholder')}
                required
                type='text'
                value={form.profession}
                onChange={(e) => updateField('profession', e.target.value)}
              />
            </label>

            <label className='app-checkbox-card text-sm leading-6 text-app-muted'>
              <input
                checked={termsAccepted}
                className='mt-0.5 h-4 w-4 rounded border border-app-stroke accent-app-primary'
                name='termsAccepted'
                required
                type='checkbox'
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span>
                {t('termsPrefix')}{' '}
                <Link
                  className='font-semibold text-app-primary underline underline-offset-2'
                  href='/terms'
                  rel='noreferrer'
                  target='_blank'
                >
                  {t('termsLink')}
                </Link>{' '}
                {t('termsAnd')}{' '}
                <Link
                  className='font-semibold text-app-primary underline underline-offset-2'
                  href='/gdpr'
                  rel='noreferrer'
                  target='_blank'
                >
                  {t('gdprLink')}
                </Link>{' '}
                {t('termsSuffix')}
              </span>
            </label>

            <Btn className='w-full' disabled={isSubmitting} type='submit'>
              {isSubmitting
                ? t('saving')
                : needsTermsUpdate
                  ? t('acceptBtn')
                  : t('submitBtn')}
            </Btn>
          </form>
        </div>
      </section>
    </main>
  );
}
