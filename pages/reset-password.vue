<template>
  <div class="rp-page" :class="{ 'is-light': isLight }">
    <div class="rp-card">
      <div class="rp-header">
        <div class="rp-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 class="rp-title">Buat Password Baru</h1>
        <p class="rp-subtitle">
          Masukkan password baru untuk akun Anda. Pastikan password mudah diingat dan cukup kuat.
        </p>
      </div>

      <div
        v-if="feedbackMessage"
        class="rp-alert"
        :class="isError ? 'is-error' : 'is-success'"
      >
        <span>{{ feedbackMessage }}</span>
        <button type="button" class="rp-alert-close" @click="feedbackMessage = ''">&times;</button>
      </div>

      <form class="rp-form" @submit.prevent="handleResetPassword">
        <div class="rp-field">
          <label for="email" class="rp-label">Alamat Email</label>
          <div class="rp-input-box">
            <span class="rp-input-icon">
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
              readonly
              placeholder="nama@perusahaan.com"
              class="rp-input is-readonly"
            />
          </div>
        </div>

        <div class="rp-field">
          <label for="password" class="rp-label">Password Baru</label>
          <div class="rp-input-box">
            <span class="rp-input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 1 1 21 9z" />
              </svg>
            </span>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="8"
              placeholder="Minimal 8 karakter"
              class="rp-input has-toggle"
            />
            <button
              type="button"
              class="rp-toggle-btn"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        <div class="rp-field">
          <label for="password_confirmation" class="rp-label">Konfirmasi Password Baru</label>
          <div class="rp-input-box">
            <span class="rp-input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <input
              id="password_confirmation"
              v-model="passwordConfirmation"
              :type="showPasswordConfirmation ? 'text' : 'password'"
              required
              minlength="8"
              placeholder="Ulangi password baru"
              class="rp-input has-toggle"
            />
            <button
              type="button"
              class="rp-toggle-btn"
              :aria-label="showPasswordConfirmation ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'"
              @click="showPasswordConfirmation = !showPasswordConfirmation"
            >
              <svg v-if="showPasswordConfirmation" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" :disabled="isLoading" class="rp-submit">
          {{ isLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}
        </button>

        <div class="rp-footer">
          <NuxtLink to="/login" class="rp-back-link">
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
import { useRoute, navigateTo } from '#app'

const route = useRoute()

const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const token = ref(typeof route.query.token === 'string' ? route.query.token : '')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
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
  if (!email.value && typeof route.query.email === 'string') {
    email.value = route.query.email
  }
  if (!token.value && typeof route.query.token === 'string') {
    token.value = route.query.token
  }

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

const handleResetPassword = async () => {
  if (!email.value || !token.value) {
    isError.value = true
    feedbackMessage.value = 'Tautan reset password tidak lengkap. Silakan minta tautan baru.'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    isError.value = true
    feedbackMessage.value = 'Konfirmasi password baru tidak cocok.'
    return
  }

  isLoading.value = true
  feedbackMessage.value = ''
  isError.value = false

  try {
    const response = await $fetch('/auth/reset-password', {
      method: 'POST',
      body: {
        email: email.value,
        token: token.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value
      }
    })

    feedbackMessage.value =
      response?.message || 'Password berhasil diperbarui. Mengarahkan ke halaman login...'
    isError.value = false
    password.value = ''
    passwordConfirmation.value = ''

    setTimeout(() => {
      navigateTo('/login')
    }, 1500)
  } catch (error) {
    isError.value = true
    feedbackMessage.value =
      error?.data?.message ||
      error?.statusMessage ||
      'Gagal memperbarui password. Silakan coba beberapa saat lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.rp-page {
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

.rp-card {
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

.rp-header {
  text-align: center;
}

.rp-icon-wrap {
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

.rp-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
  color: #ffffff;
}

.rp-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #94a3b8;
}

.rp-alert {
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

.rp-alert.is-error {
  background: rgba(127, 29, 29, 0.35);
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.4);
}

.rp-alert.is-success {
  background: rgba(20, 83, 45, 0.35);
  color: #86efac;
  border-color: rgba(74, 222, 128, 0.4);
}

.rp-alert-close {
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.125rem;
  line-height: 1;
  font-weight: 700;
  cursor: pointer;
}

.rp-form {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.rp-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
}

.rp-input-box {
  position: relative;
  display: flex;
  align-items: center;
}

.rp-input-icon {
  position: absolute;
  left: 0.875rem;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: #64748b;
}

.rp-input {
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

.rp-input.has-toggle {
  padding-right: 2.75rem;
}

.rp-input.is-readonly {
  opacity: 0.8;
  cursor: default;
}

.rp-input::placeholder {
  color: #64748b;
}

.rp-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.rp-toggle-btn {
  position: absolute;
  right: 0.625rem;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.rp-toggle-btn:hover {
  color: #f8fafc;
  background: rgba(148, 163, 184, 0.12);
}

.rp-submit {
  box-sizing: border-box;
  width: 100%;
  margin-top: 0.25rem;
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

.rp-submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.rp-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.rp-footer {
  padding-top: 0.875rem;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  text-align: center;
}

.rp-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #60a5fa;
  text-decoration: none;
}

.rp-back-link:hover {
  color: #93c5fd;
}

/* Light theme (mengikuti Appearance global) */
.rp-page.is-light,
:global(html[data-theme="light"]) .rp-page {
  background: #f8fafc;
  color: #0f172a;
}

.rp-page.is-light .rp-card,
:global(html[data-theme="light"]) .rp-card {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.rp-page.is-light .rp-icon-wrap,
:global(html[data-theme="light"]) .rp-icon-wrap {
  background: #eff6ff;
  color: #2563eb;
}

.rp-page.is-light .rp-title,
:global(html[data-theme="light"]) .rp-title {
  color: #0f172a;
}

.rp-page.is-light .rp-subtitle,
:global(html[data-theme="light"]) .rp-subtitle {
  color: #475569;
}

.rp-page.is-light .rp-alert.is-error,
:global(html[data-theme="light"]) .rp-alert.is-error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.rp-page.is-light .rp-alert.is-success,
:global(html[data-theme="light"]) .rp-alert.is-success {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.rp-page.is-light .rp-label,
:global(html[data-theme="light"]) .rp-label {
  color: #334155;
}

.rp-page.is-light .rp-input-icon,
:global(html[data-theme="light"]) .rp-input-icon {
  color: #64748b;
}

.rp-page.is-light .rp-input,
:global(html[data-theme="light"]) .rp-input {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.rp-page.is-light .rp-input::placeholder,
:global(html[data-theme="light"]) .rp-input::placeholder {
  color: #94a3b8;
}

.rp-page.is-light .rp-toggle-btn,
:global(html[data-theme="light"]) .rp-toggle-btn {
  color: #64748b;
}

.rp-page.is-light .rp-toggle-btn:hover,
:global(html[data-theme="light"]) .rp-toggle-btn:hover {
  color: #0f172a;
  background: rgba(15, 23, 42, 0.06);
}

.rp-page.is-light .rp-footer,
:global(html[data-theme="light"]) .rp-footer {
  border-top-color: #e2e8f0;
}

.rp-page.is-light .rp-back-link,
:global(html[data-theme="light"]) .rp-back-link {
  color: #2563eb;
}

.rp-page.is-light .rp-back-link:hover,
:global(html[data-theme="light"]) .rp-back-link:hover {
  color: #1d4ed8;
}
</style>
