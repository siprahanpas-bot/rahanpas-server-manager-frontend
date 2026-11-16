<script setup lang="ts">
const form = reactive({
  name: '',
  hostname: '',
  ip_address: '',
  os_type: 'linux',
  connection_protocol: 'ssh',
  port: 22,
  username: 'root',
  auth_method: 'password',
  password: '',
  private_key: '',
  private_key_passphrase: '',
  verify_host_key: false,
  notes: ''
})

const saving = ref(false)
const errorMessage = ref('')
const fieldErrors = ref<Record<string, string[]>>({})

watch(() => form.os_type, (os) => {
  if (os === 'linux') {
    form.connection_protocol = 'ssh'
    form.port = 22
  } else {
    form.connection_protocol = 'winrm'
    form.port = 5985
    form.username = 'Administrator'
  }
})

watch(() => form.connection_protocol, (protocol) => {
  form.port = protocol === 'winrm' ? 5985 : 22
})

watch(() => form.auth_method, () => {
  form.password = ''
  form.private_key = ''
  form.private_key_passphrase = ''
})

async function saveServer() {
  saving.value = true
  errorMessage.value = ''
  fieldErrors.value = {}

  const payload: Record<string, any> = {
    name: form.name,
    hostname: form.hostname || null,
    ip_address: form.ip_address || null,
    os_type: form.os_type,
    connection_protocol: form.connection_protocol,
    port: form.port,
    username: form.username,
    auth_method: form.auth_method,
    verify_host_key: form.verify_host_key,
    notes: form.notes || null
  }

  if (form.auth_method === 'password') {
    payload.password = form.password
  } else {
    payload.private_key = form.private_key
    payload.private_key_passphrase = form.private_key_passphrase || null
  }

  try {
    await $fetch('/manager-api/servers', {
      method: 'POST',
      body: payload
    })

    await navigateTo('/servers')
  } catch (error: any) {
    if (error.statusCode === 401) {
      await navigateTo('/')
      return
    }

    errorMessage.value =
      error.data?.statusMessage ||
      error.data?.message ||
      'Gagal menyimpan konfigurasi server.'

    fieldErrors.value = error.data?.data?.errors ||
      error.data?.errors ||
      {}
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await $fetch('/auth/me')
  } catch {
    await navigateTo('/')
  }
})

onMounted(async () => {
  try {
    const authUser: any = await $fetch('/auth/me')
    const perms = Array.isArray(authUser?.permissions) ? authUser.permissions : []
    if (!authUser?.is_super_admin && !perms.includes('server.create')) {
      await navigateTo('/dashboard?denied=server.create')
    }
  } catch {
    await navigateTo('/')
  }
})
</script>

