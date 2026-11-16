<script setup lang="ts">
type ThemeMode = 'light' | 'dark' | 'system'

const themeMode = ref<ThemeMode>('dark')

function applyTheme(mode: ThemeMode) {
  if (!import.meta.client) return

  const resolved = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode

  document.documentElement.dataset.theme = resolved
  document.documentElement.style.colorScheme = resolved
}

function setTheme(mode: ThemeMode) {
  themeMode.value = mode

  if (import.meta.client) {
    localStorage.setItem('rahanpas-theme', mode)
    applyTheme(mode)
  }
}

onMounted(() => {
  const saved = localStorage.getItem('rahanpas-theme') as ThemeMode | null
  const mode = ['light', 'dark', 'system'].includes(saved || '')
    ? saved!
    : 'dark'

  themeMode.value = mode
  applyTheme(mode)

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', () => {
    if (themeMode.value === 'system') applyTheme('system')
  })
})
</script>

<template>
  <NuxtPage />

  <div class="global-theme-control">
    <span class="theme-control-label">Appearance</span>
    <select
      :value="themeMode"
      aria-label="Choose appearance"
      @change="setTheme(($event.target as HTMLSelectElement).value as ThemeMode)"
    >
      <option value="light">☀ Light</option>
      <option value="dark">☾ Dark</option>
      <option value="system">◐ System</option>
    </select>
  </div>
</template>

<style>
:root {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  background: #080d18;
  color: #e2e8f0;

  --app-bg: #080d18;
  --surface: #101a2a;
  --surface-raised: #111f38;
  --surface-muted: #0b1423;
  --border: #263449;
  --text: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --surface-hover: #17263b;
  --surface-deep: #0f172a;
  --border-strong: #334155;
  --border-subtle: #1e293b;
  --text-bright: #f8fafc;
  --text-soft: #cbd5e1;
  --primary: #3b82f6;
  --primary-text: #60a5fa;
  --primary-soft-text: #93c5fd;
  --success-text: #86efac;
  --success-bg: #143b32;
  --danger-bg: #451a1a;
  --danger-border: #7f1d1d;
  --danger-text: #fca5a5;
  --warning-text: #fbbf24;
}

:root[data-theme="light"] {
  color-scheme: light;
  background: #f5f7fb;
  color: #172033;

  --app-bg: #f5f7fb;
  --surface: #ffffff;
  --surface-raised: #f8faff;
  --surface-muted: #f1f5f9;
  --border: #e2e8f0;
  --text: #172033;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --surface-hover: #e2e8f0;
  --surface-deep: #f8fafc;
  --border-strong: #cbd5e1;
  --border-subtle: #e2e8f0;
  --text-bright: #0f172a;
  --text-soft: #334155;
  --primary: #2563eb;
  --primary-text: #2563eb;
  --primary-soft-text: #1d4ed8;
  --success-text: #166534;
  --success-bg: #dcfce7;
  --danger-bg: #fef2f2;
  --danger-border: #fecaca;
  --danger-text: #991b1b;
  --warning-text: #b45309;
}

* { box-sizing: border-box; }

html, body, #__nuxt {
  min-width: 320px;
  min-height: 100%;
  margin: 0;
}

body {
  min-height: 100vh;
  background: var(--app-bg);
  color: var(--text);
  transition: background-color .2s ease, color .2s ease;
}

button, input, select, textarea { font: inherit; }

.global-theme-control {
  position: fixed;
  z-index: 9999;
  right: 20px;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 10px 7px 13px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 5px 22px rgba(15, 23, 42, .13);
  backdrop-filter: blur(12px);
}

