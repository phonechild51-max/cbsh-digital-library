/**
 * ═══════════════════════════════════════════════════════════
 *  CBSH Digital Library — Dark / Light Mode Toggle
 * ═══════════════════════════════════════════════════════════
 */

const ThemeToggle = (() => {
  const STORAGE_KEY = 'cbsh_theme';

  // Light mode override variables
  const LIGHT_VARS = {
    '--bg-app':           '#F5F0EB',
    '--bg-sidebar':       '#FFFFFF',
    '--bg-card':          '#FFFFFF',
    '--bg-card-hover':    '#FBF7F2',
    '--bg-input':         '#F0EBE5',
    '--text-primary':     '#1A1410',
    '--text-secondary':   '#5C4A35',
    '--text-heading':     '#221A12',
    '--text-disabled':    '#A89478',
    '--text-muted':       '#C4A882',
    '--border-card':      '#E8DFD2',
    '--border-input':     '#D4C8B8',
    '--border-divider':   '#EDE5DA',
    '--border-subtle':    '#F0EBE5',
    '--accent-amber-glow':   'rgba(212, 146, 42, 0.2)',
    '--accent-amber-subtle': 'rgba(212, 146, 42, 0.1)',
    '--accent-blue-subtle':  'rgba(42, 109, 212, 0.1)',
    '--accent-amber-pressed': '#c48825',
    '--success-subtle':      'rgba(16, 185, 129, 0.1)',
    '--warning-subtle':      'rgba(245, 158, 11, 0.1)',
    '--danger-subtle':       'rgba(239, 68, 68, 0.1)'
  };

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  }

  function setTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    updateIcon(theme);
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
      Object.entries(LIGHT_VARS).forEach(([prop, val]) => {
        root.style.setProperty(prop, val);
      });
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    } else {
      // Remove overrides — falls back to :root defaults (dark)
      Object.keys(LIGHT_VARS).forEach(prop => {
        root.style.removeProperty(prop);
      });
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    }
  }

  function updateIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = theme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    }
  }

  function toggle() {
    const current = getTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    // Apply saved theme
    const theme = getTheme();
    applyTheme(theme);
    updateIcon(theme);

    // Bind toggle button
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      btn.addEventListener('click', toggle);
    }
  }

  return { init, toggle, getTheme, setTheme };
})();
