<script setup lang="ts">
const { public: { googleOauthEnabled } } = useRuntimeConfig()
const route = useRoute()
const name = ref('')
const phone = ref('+62')
const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function register() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    await $fetch('/auth/register', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        phone: phone.value.trim(),
        email: email.value.trim().toLowerCase()
      }
    })

    successMessage.value =
      'Registrasi berhasil. Periksa email Anda untuk membuka tautan verifikasi.'
  } catch (error: any) {
    errorMessage.value =
      error.data?.statusMessage ||
      error.data?.message ||
      'Registrasi gagal. Periksa kembali data Anda.'
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  if (route.query.error) {
    errorMessage.value = String(route.query.error)
  }
})
</script>

<template>
  <main class="auth-layout">
    <section class="auth-card">
      <div class="auth-top-row">
        <NuxtLink to="/" class="brand">
          <span class="brand-logo">R</span>
          <span>RAHANPAS</span>
        </NuxtLink>
        <NuxtLink to="/" class="home-icon-link" title="Kembali ke Halaman Utama">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Beranda</span>
        </NuxtLink>
      </div>

      <div class="heading">
        <span class="eyebrow">CREATE YOUR ACCOUNT</span>
        <h1>Register account</h1>
        <p>Daftarkan akun untuk mendapatkan akses ke RAHANPAS Server Manager.</p>
      </div>

      <form @submit.prevent="register">
        <label for="name">Nama lengkap</label>
        <input
          id="name"
          v-model.trim="name"
          type="text"
          autocomplete="name"
          placeholder="Nama lengkap"
          maxlength="255"
          required
        />

        <label for="phone">Nomor telepon</label>
        <input
          id="phone"
          v-model.trim="phone"
          type="tel"
          autocomplete="tel"
          placeholder="+628123456789"
          pattern="\+62[0-9]{8,13}"
          title="Gunakan format +62 diikuti nomor telepon"
          required
        />
        <small>Gunakan format internasional, contoh +628123456789.</small>

        <label for="email">Email address</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          autocomplete="email"
          placeholder="name@company.com"
          required
        />

        <div v-if="errorMessage" class="message error" role="alert">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="message success" role="status">
          {{ successMessage }}
        </div>

        <button type="submit" :disabled="loading || !!successMessage">
          {{ loading ? 'Mengirim...' : 'Create account' }}
          <span v-if="!loading">→</span>
        </button>
      </form>

      <div v-if="googleOauthEnabled" class="oauth-divider"><span>atau</span></div>

      <a v-if="googleOauthEnabled" href="/auth/google/redirect" class="google-oauth-btn">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"/></svg>
        <span>Daftar dengan Akun Google</span>
      </a>

      <p class="footer">
        Sudah memiliki akun?
        <NuxtLink to="/login">Sign in</NuxtLink>
      </p>

      <p class="security">
        Email verification required · Secure account activation
      </p>
    </section>
  </main>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 18px;
  background: var(--app-bg);
}
.auth-card {
  width: min(100%, 460px);
  padding: 38px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--panel-bg);
  box-shadow: 0 20px 60px rgba(0,0,0,.10);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: .18em;
}
.brand-logo {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: white;
  background: linear-gradient(135deg,#2563eb,#06b6d4);
  font-size: 22px;
}
.heading { margin: 38px 0 28px; }
.eyebrow {
  color: #0ea5e9;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .18em;
}
h1 {
  margin: 10px 0;
  color: var(--text-primary);
  font-size: 28px;
  letter-spacing: -.04em;
}
.heading p, .footer, .security {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.7;
}
form { display: grid; gap: 10px; }
label {
  margin-top: 9px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}
input {
  width: 100%;
  min-height: 46px;
  padding: 0 13px;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  outline: none;
  background: var(--app-bg);
  color: var(--text-primary);
  font: inherit;
}
input:focus { border-color: #3b82f6; }
small { color: var(--text-secondary); font-size: 11px; }
button {
  min-height: 48px;
  margin-top: 14px;
  border: 0;
  border-radius: 9px;
  color: white;
  background: linear-gradient(100deg,#2563eb,#0891b2);
  font-weight: 700;
  cursor: pointer;
}
button:disabled { opacity: .6; cursor: wait; }
.message {
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.6;
}
.error { color: #dc2626; background: rgba(220,38,38,.09); }
.success { color: #059669; background: rgba(5,150,105,.10); }
.footer { margin-top: 25px; text-align: center; }
.footer a { color: #3b82f6; font-weight: 700; }
.security {
  margin-top: 24px;
  text-align: center;
  font-size: 10px;
}
@media(max-width:480px) {
  .auth-card { padding: 26px 20px; }
}

.auth-top-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.home-icon-link { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--surface-muted); color: var(--text); font-size: 12px; font-weight: 600; text-decoration: none; }
.home-icon-link:hover { border-color: var(--primary-text, #38bdf8); color: var(--primary-text, #38bdf8); }
.oauth-divider { display: flex; align-items: center; gap: 10px; margin: 16px 0 12px; color: var(--text-secondary); font-size: 11.5px; }
.oauth-divider::before, .oauth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border-subtle); }
.google-oauth-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 11px 14px; border-radius: 9px; border: 1px solid var(--border-strong); background: var(--surface-muted); color: var(--text); font-size: 13px; font-weight: 600; text-decoration: none; transition: border-color 0.15s, background 0.15s; }
.google-oauth-btn:hover { border-color: var(--primary-text, #38bdf8); background: rgba(56, 189, 248, 0.08); }
</style>
