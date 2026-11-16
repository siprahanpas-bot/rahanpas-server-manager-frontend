<script setup lang="ts">
const me = ref<any>(null)
const roles = ref<any[]>([])
const permissions = ref<any[]>([])
const loading = ref(true)
const errorMsg = ref('')
const successMsg = ref('')

const modalOpen = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  slug: '',
  description: '',
  permission_ids: [] as number[],
})

async function loadData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res: any = await $fetch('/manager-api/admin/roles')
    roles.value = res.roles || []
    permissions.value = res.permissions || []
  } catch (e: any) {
    if (e.statusCode === 401) return navigateTo('/')
    errorMsg.value = e.data?.message || e.statusMessage || 'Gagal memuat roles.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    me.value = await $fetch('/auth/me')
    if (!me.value?.is_super_admin && !me.value?.permissions?.includes('roles.manage')) {
      return navigateTo('/dashboard')
    }
    await loadData()
  } catch {
    await navigateTo('/')
  }
})

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', slug: '', description: '', permission_ids: [] })
  modalOpen.value = true
}

function openEdit(r: any) {
  editingId.value = r.id
  Object.assign(form, {
    name: r.name,
    slug: r.slug,
    description: r.description || '',
    permission_ids: (r.permissions || []).map((p: any) => p.id),
  })
  modalOpen.value = true
}

async function saveRole() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    if (editingId.value) {
      const res: any = await $fetch(`/manager-api/admin/roles/${editingId.value}`, { method: 'PUT', body: form })
      successMsg.value = res.message
    } else {
      const res: any = await $fetch('/manager-api/admin/roles', { method: 'POST', body: form })
      successMsg.value = res.message
    }
    modalOpen.value = false
    await loadData()
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.statusMessage || 'Gagal menyimpan role.'
  } finally {
    saving.value = false
  }
}

async function deleteRole(r: any) {
  if (!confirm(`Hapus role ${r.name}?`)) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res: any = await $fetch(`/manager-api/admin/roles/${r.id}`, { method: 'DELETE' })
    successMsg.value = res.message
    await loadData()
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.statusMessage || 'Gagal menghapus role.'
  }
}
</script>

<template>
  <AdminShell title="Role Management" breadcrumb="Administration / Roles" active-menu="roles" :user="me">
    <section class="adm-card">
      <div class="adm-toolbar">
        <div style="font-size: 13px; color: var(--text-secondary);">Buat role dan hubungkan dengan daftar permission.</div>
        <button type="button" class="adm-btn adm-btn-primary" @click="openCreate">+ Add Role</button>
      </div>
      <div v-if="errorMsg" class="adm-alert">{{ errorMsg }}</div>
      <div v-if="successMsg" class="adm-success">{{ successMsg }}</div>

      <div v-if="loading" class="adm-empty">Memuat daftar role...</div>
      <div v-else class="adm-table-wrap">
        <table class="adm-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Permissions</th>
              <th>Groups</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in roles" :key="r.id">
              <td>
                <strong style="color: var(--text-bright); display:block;">{{ r.name }}</strong>
                <small style="color: var(--text-muted);">{{ r.slug }} · {{ r.description || '-' }}</small>
              </td>
              <td>
                <span v-for="p in (r.permissions || []).slice(0, 6)" :key="p.id" class="adm-badge">{{ p.slug }}</span>
                <span v-if="(r.permissions || []).length > 6" class="adm-badge super">+{{ r.permissions.length - 6 }} lainnya</span>
              </td>
              <td>{{ r.groups_count }} group</td>
              <td>
                <div class="adm-actions">
                  <button v-if="r.slug !== 'super-administrator'" type="button" class="adm-link" @click="openEdit(r)">Edit</button>
                  <button v-if="r.slug !== 'super-administrator'" type="button" class="adm-link danger" @click="deleteRole(r)">Hapus</button>
                  <span v-if="r.slug === 'super-administrator'" class="adm-badge">Protected</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="modalOpen" class="adm-modal-overlay" @click.self="modalOpen = false">
        <form class="adm-modal" @submit.prevent="saveRole">
          <div class="adm-modal-head">
            <h2>{{ editingId ? 'Edit Role' : 'Tambah Role' }}</h2>
            <button type="button" class="adm-btn" @click="modalOpen = false">✕</button>
          </div>
          <div class="adm-form-grid">
            <label class="adm-field"><span>Nama Role</span><input v-model="form.name" class="adm-input" required></label>
            <label class="adm-field"><span>Slug (opsional)</span><input v-model="form.slug" class="adm-input" placeholder="otomatis dari nama"></label>
            <label class="adm-field full"><span>Deskripsi</span><textarea v-model="form.description" class="adm-textarea" rows="2" /></label>
            <div class="adm-field full">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>Permissions</span>
                <div style="display:flex; gap:8px;">
                  <button type="button" class="adm-link" @click="form.permission_ids = permissions.map((p: any) => p.id)">Pilih Semua</button>
                  <button type="button" class="adm-link" @click="form.permission_ids = []">Kosongkan</button>
                </div>
              </div>
              <div class="adm-check-grid">
                <label v-for="p in permissions" :key="p.id" class="adm-check-item">
                  <input v-model="form.permission_ids" type="checkbox" :value="p.id">
                  <span><code>{{ p.slug }}</code></span>
                </label>
              </div>
            </div>
          </div>
          <div class="adm-modal-foot">
            <button type="button" class="adm-btn" @click="modalOpen = false">Batal</button>
            <button type="submit" class="adm-btn adm-btn-primary" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </Teleport>
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
</style>
