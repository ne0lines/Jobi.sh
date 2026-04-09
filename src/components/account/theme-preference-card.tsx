'use client';

import { useThemePreference } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';
import type { ThemePreference } from '@/lib/theme';
import { MoonStar, SunMedium } from 'lucide-react';

const themeOptions: Array<{
  description: string;
  icon: typeof SunMedium;
  label: string;
  value: ThemePreference;
}> = [
  {
    description: 'Ljust gränssnitt med rena ytor och maximal läsbarhet.',
    icon: SunMedium,
    label: 'Ljust',
    value: 'light',
  },
  {
    description: 'Mörkare ytor som är skonsammare i kvällsljus och låg belysning.',
    icon: MoonStar,
    label: 'Mörkt',
    value: 'dark',
  },
];

export function ThemePreferenceCard() {
  const { themePreference, setThemePreference } = useThemePreference();

  function handleThemePreferenceChange(nextThemePreference: ThemePreference) {
    if (nextThemePreference === themePreference) {
      return;
    }

    setThemePreference(nextThemePreference);
  }

  return (
    <article className='app-card'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-app-ink'>Tema</h2>
        </div>
      </div>

      <div className='mt-6 grid gap-3 sm:grid-cols-2'>
        {themeOptions.map(({ description, icon: Icon, label, value }) => {
          const isActive = themePreference === value;

          return (
            <button
              key={value}
              aria-pressed={isActive}
              className={cn(
                'flex min-h-36 cursor-pointer flex-col rounded-3xl border p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/40 disabled:pointer-events-none disabled:opacity-60 md:p-5',
                isActive
                  ? 'border-app-primary bg-app-surface text-app-ink shadow-[0_14px_32px_rgba(17,23,40,0.12)]'
                  : 'border-app-stroke bg-app-card text-app-muted hover:-translate-y-0.5 hover:border-app-primary/25 hover:bg-app-surface',
              )}
              type='button'
              onClick={() => handleThemePreferenceChange(value)}
            >
              <div className='flex w-full items-center justify-between'>
                <span className='text-base font-semibold text-app-ink'>
                  {label}
                </span>
                <Icon aria-hidden='true' size={20} />
              </div>
              <span className='mt-3 text-sm leading-6 text-app-muted'>
                {description}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}