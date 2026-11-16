<script setup lang="ts">
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    await $fetch('/auth/me')
    await navigateTo('/dashboard')
  } catch {
    // Belum login, tetap di halaman login.
  }
})

async function login() {
  errorMessage.value = ''
  loading.value = true

  try {
    await $fetch('/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    await navigateTo('/dashboard')
  } catch (error: any) {
    errorMessage.value =
      error.data?.statusMessage ||
      error.data?.message ||
      'Login gagal. Silakan periksa email dan password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-shell">
      <section class="auth-brand-panel">
        <div class="auth-brand-top">
          <NuxtLink to="/" class="auth-brand">
            <span class="auth-logo">R</span>
            <div>
              <strong>Cloud Monitoring</strong>
              <small>RAHANPAS INFRASTRUCTURE</small>
            </div>
          </NuxtLink>

          <NuxtLink to="/" class="auth-home-link">← Beranda</NuxtLink>
        </div>

        <div class="auth-brand-body">
          <span class="auth-eyebrow">INFRASTRUCTURE CONTROL CENTER</span>
          <h1>
            Control your
            <span>infrastructure.</span>
          </h1>
          <p>
            Satu platform terpusat untuk memantau performa Linux (SSH) &amp; Windows (WinRM), mengelola file &amp; dokumen Office, serta kontrol Remote Desktop.
          </p>

          <div class="auth-highlights">
            <div><span>01</span> Realtime Multi-OS Monitoring</div>
            <div><span>02</span> Remote Desktop &amp; File Explorer</div>
            <div><span>03</span> ONLYOFFICE &amp; RBAC Security</div>
          </div>
        </div>

        <div class="auth-brand-foot">
          <small>Protected by encrypted credentials &amp; host key verification.</small>
        </div>
      </section>

      <section class="auth-form-panel">
        <div class="auth-card">
          <div class="auth-card-head">
            <div class="auth-card-head-row">
              <h2>Selamat Datang Kembali</h2>
              <NuxtLink to="/" class="auth-icon-home" title="Halaman Utama Cloud Monitoring">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </NuxtLink>
            </div>
            <p>Masuk ke akun Anda untuk mengakses dashboard monitoring.</p>
          </div>

          <div v-if="errorMessage" class="auth-alert" role="alert">
            {{ errorMessage }}
          </div>

          <form class="auth-form" @submit.prevent="login">
            <label class="auth-field">
              <span>Email Address</span>
              <input
                v-model.trim="email"
                type="email"
                required
                autocomplete="email"
                placeholder="admin@example.com"
              />
            </label>

            <label class="auth-field">
              <span>Password</span>
              <div class="auth-pass-wrap">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="Masukkan password Anda"
                />
                <button
                  type="button"
                  class="auth-pass-toggle"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </label>

            <button type="submit" class="auth-submit" :disabled="loading">
              {{ loading ? 'Memverifikasi...' : 'Sign In ke Dashboard →' }}
            </button>
          </form>

          <div class="auth-card-foot">
            <span>Belum punya akun?</span>
            <NuxtLink to="/register">Daftar Sekarang</NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.auth-page { min-height: 100vh; background: var(--app-bg); color: var(--text); display: flex; align-items: center; justify-content: center; padding: 24px 18px; }
.auth-shell { width: min(100%, 1040px); display: grid; grid-template-columns: 1.05fr 0.95fr; border: 1px solid var(--border); border-radius: 20px; background: var(--surface); box-shadow: 0 24px 60px rgba(2, 6, 23, 0.24); overflow: hidden; }

.auth-brand-panel { padding: 36px; display: flex; flex-direction: column; justify-content: space-between; gap: 32px; background: linear-gradient(155deg, rgba(37, 99, 235, 0.14), rgba(6, 182, 212, 0.06)); border-right: 1px solid var(--border-subtle); }
.auth-brand-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.auth-brand { display: inline-flex; align-items: center; gap: 11px; text-decoration: none; color: var(--text-bright, var(--text)); }
.auth-logo { width: 38px; height: 38px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: #ffffff; background: linear-gradient(135deg, #2563eb, #06b6d4); }
.auth-brand strong { display: block; font-size: 15px; line-height: 1.15; }
.auth-brand small { display: block; font-size: 10px; letter-spacing: 0.08em; color: var(--text-secondary); }
.auth-home-link { padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--surface-muted); color: var(--text); font-size: 12px; font-weight: 600; text-decoration: none; }
.auth-home-link:hover { border-color: var(--primary-text, #38bdf8); }

.auth-eyebrow { display: inline-block; padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(56, 189, 248, 0.35); background: rgba(56, 189, 248, 0.12); color: var(--primary-text, #38bdf8); font-size: 10.5px; font-weight: 700; letter-spacing: 0.07em; margin-bottom: 14px; }
.auth-brand-body h1 { margin: 0; font-size: clamp(26px, 3.2vw, 36px); line-height: 1.15; letter-spacing: -0.02em; color: var(--text-bright, var(--text)); }
.auth-brand-body h1 span { display: block; color: var(--primary-text, #38bdf8); }
.auth-brand-body p { margin: 14px 0 22px; font-size: 13.5px; line-height: 1.6; color: var(--text-secondary); }

.auth-highlights { display: flex; flex-direction: column; gap: 10px; }
.auth-highlights div { display: flex; align-items: center; gap: 10px; padding: 10px 13px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--surface); font-size: 13px; font-weight: 600; color: var(--text); }
.auth-highlights span { font-size: 11px; font-weight: 800; color: var(--primary-text, #38bdf8); }
.auth-brand-foot small { font-size: 11.5px; color: var(--text-muted, var(--text-secondary)); }

.auth-form-panel { padding: 40px 36px; display: flex; align-items: center; justify-content: center; background: var(--surface); }
.auth-card { width: 100%; max-width: 390px; }
.auth-card-head h2 { margin: 0; font-size: 22px; font-weight: 700; color: var(--text-bright, var(--text)); }
.auth-card-head p { margin: 6px 0 22px; font-size: 13px; color: var(--text-secondary); }

.auth-alert { margin-bottom: 16px; padding: 11px 13px; border-radius: 9px; border: 1px solid var(--danger-border); background: var(--danger-bg); color: var(--danger-text); font-size: 12.5px; font-weight: 500; }

.auth-form { display: flex; flex-direction: column; gap: 16px; }
.auth-field { display: flex; flex-direction: column; gap: 7px; }
.auth-field span { font-size: 12.5px; font-weight: 600; color: var(--text-soft, var(--text)); }
.auth-field input { width: 100%; padding: 11px 13px; border-radius: 10px; border: 1px solid var(--border-strong); background: var(--surface-muted); color: var(--text); font: inherit; font-size: 13.5px; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
.auth-field input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18); }

.auth-pass-wrap { position: relative; display: flex; align-items: center; }
.auth-pass-wrap input { padding-right: 64px; }
.auth-pass-toggle { position: absolute; right: 8px; padding: 5px 9px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--text-secondary); font-size: 11px; font-weight: 600; cursor: pointer; }
.auth-pass-toggle:hover { color: var(--text); }

.auth-submit { margin-top: 4px; width: 100%; padding: 12px 18px; border: 0; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #0284c7); color: #ffffff; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.28); transition: transform 0.15s, opacity 0.15s; }
.auth-submit:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.96; }
.auth-submit:disabled { opacity: 0.6; cursor: wait; }

.auth-card-foot { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: var(--text-secondary); }
.auth-card-foot a { color: var(--primary-text, #38bdf8); font-weight: 600; text-decoration: none; }
.auth-card-foot a:hover { text-decoration: underline; }

:global(html[data-theme="light"]) .auth-shell { box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08); }
:global(html[data-theme="light"]) .auth-brand-panel { background: linear-gradient(155deg, rgba(37, 99, 235, 0.08), rgba(6, 182, 212, 0.04)); }

@media (max-width: 820px) {
  .auth-shell { grid-template-columns: 1fr; }
  .auth-brand-panel { padding: 24px 22px; gap: 20px; border-right: 0; border-bottom: 1px solid var(--border-subtle); }
  .auth-highlights, .auth-brand-foot { display: none; }
  .auth-form-panel { padding: 28px 22px; }
}
.auth-card-head-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.auth-icon-home { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--border-strong); background: var(--surface-muted); color: var(--text); text-decoration: none; flex: none; }
.auth-icon-home:hover { border-color: var(--primary-text, #38bdf8); color: var(--primary-text, #38bdf8); }
</style>
