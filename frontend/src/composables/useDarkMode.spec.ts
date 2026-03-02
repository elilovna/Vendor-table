import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useDarkMode', () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
    });

    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));

    document.documentElement.removeAttribute('data-theme');

    vi.resetModules();
  });

  it('should default to light mode when no stored preference and system prefers light', async () => {
    const { useDarkMode } = await import('./useDarkMode');
    const { isDark } = useDarkMode();

    expect(isDark.value).toBe(false);
  });

  it('should use system dark preference when no stored preference', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));

    const { useDarkMode } = await import('./useDarkMode');
    const { isDark } = useDarkMode();

    expect(isDark.value).toBe(true);
  });

  it('should use stored dark preference from localStorage', async () => {
    localStorageMock['theme'] = 'dark';

    const { useDarkMode } = await import('./useDarkMode');
    const { isDark } = useDarkMode();

    expect(isDark.value).toBe(true);
  });

  it('should use stored light preference from localStorage', async () => {
    localStorageMock['theme'] = 'light';

    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));

    const { useDarkMode } = await import('./useDarkMode');
    const { isDark } = useDarkMode();

    expect(isDark.value).toBe(false);
  });

  it('should toggle dark mode', async () => {
    const { useDarkMode } = await import('./useDarkMode');
    const { isDark, toggle } = useDarkMode();

    const initialValue = isDark.value;
    toggle();

    expect(isDark.value).toBe(!initialValue);
  });

  it('should set data-theme attribute on document element', async () => {
    localStorageMock['theme'] = 'dark';

    await import('./useDarkMode');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should persist theme to localStorage', async () => {
    localStorageMock['theme'] = 'light';

    await import('./useDarkMode');

    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });
});
