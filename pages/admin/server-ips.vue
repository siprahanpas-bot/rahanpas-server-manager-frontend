<script setup lang="ts">
const me = ref<any>(null)
const items = ref<any[]>([])
const users = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterUserId = ref('')
const errorMsg = ref('')
const successMsg = ref('')

const modalOpen = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  user_id: '' as number | '',
  ip_address: '',
  access_type: 'permanent' as 'permanent' | 'timed' | 'inactive',
  expires_at: '',
  notes: '',
})

async function loadData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res: any = await $fetch('/manager-api/admin/allowed-ips', {
      query: {
        search: search.value || undefined,
        user_id: filterUserId.value || undefined,
      }
    })
    items.value = res.items || []
    users.value = res.users || []
  } catch (e: any) {
    if (e.statusCode === 401) return navigateTo('/')
    errorMsg.value = e.data?.message || e.statusMessage || 'Gagal memuat daftar IP server.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    me.value = await $fetch('/auth/me')
    if (!me.value?.is_super_admin && !me.value?.permissions?.includes('users.manage')) {
      return navigateTo('/dashboard')
    }
    await loadData()
  } catch {
    await navigateTo('/')
  }
})

function openCreate() {
  editingId.value = null
  Object.assign(form, {
    user_id: users.value[0]?.id || '',
    ip_address: '',
    access_type: 'permanent',
    expires_at: '',
    notes: '',
  })
  modalOpen.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  const localDt = row.expires_at ? new Date(row.expires_at).toISOString().slice(0, 16) : ''
  Object.assign(form, {
    user_id: row.user_id,
    ip_address: row.ip_address,
    access_type: row.access_type,
    expires_at: localDt,
    notes: row.notes || '',
  })
  modalOpen.value = true
}

async function saveRule() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const payload = {
      user_id: Number(form.user_id),
      ip_address: form.ip_address.trim(),
      access_type: form.access_type,
      expires_at: form.access_type === 'timed' ? form.expires_at : null,
      notes: form.notes || null,
    }
    if (editingId.value) {
      const res: any = await $fetch(`/manager-api/admin/allowed-ips/${editingId.value}`, { method: 'PUT', body: payload })
      successMsg.value = res.message
    } else {
      const res: any = await $fetch('/manager-api/admin/allowed-ips', { method: 'POST', body: payload })
      successMsg.value = res.message
    }
    modalOpen.value = false
    await loadData()
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.statusMessage || 'Gagal menyimpan aturan IP.'
  } finally {
    saving.value = false
  }
}

async function deleteRule(row: any) {
  if (!confirm(`Hapus izin IP ${row.ip_address} untuk ${row.user?.email}?`)) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res: any = await $fetch(`/manager-api/admin/allowed-ips/${row.id}`, { method: 'DELETE' })
    successMsg.value = res.message
    await loadData()
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.statusMessage || 'Gagal menghapus aturan IP.'
  }
}
</script>

<template>
  <AdminShell title="Server IP Access" breadcrumb="Administration / Server IP Access" active-menu="server-ips" :user="me">
    <section class="ip-card">
      <div class="ip-toolbar">
        <div class="ip-filters">
          <input v-model="search" class="ip-input" placeholder="Cari IP atau email user..." @keyup.enter="loadData">
          <select v-model="filterUserId" class="ip-select" @change="loadData">
            <option value="">Semua User</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
          </select>
          <button type="button" class="ip-btn" @click="loadData">Filter</button>
        </div>
        <button type="button" class="ip-btn ip-btn-primary" @click="openCreate">+ Tambah Izin IP</button>
      </div>

      <div v-if="errorMsg" class="ip-alert">{{ errorMsg }}</div>
      <div v-if="successMsg" class="ip-success">{{ successMsg }}</div>

      <div v-if="loading" class="ip-empty">Memuat daftar IP yang diizinkan...</div>
      <div v-else-if="items.length === 0" class="ip-empty">Belum ada IP yang didaftarkan.</div>
      <div v-else class="ip-table-wrap">
        <table class="ip-table">
          <thead>
            <tr>
              <th>User</th>
              <th>IP Address</th>
              <th>Status / Masa Aktif</th>
              <th>Catatan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.id">
              <td>
                <strong style="color: var(--text-bright); display:block;">{{ row.user?.name }}</strong>
                <small style="color: var(--text-muted);">{{ row.user?.email }}</small>
              </td>
              <td><code class="ip-code">{{ row.ip_address }}</code></td>
              <td>
                <span class="ip-badge" :class="row.effective_status">
                  {{ row.effective_label }}
                </span>
              </td>
              <td>{{ row.notes || '-' }}</td>
              <td>
                <div style="display:flex; gap:10px;">
                  <button type="button" class="ip-link" @click="openEdit(row)">Edit</button>
                  <button type="button" class="ip-link danger" @click="deleteRule(row)">Hapus</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="modalOpen" class="ip-modal-overlay" @click.self="modalOpen = false">
        <form class="ip-modal" @submit.prevent="saveRule">
          <div class="ip-modal-head">
            <h2>{{ editingId ? 'Edit Izin IP Server' : 'Tambah Izin IP Server' }}</h2>
            <button type="button" class="ip-btn" @click="modalOpen = false">✕</button>
          </div>
          <div class="ip-form-grid">
            <label class="ip-field full">
              <span>User</span>
              <select v-model="form.user_id" class="ip-select" required>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
              </select>
            </label>
            <label class="ip-field">
              <span>IP Address</span>
              <input v-model="form.ip_address" class="ip-input" placeholder="192.168.1.10" required>
            </label>
            <label class="ip-field">
              <span>Status Masa Aktif</span>
              <select v-model="form.access_type" class="ip-select" required>
                <option value="permanent">Aktif Permanen (Abadi)</option>
                <option value="timed">Masa Aktif (Berbatas Waktu)</option>
                <option value="inactive">Non Aktif</option>
              </select>
            </label>
            <label v-if="form.access_type === 'timed'" class="ip-field full">
              <span>Berlaku Sampai</span>
              <input v-model="form.expires_at" type="datetime-local" class="ip-input" required>
            </label>
            <label class="ip-field full">
              <span>Catatan (Opsional)</span>
              <input v-model="form.notes" class="ip-input" placeholder="Contoh: VPS Client A">
            </label>
          </div>
          <div class="ip-modal-foot">
            <button type="button" class="ip-btn" @click="modalOpen = false">Batal</button>
            <button type="submit" class="ip-btn ip-btn-primary" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </Teleport>
  </AdminShell>
