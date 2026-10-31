export type PortfolioTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'tamjid-portfolio-theme';

/**
 * Inline FOUC-prevention script executed in <head> before paint.
 */
export function buildThemeInitScript(
  defaultTheme: PortfolioTheme = 'dark',
  enableThemeToggle = true
): string {
  return `(function(){try{var d=${JSON.stringify(defaultTheme)};var e=${JSON.stringify(enableThemeToggle)};var t=d;if(e){var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(s==='dark'||s==='light'){t=s;}}document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(_){document.documentElement.setAttribute('data-theme',${JSON.stringify(defaultTheme)});}})();`;
}
