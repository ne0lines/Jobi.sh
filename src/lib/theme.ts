export const THEME_PREFERENCES = ["light", "dark"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "light";
export const THEME_PREFERENCE_STORAGE_KEY = "jobish.themePreference";
export const THEME_PREFERENCE_CHANGE_EVENT = "jobish.themePreferenceChange";

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    typeof value === "string" &&
    THEME_PREFERENCES.includes(value as ThemePreference)
  );
}

export function readStoredThemePreference(): ThemePreference {
  if (globalThis.window === undefined) {
    return DEFAULT_THEME_PREFERENCE;
  }

  try {
    const storedThemePreference = globalThis.window.localStorage.getItem(
      THEME_PREFERENCE_STORAGE_KEY,
    );

    return isThemePreference(storedThemePreference)
      ? storedThemePreference
      : DEFAULT_THEME_PREFERENCE;
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

export function persistThemePreference(themePreference: ThemePreference) {
  if (globalThis.window === undefined) {
    return;
  }

  try {
    globalThis.window.localStorage.setItem(
      THEME_PREFERENCE_STORAGE_KEY,
      themePreference,
    );
  } catch {
    // Ignore storage write failures and keep the in-memory theme.
  }
}

export function applyThemePreference(themePreference: ThemePreference) {
  if (globalThis.document === undefined) {
    return;
  }

  globalThis.document.documentElement.classList.toggle(
    "dark",
    themePreference === "dark",
  );
  globalThis.document.documentElement.style.colorScheme = themePreference;
}

export const themeInitializationScript = `(() => {
  try {
    const storedThemePreference = globalThis.localStorage.getItem("${THEME_PREFERENCE_STORAGE_KEY}");
    const themePreference = storedThemePreference === "dark" ? "dark" : "light";
    globalThis.document.documentElement.classList.toggle("dark", themePreference === "dark");
    globalThis.document.documentElement.style.colorScheme = themePreference;
  } catch {
    globalThis.document.documentElement.classList.remove("dark");
    globalThis.document.documentElement.style.colorScheme = "light";
  }
})();`;