</template>

<style scoped>
.ip-card { border: 1px solid var(--border); border-radius: 14px; background: var(--surface); overflow: hidden; }
.ip-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; }
.ip-filters { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1; }
.ip-input, .ip-select { padding: 9px 12px; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--surface-muted); color: var(--text-bright); font-size: 12px; outline: none; }
.ip-btn { padding: 9px 14px; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--surface-raised); color: var(--text); font-size: 12px; font-weight: 600; cursor: pointer; }
.ip-btn-primary { border-color: var(--primary); background: var(--primary); color: #fff; }
.ip-table-wrap { width: 100%; overflow-x: auto; }
.ip-table { width: 100%; min-width: 680px; border-collapse: collapse; font-size: 12px; text-align: left; }
.ip-table th { padding: 11px 16px; background: var(--surface-muted); color: var(--text-secondary); font-size: 11px; font-weight: 700; border-bottom: 1px solid var(--border); }
.ip-table td { padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); color: var(--text-soft); vertical-align: middle; }
.ip-code { padding: 3px 8px; border-radius: 6px; background: var(--surface-muted); border: 1px solid var(--border); font-size: 12px; color: var(--text-bright); }
.ip-badge { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 700; }
.ip-badge.permanent { background: rgba(59,130,246,0.16); color: var(--primary-text); }
.ip-badge.timed { background: var(--success-bg); color: var(--success-text); }
.ip-badge.expired { background: rgba(245,158,11,0.16); color: var(--warning-text); }
.ip-badge.inactive { background: var(--danger-bg); color: var(--danger-text); }
.ip-link { border: 0; background: transparent; padding: 2px 4px; color: var(--primary-text); font-size: 11px; font-weight: 600; cursor: pointer; }
.ip-link.danger { color: var(--danger-text); }
.ip-alert { margin: 14px 20px; padding: 11px 14px; border-radius: 10px; font-size: 12px; border: 1px solid var(--danger-border); background: var(--danger-bg); color: var(--danger-text); }
.ip-success { margin: 14px 20px; padding: 11px 14px; border-radius: 10px; font-size: 12px; border: 1px solid rgba(34,197,94,0.35); background: var(--success-bg); color: var(--success-text); }
.ip-empty { padding: 36px 20px; text-align: center; color: var(--text-muted); font-size: 13px; }
.ip-modal-overlay { position: fixed; inset: 0; z-index: 1200; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(2,6,23,0.72); backdrop-filter: blur(4px); }
.ip-modal { width: 100%; max-width: 520px; padding: 22px; border: 1px solid var(--border-strong); border-radius: 16px; background: var(--surface); color: var(--text); display: flex; flex-direction: column; gap: 14px; }
.ip-modal-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle); }
.ip-modal-head h2 { margin: 0; font-size: 16px; color: var(--text-bright); }
.ip-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.ip-field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
.ip-field.full { grid-column: 1 / -1; }
.ip-field > span { font-weight: 600; color: var(--text-soft); }
.ip-modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding-top: 12px; border-top: 1px solid var(--border-subtle); }
@media (max-width: 640px) { .ip-form-grid { grid-template-columns: 1fr; } }
</style>
