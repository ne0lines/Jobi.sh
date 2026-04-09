'use client';

import {
  applyThemePreference,
  DEFAULT_THEME_PREFERENCE,
  THEME_PREFERENCE_CHANGE_EVENT,
  THEME_PREFERENCE_STORAGE_KEY,
  persistThemePreference,
  readStoredThemePreference,
  type ThemePreference,
} from '@/lib/theme';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

type ThemeProviderValue = {
  setThemePreference: (nextThemePreference: ThemePreference) => void;
  themePreference: ThemePreference;
};

const ThemePreferenceContext = createContext<ThemeProviderValue | null>(null);

function subscribeToThemePreference(onStoreChange: () => void) {
  if (globalThis.window === undefined) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === THEME_PREFERENCE_STORAGE_KEY
    ) {
      onStoreChange();
    }
  };
  const handleThemePreferenceChange = () => {
    onStoreChange();
  };

  globalThis.window.addEventListener('storage', handleStorage);
  globalThis.window.addEventListener(
    THEME_PREFERENCE_CHANGE_EVENT,
    handleThemePreferenceChange,
  );

  return () => {
    globalThis.window?.removeEventListener('storage', handleStorage);
    globalThis.window?.removeEventListener(
      THEME_PREFERENCE_CHANGE_EVENT,
      handleThemePreferenceChange,
    );
  };
}

export function ThemeProvider({
  children,
  initialThemePreference = DEFAULT_THEME_PREFERENCE,
}: Readonly<{
  children: ReactNode;
  initialThemePreference?: ThemePreference;
}>) {
  const themePreference = useSyncExternalStore(
    subscribeToThemePreference,
    readStoredThemePreference,
    () => initialThemePreference,
  );

  const setThemePreference = useCallback(
    (nextThemePreference: ThemePreference) => {
      persistThemePreference(nextThemePreference);
      applyThemePreference(nextThemePreference);

      if (globalThis.window !== undefined) {
        globalThis.window.dispatchEvent(
          new Event(THEME_PREFERENCE_CHANGE_EVENT),
        );
      }
    },
    [],
  );

  useEffect(() => {
    applyThemePreference(themePreference);
  }, [themePreference]);

  const value = useMemo(
    () => ({ setThemePreference, themePreference }),
    [setThemePreference, themePreference],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error('useThemePreference must be used within ThemeProvider.');
  }

  return context;
}