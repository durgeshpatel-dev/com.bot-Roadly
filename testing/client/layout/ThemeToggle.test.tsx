import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

describe('ThemeToggle', () => {
  it.each(['Light', 'Dark', 'System'])('opens the real Coss menu and applies %s', async (choice) => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation(query => ({
      matches: false, media: query, onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
    })) });
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Theme: System' }));
    fireEvent.click(await screen.findByRole('menuitemradio', { name: choice }));
    await waitFor(() => expect(localStorage.getItem('roadly-theme')).toBe(choice.toLowerCase()));
    expect(document.documentElement.classList.contains('dark')).toBe(choice === 'Dark');
  });
});
