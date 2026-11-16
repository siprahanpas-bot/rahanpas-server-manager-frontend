<script setup lang="ts">
const route = useRoute()
const email = String(route.query.email || '')
const token = String(route.query.token || '')

const password = ref('')
const passwordConfirmation = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function savePassword() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email || !token) {
    errorMessage.value = 'Token aktivasi tidak tersedia. Silakan ulangi verifikasi email.'
    return
  }

  if (password.value.length < 12) {
    errorMessage.value = 'Password minimal 12 karakter.'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Konfirmasi password tidak sama.'
    return
  }

  loading.value = true

  try {
    const result: any = await $fetch('/auth/set-password', {
      method: 'POST',
      body: {
        email,
        token,
        password: password.value,
        password_confirmation: passwordConfirmation.value
      }
    })

    successMessage.value = result.message || 'Password berhasil dibuat.'
    password.value = ''
    passwordConfirmation.value = ''

    setTimeout(() => navigateTo('/'), 1800)
  } catch (error: any) {
    errorMessage.value =
      error.data?.statusMessage ||
      error.data?.message ||
      'Tidak dapat menyimpan password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-layout">
    <section class="auth-card">
      <div class="brand">
        <span class="brand-logo">R</span>
        <span>RAHANPAS</span>
      </div>

      <div class="heading">
        <span class="eyebrow">ACCOUNT ACTIVATION</span>
        <h1>Buat password</h1>
        <p>Email <strong>{{ email }}</strong> sudah diverifikasi. Buat password untuk mengaktifkan akun.</p>
      </div>

      <form @submit.prevent="savePassword">
        <label for="password">Password baru</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          minlength="12"
          placeholder="Minimal 12 karakter"
          required
        />

        <label for="confirmation">Konfirmasi password</label>
        <input
          id="confirmation"
          v-model="passwordConfirmation"
          type="password"
          autocomplete="new-password"
          minlength="12"
          placeholder="Ulangi password"
          required
        />

        <div v-if="errorMessage" class="message error" role="alert">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="message success" role="status">
          {{ successMessage }}
        </div>

        <button type="submit" :disabled="loading || !!successMessage">
          {{ loading ? 'Menyimpan...' : 'Aktifkan akun' }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--app-bg);
}
.auth-card {
  width: min(100%, 460px);
  padding: 38px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--panel-bg);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: .15em;
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
h1 { color: var(--text-primary); font-size: 27px; }
p { color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
p strong { color: var(--text-primary); overflow-wrap: anywhere; }
form { display: grid; gap: 12px; }
label { color: var(--text-primary); font-size: 12px; font-weight: 700; }
input {
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
button {
  min-height: 48px;
  margin-top: 12px;
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
</style>
