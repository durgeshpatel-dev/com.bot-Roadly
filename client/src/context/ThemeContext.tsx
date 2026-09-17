import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'roadly-theme';

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function getThemeMediaQuery() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;

  return window.matchMedia('(prefers-color-scheme: dark)');
}

function applyTheme(preference: ThemePreference) {
  if (typeof document === 'undefined') return;

  const systemPrefersDark = getThemeMediaQuery()?.matches ?? false;
  const isDark = preference === 'dark' || (preference === 'system' && systemPrefersDark);

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(getStoredPreference);

  useEffect(() => {
    applyTheme(preference);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Theme persistence is a preference, not a render requirement.
    }

    if (preference !== 'system') return undefined;

    const mediaQuery = getThemeMediaQuery();
    if (!mediaQuery) return undefined;

    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  return (
    <ThemeContext.Provider value={{ preference, setPreference: setPreferenceState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
}