<template>
  <main class="page">
    <header class="topbar">
      <div>
        <div class="breadcrumb">Workspace / Infrastructure / Servers / Add</div>
        <h1>Add New Server</h1>
        <p>Daftarkan server ke dalam infrastruktur terpusat.</p>
      </div>

      <NuxtLink to="/servers" class="back-button">← Back to Servers</NuxtLink>
    </header>

    <div class="content">
      <form class="form-card" @submit.prevent="saveServer">
        <section class="form-section">
          <div class="section-title">
            <span>01</span>
            <div>
              <h2>Server Information</h2>
              <p>Identitas dan alamat server yang akan dikelola.</p>
            </div>
          </div>

          <div class="fields">
            <label class="field full">
              <span>Server Name <b>*</b></span>
              <input v-model.trim="form.name" required maxlength="100" placeholder="Contoh: Production Web Server" />
              <small v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name[0] }}</small>
            </label>

            <label class="field">
              <span>IP Address</span>
              <input v-model.trim="form.ip_address" placeholder="192.168.1.10" />
              <small v-if="fieldErrors.ip_address" class="field-error">{{ fieldErrors.ip_address[0] }}</small>
            </label>

            <label class="field">
              <span>Hostname / FQDN</span>
              <input v-model.trim="form.hostname" placeholder="server.example.com" />
            </label>

            <label class="field">
              <div class="field-label-row">
                <span>Operating System <b>*</b></span>
                <NuxtLink :to="`/servers/setup-guide?os=${form.os_type}`" target="_blank" class="os-guide-link">
                  📖 Tutorial Konfigurasi {{ form.os_type === 'linux' ? 'Linux' : 'Windows' }} ↗
                </NuxtLink>
              </div>
              <select v-model="form.os_type">
                <option value="linux">Linux</option>
                <option value="windows">Windows Server</option>
              </select>
            </label>

            <label class="field">
              <span>Connection Protocol <b>*</b></span>
              <select v-model="form.connection_protocol">
                <option v-if="form.os_type === 'linux'" value="ssh">SSH</option>
                <template v-else>
                  <option value="winrm">WinRM</option>
                  <option value="windows_openssh">Windows OpenSSH</option>
                </template>
              </select>
              <small v-if="fieldErrors.connection_protocol" class="field-error">{{ fieldErrors.connection_protocol[0] }}</small>
            </label>

            <label class="field">
              <span>Port <b>*</b></span>
              <input v-model.number="form.port" type="number" min="1" max="65535" required />
              <small>SSH: 22 · WinRM: 5985 · Windows OpenSSH: 22</small>
            </label>

            <label class="field">
              <span>Username <b>*</b></span>
              <input v-model.trim="form.username" required maxlength="100" placeholder="root / Administrator" />
            </label>
          </div>
        </section>

        <section class="form-section">
          <div class="section-title">
            <span>02</span>
            <div>
              <h2>Authentication</h2>
              <p>Credential koneksi disimpan dalam bentuk terenkripsi.</p>
            </div>
          </div>

          <div class="fields">
            <label class="field full">
              <span>Authentication Method <b>*</b></span>
              <select v-model="form.auth_method">
                <option value="password">Username & Password</option>
                <option value="private_key" :disabled="form.connection_protocol === 'winrm'">
                  SSH Private Key
                </option>
              </select>
              <small v-if="form.connection_protocol === 'winrm'">
                WinRM saat ini menggunakan autentikasi password.
              </small>
            </label>

            <label v-if="form.auth_method === 'password'" class="field full">
              <span>Password <b>*</b></span>
              <input
                v-model="form.password"
                type="password"
                required
                autocomplete="new-password"
                placeholder="Masukkan password server"
              />
              <small class="security-hint">Password tidak akan ditampilkan kembali setelah disimpan.</small>
              <small v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password[0] }}</small>
            </label>

            <template v-else>
              <label class="field full">
                <span>Private Key <b>*</b></span>
                <textarea
                  v-model="form.private_key"
                  required
                  rows="7"
                  spellcheck="false"
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                />
                <small>Masukkan private key lengkap. Jangan pernah membagikannya melalui chat atau tiket.</small>
                <small v-if="fieldErrors.private_key" class="field-error">{{ fieldErrors.private_key[0] }}</small>
              </label>

              <label class="field full">
                <span>Private Key Passphrase</span>
                <input
                  v-model="form.private_key_passphrase"
                  type="password"
                  autocomplete="new-password"
                  placeholder="Opsional"
                />
              </label>
            </template>
          </div>
        </section>

        <section class="form-section">
          <div class="section-title">
            <span>03</span>
            <div>
              <h2>Security & Notes</h2>
              <p>Pengaturan tambahan untuk server ini.</p>
            </div>
          </div>

          <label v-if="form.connection_protocol !== 'winrm'" class="checkbox-field">
            <input v-model="form.verify_host_key" type="checkbox" />
            <span>
              <strong>Require host key verification</strong>
              <small>Identitas SSH server harus diverifikasi sebelum koneksi. Jangan menonaktifkannya pada lingkungan produksi.</small>
            </span>
          </label>

          <label class="field full notes-field">
            <span>Notes</span>
            <textarea v-model="form.notes" rows="3" placeholder="Catatan tentang server ini (opsional)" />
          </label>
        </section>

        <div v-if="errorMessage" class="alert" role="alert">
          {{ errorMessage }}
        </div>

        <div class="form-footer">
          <NuxtLink to="/servers" class="cancel-button">Cancel</NuxtLink>
          <button type="submit" class="submit-button" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Server →' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--app-bg); color: var(--text); }
