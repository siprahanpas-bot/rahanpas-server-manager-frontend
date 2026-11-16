<script setup lang="ts">
const route = useRoute()
const loading = ref(false)
const errorMessage = ref('')
const email = String(route.query.email || '')
const token = String(route.query.token || '')

async function verifyEmail() {
  errorMessage.value = ''

  if (!email || !token) {
    errorMessage.value = 'Tautan verifikasi tidak lengkap.'
    return
  }

  loading.value = true

  try {
    const result: any = await $fetch('/auth/verify-email', {
      method: 'POST',
      body: { email, token }
    })

    await navigateTo({
      path: '/set-password',
      query: {
        email,
        token: result.password_setup_token
      }
    })
  } catch (error: any) {
    errorMessage.value =
      error.data?.statusMessage ||
      error.data?.message ||
      'Tautan verifikasi tidak valid atau sudah kedaluwarsa.'
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

      <div class="state">
        <h1>Verifikasi Email</h1>
        <p v-if="email">Konfirmasi bahwa alamat email <strong>{{ email }}</strong> adalah milik Anda.</p>
        <p v-else class="error">Tautan verifikasi tidak lengkap.</p>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <button
          type="button"
          :disabled="loading || !email || !token"
          @click="verifyEmail"
        >
          {{ loading ? 'Memverifikasi...' : 'Verifikasi Email' }}
        </button>

        <p><NuxtLink to="/register">Kembali ke registrasi</NuxtLink></p>
      </div>
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
  width: min(100%, 440px);
  padding: 38px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--panel-bg);
  text-align: center;
}
.brand {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
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
.state { margin-top: 40px; }
h1 { color: var(--text-primary); font-size: 23px; }
p { color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
.error { color: #dc2626; }
a { color: #3b82f6; font-weight: 700; }
button {
  min-height: 46px;
  width: 100%;
  margin-top: 16px;
  border: 0;
  border-radius: 9px;
  color: white;
  background: linear-gradient(100deg,#2563eb,#0891b2);
  font-weight: 700;
  cursor: pointer;
}
button:disabled { opacity: .6; cursor: not-allowed; }
.spinner {
  width: 32px;
  height: 32px;
  margin: auto;
  border: 3px solid var(--border-color);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
