import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function ThemeHarness() {
  const { preference, setPreference } = useTheme();

  return (
    <div>
      <p>Preference: {preference}</p>
      <button type="button" onClick={() => setPreference('light')}>Light</button>
      <button type="button" onClick={() => setPreference('dark')}>Dark</button>
      <button type="button" onClick={() => setPreference('system')}>System</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    mockMatchMedia(false);
  });

  it('defaults to system and persists explicit preferences', () => {
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    expect(screen.getByText('Preference: system')).toBeTruthy();
    expect(localStorage.getItem('roadly-theme')).toBe('system');

    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));

    expect(screen.getByText('Preference: dark')).toBeTruthy();
    expect(localStorage.getItem('roadly-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('applies the system preference when system is selected', () => {
    mockMatchMedia(true);

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
