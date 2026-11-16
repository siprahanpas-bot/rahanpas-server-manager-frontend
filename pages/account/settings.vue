<script setup lang="ts">
const me = ref<any>(null)
const profileForm = reactive({ name: '', email: '', phone: '' })
const passwordForm = reactive({ current_password: '', password: '', password_confirmation: '' })
const savingProfile = ref(false)
const savingPassword = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

onMounted(async () => {
  try {
    me.value = await $fetch('/auth/me')
    profileForm.name = me.value.name || ''
    profileForm.email = me.value.email || ''
    profileForm.phone = me.value.phone || ''
  } catch {
    await navigateTo('/')
  }
})

async function saveProfile() {
  savingProfile.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res: any = await $fetch('/manager-api/account/profile', { method: 'PUT', body: profileForm })
    successMsg.value = res.message
    me.value = await $fetch('/auth/me')
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.statusMessage || 'Gagal memperbarui profil.'
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  savingPassword.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res: any = await $fetch('/manager-api/account/password', { method: 'PUT', body: passwordForm })
    successMsg.value = res.message
    Object.assign(passwordForm, { current_password: '', password: '', password_confirmation: '' })
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.statusMessage || 'Gagal memperbarui password.'
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <AdminShell title="User Settings" breadcrumb="Account / Settings" active-menu="settings" :user="me">
    <div v-if="errorMsg" class="adm-alert" style="margin: 0 0 16px;">{{ errorMsg }}</div>
    <div v-if="successMsg" class="adm-success" style="margin: 0 0 16px;">{{ successMsg }}</div>

    <div class="settings-grid">
      <form class="adm-card" style="padding: 20px;" @submit.prevent="saveProfile">
        <h2 style="margin: 0 0 6px; font-size: 16px; color: var(--text-bright);">Profil Akun</h2>
        <p style="margin: 0 0 16px; font-size: 12px; color: var(--text-secondary);">Perbarui nama, email, dan nomor telepon akun Anda.</p>
        <div class="adm-form-grid">
          <label class="adm-field full"><span>Nama Lengkap</span><input v-model="profileForm.name" class="adm-input" required></label>
          <label class="adm-field full"><span>Email</span><input v-model="profileForm.email" type="email" class="adm-input" :disabled="me?.email === 'rahanpas.rap@gmail.com'" required></label>
          <label class="adm-field full"><span>Nomor Telepon</span><input v-model="profileForm.phone" class="adm-input" placeholder="+62..."></label>
        </div>
        <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
          <button type="submit" class="adm-btn adm-btn-primary" :disabled="savingProfile">{{ savingProfile ? 'Menyimpan...' : 'Simpan Profil' }}</button>
        </div>
      </form>

      <form class="adm-card" style="padding: 20px;" @submit.prevent="savePassword">
        <h2 style="margin: 0 0 6px; font-size: 16px; color: var(--text-bright);">Keamanan & Password</h2>
        <p style="margin: 0 0 16px; font-size: 12px; color: var(--text-secondary);">Ganti password secara berkala untuk menjaga keamanan akses.</p>
        <div class="adm-form-grid">
          <label class="adm-field full"><span>Password Saat Ini</span><input v-model="passwordForm.current_password" type="password" class="adm-input" required></label>
          <label class="adm-field full"><span>Password Baru (min 8 karakter)</span><input v-model="passwordForm.password" type="password" class="adm-input" minlength="8" required></label>
          <label class="adm-field full"><span>Konfirmasi Password Baru</span><input v-model="passwordForm.password_confirmation" type="password" class="adm-input" minlength="8" required></label>
        </div>
        <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
          <button type="submit" class="adm-btn adm-btn-primary" :disabled="savingPassword">{{ savingPassword ? 'Menyimpan...' : 'Ubah Password' }}</button>
        </div>
      </form>
    </div>
  </AdminShell>
</template>

<style scoped>

.adm-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  overflow: hidden;
}
.adm-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
}
.adm-filters { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1; }
.adm-input, .adm-select, .adm-textarea {
  padding: 9px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--surface-muted);
  color: var(--text-bright);
  font-size: 12px;
  outline: none;
}
.adm-input:focus, .adm-select:focus, .adm-textarea:focus { border-color: var(--primary); }
.adm-btn {
  padding: 9px 14px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--surface-raised);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.adm-btn-primary {
  border-color: var(--primary);
  background: var(--primary);
  color: #ffffff;
}
.adm-btn-danger {
  border-color: var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger-text);
}
.adm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.adm-table-wrap { width: 100%; overflow-x: auto; }
.adm-table { width: 100%; min-width: 680px; border-collapse: collapse; font-size: 12px; text-align: left; }
.adm-table th {
  padding: 11px 16px;
  background: var(--surface-muted);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  border-bottom: 1px solid var(--border);
}
.adm-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-soft);
  vertical-align: middle;
}
.adm-table tbody tr:hover { background: var(--surface-hover); }
.adm-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid var(--border);
  background: var(--surface-muted);
  color: var(--text-secondary);
  margin: 2px 4px 2px 0;
}
.adm-badge.active { background: var(--success-bg); color: var(--success-text); border-color: rgba(34,197,94,0.3); }
.adm-badge.inactive { background: var(--danger-bg); color: var(--danger-text); border-color: var(--danger-border); }
.adm-badge.pending { background: rgba(245,158,11,0.14); color: var(--warning-text); border-color: rgba(245,158,11,0.35); }
.adm-badge.super { background: rgba(59,130,246,0.16); color: var(--primary-text); border-color: rgba(59,130,246,0.35); }
.adm-actions { display: inline-flex; gap: 8px; flex-wrap: wrap; }
.adm-link {
  border: 0; background: transparent; padding: 2px 4px;
  color: var(--primary-text); font-size: 11px; font-weight: 600; cursor: pointer;
}
.adm-link.danger { color: var(--danger-text); }
.adm-link:disabled { opacity: 0.45; cursor: not-allowed; }
.adm-alert {
  margin: 14px 20px; padding: 11px 14px; border-radius: 10px; font-size: 12px;
  border: 1px solid var(--danger-border); background: var(--danger-bg); color: var(--danger-text);
}
.adm-success {
  margin: 14px 20px; padding: 11px 14px; border-radius: 10px; font-size: 12px;
  border: 1px solid rgba(34,197,94,0.35); background: var(--success-bg); color: var(--success-text);
}
.adm-empty { padding: 36px 20px; text-align: center; color: var(--text-muted); font-size: 13px; }
.adm-modal-overlay {
  position: fixed; inset: 0; z-index: 1200;
  display: flex; align-items: center; justify-content: center;
  padding: 16px; background: rgba(2,6,23,0.72); backdrop-filter: blur(4px);
}
.adm-modal {
  width: 100%; max-width: 560px; max-height: 90dvh; overflow-y: auto;
  padding: 22px; border: 1px solid var(--border-strong); border-radius: 16px;
  background: var(--surface); color: var(--text);
  display: flex; flex-direction: column; gap: 14px;
}
.adm-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle);
}
.adm-modal-head h2 { margin: 0; font-size: 16px; color: var(--text-bright); }
.adm-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.adm-field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
.adm-field.full { grid-column: 1 / -1; }
.adm-field > span { font-weight: 600; color: var(--text-soft); }
.adm-check-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px; max-height: 200px; overflow-y: auto;
  padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-muted);
}
.adm-check-item { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; }
.adm-modal-foot {
  display: flex; justify-content: flex-end; gap: 10px;
  padding-top: 12px; border-top: 1px solid var(--border-subtle);
}
@media (max-width: 640px) {
  .adm-form-grid { grid-template-columns: 1fr; }
  .adm-modal-foot { flex-direction: column-reverse; }
  .adm-modal-foot .adm-btn { width: 100%; }
}

.settings-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
@media (max-width: 860px) { .settings-grid { grid-template-columns: 1fr; } }
</style>