.theme-control-label {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.global-theme-control select {
  min-width: 105px;
  padding: 7px 25px 7px 9px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  background: var(--surface-muted);
  color: var(--text);
  font-size: 11px;
  cursor: pointer;
}

.global-theme-control select:focus {
  border-color: var(--primary);
}

@media (max-width: 600px) {
  .global-theme-control {
    right: 12px;
    bottom: 12px;
  }
}

/* LIGHT THEME — application surfaces */
html[data-theme="light"] body,
html[data-theme="light"] .dashboard,
html[data-theme="light"] .page,
html[data-theme="light"] .login-layout,
html[data-theme="light"] .main-area,
html[data-theme="light"] .form-panel {
  background: var(--app-bg);
  color: var(--text);
}

html[data-theme="light"] .sidebar,
html[data-theme="light"] .stat-card,
html[data-theme="light"] .stat,
html[data-theme="light"] .server-section,
html[data-theme="light"] .inventory,
html[data-theme="light"] .login-card {
  background: var(--surface);
  border-color: var(--border);
  color: var(--text);
}

html[data-theme="light"] .topbar,
html[data-theme="light"] .sidebar-bottom,
html[data-theme="light"] .toolbar,
html[data-theme="light"] .pagination,
html[data-theme="light"] td {
  border-color: var(--border);
}

html[data-theme="light"] .welcome {
  background:
    radial-gradient(ellipse at 85% 20%, rgba(37,99,235,.10), transparent 48%),
    linear-gradient(110deg, #ffffff, #eff6ff);
  border-color: #dbeafe;
  color: #172033;
}

html[data-theme="light"] .welcome-symbol {
  color: rgba(37,99,235,.10);
}

html[data-theme="light"] .brand-panel {
  background:
    radial-gradient(ellipse at 70% 25%, rgba(37,99,235,.12), transparent 48%),
    radial-gradient(ellipse at 15% 85%, rgba(8,145,178,.07), transparent 42%),
    #f1f5fb;
  border-color: var(--border);
  color: #172033;
}

html[data-theme="light"] .brand-content > p,
html[data-theme="light"] .feature-list {
  color: #475569;
}

html[data-theme="light"] .brand-panel footer {
  color: #64748b;
}

html[data-theme="light"] .nav-item {
  color: #475569;
}

html[data-theme="light"] .nav-item > span {
  color: #64748b;
}

html[data-theme="light"] .nav-item.active {
  background: #eff6ff;
  color: #1d4ed8;
}

html[data-theme="light"] .nav-item.active > span {
  color: #2563eb;
}

html[data-theme="light"] .breadcrumb,
html[data-theme="light"] .user-info small,
html[data-theme="light"] .sidebar-brand small,
html[data-theme="light"] .sidebar-bottom > small,
html[data-theme="light"] .section-heading p,
html[data-theme="light"] .server-section > div:first-child p,
html[data-theme="light"] .welcome p,
html[data-theme="light"] .subtitle,
html[data-theme="light"] .inventory-heading p,
html[data-theme="light"] .stat-card > span,
html[data-theme="light"] .stat span,
html[data-theme="light"] .stat small,
html[data-theme="light"] .empty-state p {
  color: #64748b;
}

html[data-theme="light"] .stat-card > strong,
html[data-theme="light"] .empty-state strong,
html[data-theme="light"] .empty strong,
html[data-theme="light"] .topbar h1,
html[data-theme="light"] .section-heading h2,
html[data-theme="light"] .server-section h2,
html[data-theme="light"] .inventory-heading h2 {
  color: #172033;
}

html[data-theme="light"] .toolbar input,
html[data-theme="light"] input,
html[data-theme="light"] textarea,
html[data-theme="light"] select {
  background-color: #ffffff;
  color: #172033;
  border-color: #cbd5e1;
}

html[data-theme="light"] input::placeholder,
html[data-theme="light"] textarea::placeholder {
  color: #94a3b8;
}

html[data-theme="light"] th {
  background: #f8fafc;
  color: #64748b;
}

html[data-theme="light"] .refresh-button,
html[data-theme="light"] .logout-button,
html[data-theme="light"] .pagination button {
  background: #ffffff;
  color: #334155;
  border-color: #cbd5e1;
}

html[data-theme="light"] .os-label,
html[data-theme="light"] .protocol,
html[data-theme="light"] .date-cell {
  color: #475569;
}

html[data-theme="light"] .server-name,
html[data-theme="light"] .actions a {
  color: #2563eb;
}

html[data-theme="light"] .empty {
  color: #64748b;
}

html[data-theme="light"] .empty-icon {
  color: #94a3b8;
}

html[data-theme="light"] .status-online {
  color: #166534;
  background: #dcfce7;
}

html[data-theme="light"] .status-offline,
html[data-theme="light"] .status-error {
  color: #991b1b;
  background: #fee2e2;
}

html[data-theme="light"] .status-unknown {
  color: #475569;
  background: #e2e8f0;
}

html[data-theme="light"] .blue {
  color: #1d4ed8;
}

html[data-theme="light"] .green {
  color: #15803d;
}

html[data-theme="light"] .red {
  color: #dc2626;
}

html[data-theme="light"] .alert,
html[data-theme="light"] .error-message {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

html[data-theme="light"] .security-note,
html[data-theme="light"] .form-description {
  color: #64748b;
}

/* General interaction polish */
button, a, input, select, textarea {
  transition: background-color .18s ease, border-color .18s ease,
    color .18s ease, box-shadow .18s ease;
}

button:focus-visible, a:focus-visible,
input:focus-visible, select:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
</style>
