<script setup lang="ts">
const user = ref<any>(null)
const loading = ref(true)
const loggingOut = ref(false)
const mobileMenuOpen = ref(false)

function hasPerm(slug: string): boolean {
  if (user.value?.is_super_admin) return true
  const perms = user.value?.permissions
  return Array.isArray(perms) ? perms.includes(slug) : false
}

const servers = ref<any[]>([])
const serversLoading = ref(false)
const realtimeSyncing = ref(false)
const liveIntervalSec = ref(10)
const overviewSectionRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)
const netRates = ref<Record<number, { rxBps: number | null; txBps: number | null; prevRx: number; prevTx: number; prevTs: number }>>({})
let refreshTimer: ReturnType<typeof setInterval> | null = null

function updateNetworkRate(
  serverId: number,
  rxBytes: number,
  txBytes: number,
  collectedAt?: string | null
) {
  const parsedTs = collectedAt ? new Date(collectedAt).getTime() : NaN
  const sampleTs = Number.isFinite(parsedTs) ? parsedTs : Date.now()
  const prev = netRates.value[serverId]

  // Polling berulang atas snapshot yang sama tidak boleh mengubah throughput.
  if (prev && sampleTs <= prev.prevTs) return

  if (
    prev &&
    rxBytes >= prev.prevRx &&
    txBytes >= prev.prevTx
  ) {
    const dt = (sampleTs - prev.prevTs) / 1000

    netRates.value[serverId] = {
      rxBps: dt > 0 ? (rxBytes - prev.prevRx) / dt : prev.rxBps,
      txBps: dt > 0 ? (txBytes - prev.prevTx) / dt : prev.txBps,
      prevRx: rxBytes,
      prevTx: txBytes,
      prevTs: sampleTs,
    }
  } else {
    netRates.value[serverId] = {
      rxBps: null,
      txBps: null,
      prevRx: rxBytes,
      prevTx: txBytes,
      prevTs: sampleTs,
    }
  }
}

async function loadServers() {
  if (!hasPerm('server.view')) return
  serversLoading.value = true
  try {
    const res: any = await $fetch('/manager-api/servers')
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    servers.value = list
    for (const s of list) {
      if (s.latest_metric) {
        updateNetworkRate(
          s.id,
          Number(s.latest_metric.network_rx_bytes || 0),
          Number(s.latest_metric.network_tx_bytes || 0),
          s.latest_metric.collected_at
        )
      }
    }
  } catch {
    // Abaikan error sementara
  } finally {
    serversLoading.value = false
  }
}

async function refreshRealtimeAll() {
  if (!hasPerm('server.view') || realtimeSyncing.value || !servers.value.length) return

  realtimeSyncing.value = true

  try {
    await Promise.allSettled(
      servers.value.map(async (srv: any) => {
        try {
          const res: any = await $fetch(`/manager-api/servers/${srv.id}/monitoring`)
          const serverStatus = res?.server_status || res?.data?.server_status || {}
          const status = serverStatus.status

          // Status mengikuti record backend, bukan keberhasilan polling browser.
          if (['online', 'offline', 'error', 'unknown'].includes(status)) {
            srv.status = status
          }

          if (serverStatus.last_checked_at !== undefined) {
            srv.last_checked_at = serverStatus.last_checked_at
          }

          if (serverStatus.last_error !== undefined) {
            srv.last_error = serverStatus.last_error || null
          }

          const m = res?.metrics ?? res?.data?.metrics

          // Tidak ada snapshot baru: pertahankan metrik terakhir.
          if (!m || typeof m !== 'object') return

          const flat = {
            cpu_usage_percent: m.cpu?.usage_percent ?? 0,
            memory_usage_percent: m.memory?.usage_percent ?? 0,
            memory_used_mb: m.memory?.used_mb ?? 0,
            memory_total_mb: m.memory?.total_mb ?? 0,
            disk_usage_percent: m.disk?.usage_percent ?? 0,
            disk_used_gb: m.disk?.used_gb ?? 0,
            disk_total_gb: m.disk?.total_gb ?? 0,
            network_rx_bytes: m.network?.rx_bytes ?? 0,
            network_tx_bytes: m.network?.tx_bytes ?? 0,
            collected_at: m.collected_at || null,
          }

          srv.latest_metric = flat

          updateNetworkRate(
            srv.id,
            Number(flat.network_rx_bytes),
            Number(flat.network_tx_bytes),
            flat.collected_at
          )
        } catch {
          // Gangguan saat membaca API tidak mengubah status server.
        }
      })
    )
  } finally {
    realtimeSyncing.value = false
  }
}