.topbar { padding: 20px 36px; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-bottom: 1px solid var(--border-subtle); background: var(--surface); }
.breadcrumb { color: var(--text-muted); font-size: 12px; font-weight: 500; margin-bottom: 6px; }
h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-bright, var(--text)); }
.topbar p { margin: 6px 0 0; color: var(--text-secondary); font-size: 13.5px; }
.back-button { display: inline-flex; align-items: center; gap: 6px; padding: 9px 15px; border: 1px solid var(--border-strong); border-radius: 9px; background: var(--surface-muted); color: var(--text); text-decoration: none; font-size: 13px; font-weight: 600; transition: border-color 0.15s ease, background 0.15s ease; flex: none; }
.back-button:hover { border-color: var(--primary-text, #38bdf8); }

.content { max-width: 960px; margin: 0 auto; padding: 28px 24px 64px; }
.form-card { border: 1px solid var(--border); border-radius: 16px; background: var(--surface); box-shadow: 0 12px 32px rgba(2, 6, 23, 0.16); overflow: hidden; }
.form-section { padding: 28px 30px; border-bottom: 1px solid var(--border-subtle); }
.form-section:last-of-type { border-bottom: 0; }

.section-title { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 22px; }
.section-title > span { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 32px; border-radius: 9px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.12); color: var(--primary-text, #38bdf8); font-size: 12px; font-weight: 800; flex: none; }
.section-title h2 { margin: 0; font-size: 16.5px; font-weight: 700; color: var(--text-bright, var(--text)); }
.section-title p { margin: 4px 0 0; color: var(--text-secondary); font-size: 13px; }

.fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 20px; }
.field { min-width: 0; display: flex; flex-direction: column; gap: 7px; }
.field.full { grid-column: 1 / -1; }
.field > span,
.field-label-row > span { color: var(--text-soft, var(--text)); font-size: 12.5px; font-weight: 600; }
.field b { color: #ef4444; }
.field-label-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }

.os-guide-link { display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px; border-radius: 999px; border: 1px solid rgba(56, 189, 248, 0.35); background: rgba(56, 189, 248, 0.1); font-size: 11.5px; font-weight: 600; color: var(--primary-text, #0284c7); text-decoration: none; transition: background 0.15s ease; }
.os-guide-link:hover { background: rgba(56, 189, 248, 0.2); }

.field input,
.field select,
.field textarea { width: 100%; min-width: 0; padding: 11px 13px; border: 1px solid var(--border-strong); border-radius: 10px; outline: none; background: var(--surface-muted); color: var(--text); font: inherit; font-size: 13.5px; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
.field textarea { resize: vertical; line-height: 1.6; min-height: 92px; }
.field input:focus,
.field select:focus,
.field textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18); }
.field small { color: var(--text-muted); font-size: 11.5px; line-height: 1.5; }
.field-error { color: var(--danger-text) !important; font-weight: 600; }
.security-hint { color: var(--success-text) !important; font-weight: 500; }

.checkbox-field { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 18px; padding: 14px 16px; border: 1px solid var(--border); border-radius: 11px; background: var(--surface-muted); cursor: pointer; transition: border-color 0.15s ease; }
.checkbox-field:hover { border-color: var(--primary-text, #38bdf8); }
.checkbox-field input { width: 17px; height: 17px; margin-top: 2px; accent-color: #2563eb; flex: none; cursor: pointer; }
.checkbox-field strong,
.checkbox-field small { display: block; }
.checkbox-field strong { font-size: 13px; font-weight: 600; color: var(--text-bright, var(--text)); }
.checkbox-field small { max-width: 680px; margin-top: 4px; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }

.notes-field { margin-top: 6px; }
.alert { margin: 20px 30px 0; padding: 13px 16px; border: 1px solid var(--danger-border); border-radius: 10px; background: var(--danger-bg); color: var(--danger-text); font-size: 13px; font-weight: 500; }

.form-footer { display: flex; justify-content: flex-end; align-items: center; gap: 12px; padding: 20px 30px; background: var(--surface-muted); border-top: 1px solid var(--border-subtle); }
.cancel-button,
.submit-button { display: inline-flex; align-items: center; justify-content: center; padding: 11px 20px; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.15s ease, transform 0.15s ease, background 0.15s ease; }
.cancel-button { border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); }
.cancel-button:hover { border-color: var(--text-secondary); }
.submit-button { border: 0; background: linear-gradient(135deg, #2563eb, #0284c7); color: #ffffff; box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25); }
.submit-button:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.95; }
.submit-button:disabled { opacity: 0.55; cursor: wait; }

:global(html[data-theme="light"]) .form-card { box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06); }
:global(html[data-theme="light"]) .os-guide-link { color: #0369a1; border-color: rgba(2, 132, 199, 0.35); background: rgba(2, 132, 199, 0.08); }

@media (max-width: 720px) {
  .topbar { padding: 18px 16px; align-items: flex-start; flex-direction: column; }
  .content { padding: 16px 12px 44px; }
  .form-section { padding: 20px 16px; }
  .fields { grid-template-columns: 1fr; gap: 15px; }
  .field.full { grid-column: auto; }
  .form-footer { padding: 16px; flex-direction: column-reverse; align-items: stretch; }
  .cancel-button, .submit-button { width: 100%; }
}
</style>
