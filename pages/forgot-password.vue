<template>
  <div class="fp-page" :class="{ 'is-light': isLight }">
    <div class="fp-card">
      <div class="fp-header">
        <div class="fp-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 1 1 21 9z" />
          </svg>
        </div>
        <h1 class="fp-title">Atur Ulang Password</h1>
        <p class="fp-subtitle">
          Masukkan email akun Anda. Kami akan mengirimkan tautan untuk membuat password baru melalui Gmail API.
        </p>
      </div>

      <div
        v-if="feedbackMessage"
        class="fp-alert"
        :class="isError ? 'is-error' : 'is-success'"
      >
        <span>{{ feedbackMessage }}</span>
        <button type="button" class="fp-alert-close" @click="feedbackMessage = ''">&times;</button>
      </div>

      <form class="fp-form" @submit.prevent="handleForgotPassword">
        <div class="fp-field">
          <label for="email" class="fp-label">Alamat Email Terdaftar</label>
          <div class="fp-input-box">
            <span class="fp-input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="nama@perusahaan.com"
              class="fp-input"
            />
          </div>
        </div>

        <button type="submit" :disabled="isLoading" class="fp-submit">
          {{ isLoading ? 'Mengirim...' : 'Kirim Tautan Reset' }}
        </button>

        <div class="fp-footer">
          <NuxtLink to="/login" class="fp-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke halaman login</span>
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const email = ref('')
const isLoading = ref(false)
const feedbackMessage = ref('')
const isError = ref(false)
const isLight = ref(false)
let themeObserver = null
let pollTimer = null

const readGlobalLightTheme = () => {
  if (typeof document === 'undefined') return false
  const html = document.documentElement
  const body = document.body

  const htmlAttr = (html.getAttribute('data-theme') || '').toLowerCase()
  const bodyAttr = (body?.getAttribute('data-theme') || '').toLowerCase()

  if (htmlAttr === 'light' || bodyAttr === 'light') return true
  if (htmlAttr === 'dark' || bodyAttr === 'dark') return false

  if (html.classList.contains('light') || body?.classList.contains('light')) return true
  if (html.classList.contains('dark') || body?.classList.contains('dark')) return false

  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || ''
      if (/theme|appearance|mode|color/i.test(key)) {
        const val = (localStorage.getItem(key) || '').toLowerCase()
        if (val === 'light') return true
        if (val === 'dark') return false
      }
    }
  }

  return false
}

const syncTheme = () => {
  isLight.value = readGlobalLightTheme()
}

onMounted(() => {
  syncTheme()

  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
    themeObserver = new MutationObserver(syncTheme)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    })
    if (document.body) {
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme', 'class']
      })
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', syncTheme)
    window.addEventListener('theme-change', syncTheme)
    window.addEventListener('appearance-change', syncTheme)
    pollTimer = window.setInterval(syncTheme, 300)
  }
})

onBeforeUnmount(() => {
  if (themeObserver) {
    themeObserver.disconnect()
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('storage', syncTheme)
    window.removeEventListener('theme-change', syncTheme)
    window.removeEventListener('appearance-change', syncTheme)
    if (pollTimer) {
      window.clearInterval(pollTimer)
    }
  }
})

const handleForgotPassword = async () => {
  if (!email.value) return

  isLoading.value = true
  feedbackMessage.value = ''
  isError.value = false

  try {
    const response = await $fetch('/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })

    feedbackMessage.value =
      response?.message || 'Jika email terdaftar dan aktif, tautan reset password telah dikirim.'
    isError.value = false
    email.value = ''
  } catch (error) {
    isError.value = true
    feedbackMessage.value =
      error?.data?.message ||
      error?.statusMessage ||
      'Gagal mengirim tautan reset password. Silakan coba beberapa saat lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.fp-page {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: #0b1120;
  color: #f8fafc;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.fp-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 16px;
  background: #111827;
  border: 1px solid #1f2937;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.fp-header {
  text-align: center;
}

.fp-icon-wrap {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.16);
  color: #60a5fa;
}

.fp-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
  color: #ffffff;
}

.fp-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #94a3b8;
}

.fp-alert {
  margin-top: 1.25rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 0.875rem;
  line-height: 1.45;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.fp-alert.is-error {
  background: rgba(127, 29, 29, 0.35);
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.4);
}

.fp-alert.is-success {
  background: rgba(20, 83, 45, 0.35);
  color: #86efac;
  border-color: rgba(74, 222, 128, 0.4);
}

.fp-alert-close {
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.125rem;
  line-height: 1;
  font-weight: 700;
  cursor: pointer;
}

.fp-form {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.fp-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
}

.fp-input-box {
  position: relative;
  display: flex;
  align-items: center;
}

.fp-input-icon {
  position: absolute;
  left: 0.875rem;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: #64748b;
}

.fp-input {
  box-sizing: border-box;
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 12px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #f8fafc;
  font-size: 0.875rem;
  line-height: 1.25;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.fp-input::placeholder {
  color: #64748b;
}

.fp-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.fp-submit {
  box-sizing: border-box;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.3);
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.fp-submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.fp-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.fp-footer {
  padding-top: 0.875rem;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  text-align: center;
}

.fp-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #60a5fa;
  text-decoration: none;
}

.fp-back-link:hover {
  color: #93c5fd;
}

/* Light theme (mengikuti Appearance global) */
.fp-page.is-light,
:global(html[data-theme="light"]) .fp-page {
  background: #f8fafc;
  color: #0f172a;
}

.fp-page.is-light .fp-card,
:global(html[data-theme="light"]) .fp-card {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.fp-page.is-light .fp-icon-wrap,
:global(html[data-theme="light"]) .fp-icon-wrap {
  background: #eff6ff;
  color: #2563eb;
}

.fp-page.is-light .fp-title,
:global(html[data-theme="light"]) .fp-title {
  color: #0f172a;
}

.fp-page.is-light .fp-subtitle,
:global(html[data-theme="light"]) .fp-subtitle {
  color: #475569;
}

.fp-page.is-light .fp-alert.is-error,
:global(html[data-theme="light"]) .fp-alert.is-error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.fp-page.is-light .fp-alert.is-success,
:global(html[data-theme="light"]) .fp-alert.is-success {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.fp-page.is-light .fp-label,
:global(html[data-theme="light"]) .fp-label {
  color: #334155;
}

.fp-page.is-light .fp-input-icon,
:global(html[data-theme="light"]) .fp-input-icon {
  color: #64748b;
}

.fp-page.is-light .fp-input,
:global(html[data-theme="light"]) .fp-input {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.fp-page.is-light .fp-input::placeholder,
:global(html[data-theme="light"]) .fp-input::placeholder {
  color: #94a3b8;
}

.fp-page.is-light .fp-footer,
:global(html[data-theme="light"]) .fp-footer {
  border-top-color: #e2e8f0;
}

.fp-page.is-light .fp-back-link,
:global(html[data-theme="light"]) .fp-back-link {
  color: #2563eb;
}

.fp-page.is-light .fp-back-link:hover,
:global(html[data-theme="light"]) .fp-back-link:hover {
  color: #1d4ed8;
}
</style>