function startRealtimeTimer() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  if (liveIntervalSec.value > 0) {
    refreshTimer = setInterval(() => {
      void refreshRealtimeAll()
    }, liveIntervalSec.value * 1000)
  }
}

watch(liveIntervalSec, () => {
  startRealtimeTimer()
})

async function toggleOverviewFullscreen() {
  if (!isFullscreen.value) {
    isFullscreen.value = true
    try {
      if (overviewSectionRef.value?.requestFullscreen) {
        await overviewSectionRef.value.requestFullscreen()
      }
    } catch {
      // Fallback ke CSS fixed fullscreen
    }
  } else {
    isFullscreen.value = false
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch {
      // Abaikan
    }
  }
}

function handleFullscreenChange() {
  if (!document.fullscreenElement && isFullscreen.value) {
    isFullscreen.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

const totalServersCount = computed(() => servers.value.length)
const onlineServersCount = computed(() => servers.value.filter((s: any) => s.status === 'online').length)
const serversWithMetrics = computed(() => servers.value.filter((s: any) => s.latest_metric))

const avgCpuUsage = computed(() => {
  const list = serversWithMetrics.value
  if (!list.length) return null
  const sum = list.reduce((acc: number, s: any) => acc + Number(s.latest_metric?.cpu_usage_percent || 0), 0)
  return Math.round((sum / list.length) * 10) / 10
})

const avgMemoryUsage = computed(() => {
  const list = serversWithMetrics.value
  if (!list.length) return null
  const sum = list.reduce((acc: number, s: any) => acc + Number(s.latest_metric?.memory_usage_percent || 0), 0)
  return Math.round((sum / list.length) * 10) / 10
})

function metricTone(pct: number | null | undefined): string {
  const val = Number(pct || 0)
  if (val >= 85) return 'critical'
  if (val >= 65) return 'warning'
  return 'healthy'
}

function formatMbPair(used: any, total: any): string {
  if (used === null || used === undefined || total === null || total === undefined) return '-'
  return `${Math.round(Number(used))} MB / ${Math.round(Number(total))} MB`
}

function formatGbPair(used: any, total: any): string {
  if (used === null || used === undefined || total === null || total === undefined) return '-'
  return `${Number(used).toFixed(2)} GB / ${Number(total).toFixed(2)} GB`
}

function formatBytesTotal(bytes: any): string {
  const b = Number(bytes || 0)
  if (b >= 1099511627776) return `${(b / 1099511627776).toFixed(2)} TB`
  if (b >= 1073741824) return `${(b / 1073741824).toFixed(2)} GB`
  if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`
  return `${(b / 1024).toFixed(0)} KB`
}

function formatSpeed(bps: number | null | undefined): string {
  if (bps === null || bps === undefined) return 'Live...'
  if (bps >= 1048576) return `${(bps / 1048576).toFixed(2)} MB/s`
  if (bps >= 1024) return `${(bps / 1024).toFixed(1)} KB/s`
  return `${Math.round(bps)} B/s`
}

onMounted(async () => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('keydown', handleKeydown)
  try {
    user.value = await $fetch('/auth/me')
    await loadServers()
    startRealtimeTimer()
    void refreshRealtimeAll()
  } catch {
    await navigateTo('/')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('keydown', handleKeydown)
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

async function logout() {
  loggingOut.value = true

  try {
    await $fetch('/auth/logout', {
      method: 'POST'
    })
  } finally {
    await navigateTo('/')
  }
}
</script>

<template>
  <main class="dashboard">
    <div
      v-if="mobileMenuOpen"
      class="sidebar-backdrop"
      @click="mobileMenuOpen = false"
    />

    <aside class="sidebar" :class="{ open: mobileMenuOpen }">
      <div class="sidebar-brand">
        <div class="logo">R</div>
        <div>
          <strong>RAHANPAS</strong>
          <small>SERVER MANAGER</small>
        </div>
        <button
          class="sidebar-close"
          type="button"
          aria-label="Close menu"
          @click="mobileMenuOpen = false"
        >
          ✕
        </button>
      </div>

      <div class="nav-label">MAIN MENU</div>

      <div class="nav-item active" @click="mobileMenuOpen = false">
        <span>▦</span>
        Overview
      </div>

      <NuxtLink v-if="hasPerm('server.view')" to="/servers" class="nav-item" @click="mobileMenuOpen = false">
        <span>▣</span>
        Servers
      </NuxtLink>

      <template v-if="hasPerm('users.view') || hasPerm('users.manage') || hasPerm('groups.manage') || hasPerm('roles.manage') || hasPerm('permissions.manage')">
        <div class="nav-label" style="margin-top: 10px;">ADMINISTRATION</div>

        <NuxtLink v-if="hasPerm('users.view') || hasPerm('users.manage')" to="/admin/users" class="nav-item" @click="mobileMenuOpen = false">
          <span>◎</span>
          User Management
        </NuxtLink>

        <NuxtLink v-if="hasPerm('users.manage')" to="/admin/server-ips" class="nav-item" @click="mobileMenuOpen = false">
          <span>⛨</span>
          Server IP Access
        </NuxtLink>

        <NuxtLink v-if="hasPerm('groups.manage')" to="/admin/groups" class="nav-item" @click="mobileMenuOpen = false">
          <span>◈</span>
          Group Management
        </NuxtLink>

        <NuxtLink v-if="hasPerm('roles.manage')" to="/admin/roles" class="nav-item" @click="mobileMenuOpen = false">
          <span>◆</span>
          Role Management
        </NuxtLink>

        <NuxtLink v-if="hasPerm('permissions.manage')" to="/admin/permissions" class="nav-item" @click="mobileMenuOpen = false">
          <span>⌘</span>
          Permission Management
        </NuxtLink>
      </template>

      <div class="nav-label" style="margin-top: 10px;">ACCOUNT</div>

      <NuxtLink to="/account/settings" class="nav-item" @click="mobileMenuOpen = false">
        <span>⚙</span>
        User Settings
      </NuxtLink>

      <div class="sidebar-bottom">
        <div class="connection"><span></span> Application online</div>
        <small>RAHANPAS SERVER MANAGER<br />Version 1.0.0</small>
      </div>
    </aside>

    <section class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <button
            class="menu-toggle"
            type="button"
            aria-label="Open menu"
            @click="mobileMenuOpen = true"
          >
            ☰
          </button>
          <div>
            <div class="breadcrumb">Workspace / Overview</div>
            <h1>Dashboard</h1>
          </div>
        </div>

        <div class="user-area">
          <div class="avatar">
            {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="user-info">
            <strong>{{ user?.name || 'Loading...' }}</strong>
            <small>{{ user?.email || '' }}</small>
          </div>
          <button
            class="logout-button"
            :disabled="loggingOut"
            @click="logout"
          >
            {{ loggingOut ? 'Signing out...' : 'Sign out' }}
          </button>
        </div>
      </header>

      <div v-if="loading" class="loading">
        Memuat informasi akun...
      </div>

      <template v-else>
        <section class="welcome">
          <div>
            <div class="welcome-label">INFRASTRUCTURE CONTROL CENTER</div>
            <h2>Welcome back, {{ user?.name }}.</h2>
            <p>
              Kelola dan pantau seluruh infrastruktur server Anda
              dari satu dashboard terpusat.
            </p>
          </div>
          <div class="welcome-symbol">R</div>
        </section>

        <div class="section-heading">
          <div>
            <h2>Infrastructure Overview</h2>
            <p>Ringkasan platform manajemen server.</p>
          </div>
          <span class="status-badge"><i></i> Platform online</span>
        </div>

        <section class="stats-grid">
          <article class="stat-card">
            <div class="stat-icon blue">▣</div>
            <span>Total Servers</span>
            <strong>{{ totalServersCount }}</strong>
            <small>{{ totalServersCount ? `${totalServersCount} server terdaftar` : 'Belum ada server terdaftar' }}</small>
          </article>

          <article class="stat-card">
            <div class="stat-icon cyan">◉</div>
            <span>Online Servers</span>
            <strong>{{ onlineServersCount }}</strong>
            <small>{{ totalServersCount ? `${onlineServersCount} dari ${totalServersCount} aktif` : 'Menunggu koneksi server' }}</small>
          </article>

          <article class="stat-card">
            <div class="stat-icon purple">▥</div>
            <span>Avg CPU Usage</span>
            <strong>{{ avgCpuUsage !== null ? `${avgCpuUsage}%` : '--' }}</strong>
            <small>{{ serversWithMetrics.length ? `Rata-rata ${serversWithMetrics.length} server` : 'Belum tersedia data monitoring' }}</small>
          </article>

          <article class="stat-card">
            <div class="stat-icon green">▤</div>
            <span>Avg Memory Usage</span>
            <strong>{{ avgMemoryUsage !== null ? `${avgMemoryUsage}%` : '--' }}</strong>
            <small>{{ serversWithMetrics.length ? `Rata-rata ${serversWithMetrics.length} server` : 'Belum tersedia data monitoring' }}</small>
          </article>
        </section>

                <section
          ref="overviewSectionRef"
          class="server-section"
          :class="{ 'is-overview-fullscreen': isFullscreen }"
        >
          <div class="server-section-head">
            <div>
              <div class="section-title-live">
                <h2>Server Monitoring Overview</h2>
                <span class="live-indicator" :class="{ active: liveIntervalSec > 0 }">
                  <i></i> {{ liveIntervalSec > 0 ? `LIVE · ${liveIntervalSec}s` : 'MANUAL' }}
                </span>
              </div>
              <p>Monitoring realtime CPU Usage, Memory Usage, Root Disk, dan Network I/O tiap server.</p>
            </div>
            <div class="overview-toolbar">
              <div class="overview-intervals" role="group" aria-label="Realtime interval">
                <button
                  v-for="sec in [0, 5, 10, 30]"
                  :key="sec"
                  type="button"
                  :class="{ active: liveIntervalSec === sec }"
                  @click="liveIntervalSec = sec"
                >
                  {{ sec === 0 ? 'Off' : `${sec}s` }}
                </button>
              </div>
              <button
                type="button"
                class="refresh-overview-btn"
                :disabled="serversLoading || realtimeSyncing"
                @click="refreshRealtimeAll"
              >
                {{ realtimeSyncing ? 'Syncing...' : 'Refresh' }}
              </button>
              <button
                type="button"
                class="refresh-overview-btn fullscreen-btn"
                @click="toggleOverviewFullscreen"
              >
                {{ isFullscreen ? '✕ Exit Full Screen' : '⛶ Full Screen' }}
              </button>
            </div>
          </div>

          <div v-if="servers.length" class="overview-server-grid">
            <article v-for="srv in servers" :key="srv.id" class="overview-server-card">
              <div class="osc-header">
                <div class="osc-title-wrap">
                  <div class="osc-title-row">
                    <strong>{{ srv.name }}</strong>
                    <span class="osc-os-pill">{{ srv.os_type === 'linux' ? '🐧 Linux' : '▣ Windows' }}</span>
                  </div>
                  <small>{{ srv.ip_address || srv.hostname }} · {{ String(srv.connection_protocol || '').toUpperCase() }}</small>
                </div>
                <span class="osc-status" :class="`is-${srv.status || 'unknown'}`">
                  <i></i> {{ srv.status || 'unknown' }}
                </span>
              </div>

              <div v-if="srv.latest_metric" class="osc-metrics-wrap">
                <div class="osc-metrics">
                  <div class="osc-metric-row">
                    <div class="osc-metric-head">
                      <span>CPU USAGE</span>
                      <strong :class="metricTone(srv.latest_metric.cpu_usage_percent)">
                        {{ Number(srv.latest_metric.cpu_usage_percent || 0).toFixed(2) }}%
                      </strong>
                    </div>
                    <div class="osc-bar-track">
                      <div
                        class="osc-bar-fill"
                        :class="metricTone(srv.latest_metric.cpu_usage_percent)"
                        :style="{ width: `${Math.min(100, Math.max(0, Number(srv.latest_metric.cpu_usage_percent || 0)))}%` }"
                      ></div>
                    </div>
                    <small class="osc-metric-sub">Processor load</small>
                  </div>

                  <div class="osc-metric-row">
                    <div class="osc-metric-head">
                      <span>MEMORY USAGE</span>
                      <strong :class="metricTone(srv.latest_metric.memory_usage_percent)">
                        {{ Number(srv.latest_metric.memory_usage_percent || 0).toFixed(2) }}%
                      </strong>
                    </div>
                    <div class="osc-bar-track">
                      <div
                        class="osc-bar-fill"
                        :class="metricTone(srv.latest_metric.memory_usage_percent)"
                        :style="{ width: `${Math.min(100, Math.max(0, Number(srv.latest_metric.memory_usage_percent || 0)))}%` }"
                      ></div>
                    </div>
                    <small class="osc-metric-sub">
                      {{ formatMbPair(srv.latest_metric.memory_used_mb, srv.latest_metric.memory_total_mb) }}
                    </small>
                  </div>

                  <div class="osc-metric-row">
                    <div class="osc-metric-head">
                      <span>ROOT DISK</span>
                      <strong :class="metricTone(srv.latest_metric.disk_usage_percent)">
                        {{ Number(srv.latest_metric.disk_usage_percent || 0).toFixed(1) }}%
                      </strong>
                    </div>
                    <div class="osc-bar-track">
                      <div
                        class="osc-bar-fill"
                        :class="metricTone(srv.latest_metric.disk_usage_percent)"
                        :style="{ width: `${Math.min(100, Math.max(0, Number(srv.latest_metric.disk_usage_percent || 0)))}%` }"
                      ></div>
                    </div>
                    <small class="osc-metric-sub">
                      {{ formatGbPair(srv.latest_metric.disk_used_gb, srv.latest_metric.disk_total_gb) }}
                    </small>
                  </div>
                </div>

                <div class="osc-network-grid">
                  <div class="osc-net-box is-rx">
                    <span class="osc-net-label">↓ Network Download</span>
                    <div class="osc-net-vals">
                      <strong>{{ formatSpeed(netRates[srv.id]?.rxBps) }}</strong>
                      <small>Total {{ formatBytesTotal(srv.latest_metric.network_rx_bytes) }}</small>
                    </div>
                  </div>
                  <div class="osc-net-box is-tx">
                    <span class="osc-net-label">↑ Network Upload</span>
                    <div class="osc-net-vals">
                      <strong>{{ formatSpeed(netRates[srv.id]?.txBps) }}</strong>
                      <small>Total {{ formatBytesTotal(srv.latest_metric.network_tx_bytes) }}</small>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="osc-empty">
                Belum ada snapshot monitoring untuk server ini.
              </div>

              <div class="osc-footer">
                <small v-if="srv.latest_metric?.collected_at">
                  Update: {{ new Date(srv.latest_metric.collected_at).toLocaleString('id-ID') }}
                </small>
                <small v-else>-</small>
                <NuxtLink :to="`/servers/${srv.id}`" class="osc-link">
                  Detail Server →
                </NuxtLink>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">▣</div>
            <strong>No servers registered yet</strong>
            <p>
              Server inventory akan muncul di sini setelah
              server pertama berhasil ditambahkan.
            </p>
          </div>
        </section>
      </template>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  background: var(--app-bg);
  color: var(--text);
}

.sidebar {
  min-height: 100vh;
  padding: 25px 17px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-subtle);
  background: #0c1423;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 9px 35px;
}

.logo, .avatar {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  color: white;
  font-size: 20px;
  font-weight: 800;
}

.sidebar-brand strong {
  display: block;
  font-size: 12px;
  letter-spacing: .13em;
}

.sidebar-brand small {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
  letter-spacing: .12em;
}

.nav-label {
  padding: 8px 11px 13px;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .15em;
}

.nav-item { text-decoration: none;
  min-height: 43px;
  margin: 3px 0;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 12px;
}

.nav-item > span {
  width: 17px;
  color: var(--text-muted);
  font-size: 16px;
}

.nav-item.active {
  background: rgba(37,99,235,.15);
  color: var(--primary-soft-text);
}

.nav-item.active > span {
  color: var(--primary-text);
}

.nav-item small {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 8px;
}

.sidebar-bottom {
  margin-top: auto;
  padding: 18px 9px 4px;
  border-top: 1px solid var(--border-subtle);
}

.connection {
  margin-bottom: 15px;
  color: var(--success-text);
  font-size: 10px;
}

.connection span, .status-badge i {
  width: 7px;
  height: 7px;
  display: inline-block;
  margin-right: 7px;
  border-radius: 50%;
  background: #22c55e;
}

.sidebar-bottom > small {
  color: var(--text-muted);
  font-size: 9px;
  line-height: 1.8;
}

.main-area {
  min-width: 0;
  padding: 0 36px 45px;
}

.topbar {
  min-height: 88px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.breadcrumb {
  margin-bottom: 6px;
  color: var(--text-muted);
  font-size: 10px;
}

.topbar h1 {
  margin: 0;
  font-size: 21px;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 11px;
}

.avatar {
  width: 35px;
  height: 35px;
  font-size: 14px;
}

.user-info strong, .user-info small {
  display: block;
}

.user-info strong {
  font-size: 11px;
}

.user-info small {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 10px;
}

.logout-button {
  margin-left: 10px;
  padding: 9px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 7px;
  background: transparent;
  color: var(--text-soft);
  font-size: 10px;
  cursor: pointer;
}

.logout-button:disabled {
  opacity: .5;
}

.welcome {
  min-height: 180px;
  margin-top: 28px;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  border: 1px solid rgba(59,130,246,.2);
  border-radius: 13px;
  background:
    radial-gradient(ellipse at 85% 20%, rgba(37,99,235,.24), transparent 48%),
    linear-gradient(110deg, var(--surface-raised), #101a2c);
}

.welcome-label {
  color: var(--primary-text);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .15em;
}

.welcome h2 {
  margin: 13px 0 8px;
  font-size: clamp(20px, 3vw, 28px);
}

.welcome p, .section-heading p, .server-section > div:first-child p {
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.7;
}

.welcome-symbol {
  padding-right: 35px;
  color: rgba(96,165,250,.13);
  font-size: 110px;
  font-weight: 900;
}

.section-heading {
  margin: 32px 0 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.section-heading h2, .server-section h2 {
  margin: 0;
  font-size: 15px;
}

.section-heading p, .server-section > div:first-child p {
  margin: 6px 0 0;
}

.status-badge {
  color: var(--success-text);
  font-size: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  min-height: 150px;
  padding: 17px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.stat-icon {
  width: 30px;
  height: 30px;
  margin-bottom: 13px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  font-size: 15px;
}

.blue { background: #172d52; color: var(--primary-text); }
.cyan { background: #123443; color: #67e8f9; }
.purple { background: #30234b; color: #c4b5fd; }
.green { background: var(--success-bg); color: #6ee7b7; }

.stat-card > span, .stat-card > strong, .stat-card > small {
  display: block;
}

.stat-card > span {
  color: var(--text-secondary);
  font-size: 10px;
}

.stat-card > strong {
  margin: 8px 0;
  font-size: 25px;
}

.stat-card > small {
  color: var(--text-muted);
  font-size: 9px;
}

.server-section {
  margin-top: 30px;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.empty-state {
  min-height: 190px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon {
  margin-bottom: 12px;
  color: var(--text-muted);
  font-size: 30px;
}

.empty-state strong {
  font-size: 12px;
}

.empty-state p {
  max-width: 350px;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.7;
}

.loading {
  padding: 60px 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.menu-toggle,
.sidebar-close {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border, var(--border-strong));
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
}

.sidebar-close {
  margin-left: auto;
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .menu-toggle,
  .sidebar-close {
    display: inline-flex;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(2, 6, 23, 0.6);
    backdrop-filter: blur(2px);
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 1000;
    width: 260px;
    max-width: 82vw;
    min-height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.22s ease;
    overflow-y: auto;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-area {
    padding: 0 20px 80px;
  }
}

@media (max-width: 640px) {
  .main-area {
    padding: 0 14px 80px;
  }

  .topbar {
    min-height: 68px;
    gap: 10px;
  }

  .user-info {
    display: none;
  }

  .logout-button {
    margin-left: 0;
    padding: 8px 10px;
  }

  .welcome {
    margin-top: 18px;
    padding: 20px;
  }

  .welcome-symbol {
    display: none;
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    min-height: auto;
    padding: 14px;
  }
}

@media (max-width: 420px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.server-section.is-overview-fullscreen { position: fixed; inset: 0; z-index: 9999; overflow-y: auto; padding: 24px 28px; margin: 0; border-radius: 0; background: var(--app-bg); color: var(--text); }
.server-section-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 16px; }
.section-title-live { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.server-section-head h2 { margin: 0; font-size: 17px; font-weight: 700; color: var(--text-bright, var(--text)); letter-spacing: -0.01em; }
.server-section-head p { margin: 4px 0 0; font-size: 12.5px; color: var(--text-secondary); }

.live-indicator { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; border: 1px solid var(--border); color: var(--text-secondary); background: var(--border-subtle, rgba(148, 163, 184, 0.1)); }
.live-indicator i { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted, #94a3b8); }
.live-indicator.active { color: var(--success-text, #22c55e); border-color: rgba(34, 197, 94, 0.4); background: rgba(34, 197, 94, 0.12); }
.live-indicator.active i { background: var(--success-text, #22c55e); box-shadow: 0 0 8px currentColor; }

.overview-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.overview-intervals { display: inline-flex; padding: 3px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-deep, rgba(15, 23, 42, 0.45)); }
.overview-intervals button { padding: 5px 9px; border: 0; border-radius: 6px; background: transparent; color: var(--text-secondary); font-size: 11px; font-weight: 600; cursor: pointer; }
.overview-intervals button.active { background: #0284c7; color: #ffffff; }

.refresh-overview-btn { padding: 7px 13px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-deep, transparent); color: var(--text); font-size: 12px; font-weight: 600; cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease; }
.refresh-overview-btn:hover:not(:disabled) { border-color: var(--primary-text, #38bdf8); background: rgba(56, 189, 248, 0.12); }
.refresh-overview-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.fullscreen-btn { border-color: var(--primary-text, #38bdf8); color: var(--primary-text, #38bdf8); }

.overview-server-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.overview-server-card { display: flex; flex-direction: column; gap: 14px; padding: 18px; border: 1px solid var(--border); border-radius: 14px; background: var(--surface-deep, rgba(15, 23, 42, 0.55)); transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease; }
.overview-server-card:hover { border-color: var(--primary-text, #38bdf8); transform: translateY(-1px); box-shadow: 0 8px 22px rgba(2, 6, 23, 0.16); }

.osc-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.osc-title-wrap { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.osc-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.osc-title-row strong { font-size: 15.5px; font-weight: 700; color: var(--text-bright, var(--text)); letter-spacing: -0.01em; }
.osc-os-pill { padding: 2px 9px; border-radius: 999px; border: 1px solid var(--border); background: var(--border-subtle, rgba(148, 163, 184, 0.1)); font-size: 11px; font-weight: 600; color: var(--text-soft, var(--text)); }
.osc-title-wrap small { font-size: 12px; color: var(--text-secondary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

.osc-status { flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid var(--border); color: var(--text-secondary); background: var(--border-subtle, rgba(148, 163, 184, 0.1)); }
.osc-status i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.osc-status.is-online { color: var(--success-text, #22c55e); border-color: rgba(34, 197, 94, 0.38); background: rgba(34, 197, 94, 0.12); }
.osc-status.is-error { color: var(--danger-text, #ef4444); border-color: rgba(239, 68, 68, 0.38); background: rgba(239, 68, 68, 0.12); }

.osc-metrics-wrap { display: flex; flex-direction: column; gap: 10px; }
.osc-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.osc-metric-row { display: flex; flex-direction: column; gap: 7px; padding: 11px 12px; border-radius: 10px; border: 1px solid var(--border-subtle, var(--border)); background: var(--app-bg); min-width: 0; }
.osc-metric-head { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
.osc-metric-head span { font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); white-space: nowrap; }
.osc-metric-head strong { font-size: 13.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.osc-metric-head strong.healthy { color: var(--success-text, #22c55e); }
.osc-metric-head strong.warning { color: var(--warning-text, #f59e0b); }
.osc-metric-head strong.critical { color: var(--danger-text, #ef4444); }

.osc-bar-track { height: 6px; border-radius: 999px; background: var(--border-subtle, rgba(148, 163, 184, 0.2)); overflow: hidden; }
.osc-bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s ease; }
.osc-bar-fill.healthy { background: linear-gradient(90deg, #16a34a, #4ade80); }
.osc-bar-fill.warning { background: linear-gradient(90deg, #d97706, #fbbf24); }
.osc-bar-fill.critical { background: linear-gradient(90deg, #dc2626, #f87171); }
.osc-metric-sub { font-size: 11px; color: var(--text-soft, var(--text-secondary)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }

.osc-network-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.osc-net-box { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border-subtle, var(--border)); background: var(--app-bg); }
.osc-net-label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.03em; color: var(--text-secondary); }
.osc-net-box.is-rx .osc-net-label { color: var(--primary-text, #38bdf8); }
.osc-net-box.is-tx .osc-net-label { color: #a855f7; }
.osc-net-vals { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.osc-net-vals strong { font-size: 13.5px; font-weight: 700; color: var(--text-bright, var(--text)); font-variant-numeric: tabular-nums; }
.osc-net-vals small { font-size: 11px; color: var(--text-secondary); font-variant-numeric: tabular-nums; }

.osc-empty { padding: 16px; border-radius: 10px; border: 1px dashed var(--border); color: var(--text-secondary); font-size: 12px; text-align: center; }
.osc-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 10px; border-top: 1px solid var(--border-subtle, var(--border)); margin-top: auto; }
.osc-footer small { font-size: 11px; color: var(--text-secondary); }
.osc-link { display: inline-flex; align-items: center; padding: 5px 11px; border-radius: 7px; font-size: 11.5px; font-weight: 600; color: #ffffff; background: #0284c7; text-decoration: none; transition: background 0.15s ease; }
.osc-link:hover { background: #0369a1; }

:global(html[data-theme="light"]) .overview-server-card { background: #ffffff; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05); }
:global(html[data-theme="light"]) .overview-intervals { background: #e2e8f0; }
:global(html[data-theme="light"]) .refresh-overview-btn { background: #ffffff; }
:global(html[data-theme="light"]) .osc-metric-row,
:global(html[data-theme="light"]) .osc-net-box { background: #f8fafc; }
:global(html[data-theme="light"]) .osc-net-box.is-tx .osc-net-label { color: #7e22ce; }

@media (max-width: 1100px) {
  .overview-server-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .osc-metrics, .osc-network-grid { grid-template-columns: 1fr; }
  .overview-server-card { padding: 14px; }
  .server-section.is-overview-fullscreen { padding: 14px; }
}
</style>
