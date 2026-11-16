<script setup lang="ts">
const isLoggedIn = ref(false)
const mobileNavOpen = ref(false)

onMounted(async () => {
  try {
    await $fetch('/auth/me')
    isLoggedIn.value = true
  } catch {
    isLoggedIn.value = false
  }
})

const features = [
  {
    icon: '📊',
    title: 'Realtime Multi-OS Monitoring',
    desc: 'Pantau CPU, Memory, Root Disk, dan Network RX/TX secara live untuk server Linux (SSH) maupun Windows (WinRM).',
  },
  {
    icon: '🖥️',
    title: 'Browser Remote Desktop (RDP)',
    desc: 'Akses tampilan desktop Windows dan aplikasi GUI seperti VS Code langsung dari browser tanpa aplikasi tambahan.',
  },
  {
    icon: '📁',
    title: 'File Explorer & Storage Manager',
    desc: 'Kelola direktori, upload, download, deteksi partisi USB/disk, hingga format storage dengan proteksi read-only OS.',
  },
  {
    icon: '📝',
    title: 'ONLYOFFICE Document Editor',
    desc: 'Buka, preview, dan edit file Word, Excel, PowerPoint, CSV, dan PDF langsung di File Explorer dengan auto-save.',
  },
  {
    icon: '🔐',
    title: 'Host Key & RBAC Security',
    desc: 'Verifikasi fingerprint SSH SHA256, kredensial terenkripsi, pembatasan IP, dan manajemen hak akses berbasis role.',
  },
  {
    icon: '📈',
    title: 'Historical Metrics & Alerts',
    desc: 'Rekam snapshot performa server secara berkala untuk analisis tren 1 jam, 6 jam, 24 jam, hingga 7 hari terakhir.',
  },
]

const infoPosts = [
  {
    tag: 'INFORMASI PLATFORM',
    date: 'Update Terbaru',
    title: 'Dukungan Penuh Windows Server (WinRM) & Linux (SSH)',
    excerpt: 'Kini Anda dapat memantau server Windows dan Linux dalam satu dashboard terpusat lengkap dengan deteksi storage dan file manager.',
    link: '/servers/setup-guide',
    linkText: 'Lihat Panduan Setup →',
  },
  {
    tag: 'FITUR BARU',
    date: 'Produktivitas',
    title: 'Edit Dokumen Office & Preview PDF Langsung di Browser',
    excerpt: 'Terintegrasi dengan ONLYOFFICE Document Server untuk membuka serta mengedit dokumen kerja langsung di server remote.',
    link: '/login',
    linkText: 'Coba di Dashboard →',
  },
  {
    tag: 'KEAMANAN',
    date: 'Best Practice',
    title: 'Panduan Aktivasi Host Key Verification & RDP Aman',
    excerpt: 'Pelajari cara mengaktifkan verifikasi fingerprint SSH dan konfigurasi Remote Desktop Windows melalui skrip sekali jalan.',
    link: '/servers/setup-guide?os=linux',
    linkText: 'Baca Tutorial →',
  },
]
</script>

<template>
  <div class="lp-root">
    <!-- NAVBAR -->
    <header class="lp-nav-wrap">
      <div class="lp-container lp-nav">
        <NuxtLink to="/" class="lp-brand">
          <span class="lp-logo">R</span>
          <div>
            <strong>Cloud Monitoring</strong>
            <small>RAHANPAS INFRASTRUCTURE</small>
          </div>
        </NuxtLink>

        <nav class="lp-links" :class="{ open: mobileNavOpen }">
          <a href="#fitur" @click="mobileNavOpen = false">Fitur</a>
          <a href="#informasi" @click="mobileNavOpen = false">Informasi</a>
          <NuxtLink to="/servers/setup-guide" @click="mobileNavOpen = false">Dokumentasi</NuxtLink>
          <div class="lp-nav-actions">
            <template v-if="isLoggedIn">
              <NuxtLink to="/dashboard" class="lp-btn lp-btn-primary">Buka Dashboard →</NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="lp-btn lp-btn-ghost">Login</NuxtLink>
              <NuxtLink to="/register" class="lp-btn lp-btn-primary">Daftar Gratis</NuxtLink>
            </template>
          </div>
        </nav>

        <button
          type="button"
          class="lp-menu-btn"
          aria-label="Toggle navigation"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          {{ mobileNavOpen ? '✕' : '☰' }}
        </button>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="lp-hero">
      <div class="lp-container lp-hero-grid">
        <div class="lp-hero-copy">
          <span class="lp-eyebrow">CLOUD MONITORING &amp; SERVER CONTROL CENTER</span>
          <h1>
            Pantau &amp; Kelola Seluruh
            <span>Cloud &amp; Server</span>
            dari Satu Tempat.
          </h1>
          <p>
            Platform monitoring terpusat untuk infrastruktur Linux (SSH) dan Windows (WinRM).
            Lacak performa realtime, kelola file &amp; dokumen Office, hingga akses Remote Desktop langsung di browser.
          </p>
          <div class="lp-hero-cta">
            <NuxtLink :to="isLoggedIn ? '/dashboard' : '/login'" class="lp-btn lp-btn-primary lp-btn-lg">
              {{ isLoggedIn ? 'Masuk ke Dashboard →' : 'Login ke Console →' }}
            </NuxtLink>
            <a href="#fitur" class="lp-btn lp-btn-ghost lp-btn-lg">Pelajari Fitur</a>
          </div>
          <div class="lp-trust-row">
            <span>✓ Linux SSH &amp; SFTP</span>
            <span>✓ Windows WinRM &amp; RDP</span>
            <span>✓ ONLYOFFICE Editor</span>
          </div>
        </div>

        <div class="lp-hero-card">
          <div class="lp-mock-bar">
            <i></i><i></i><i></i>
            <span>Live Infrastructure Snapshot</span>
          </div>
          <div class="lp-mock-body">
            <div class="lp-mock-stat">
              <span>CPU USAGE</span>
              <strong class="is-ok">11.4%</strong>
              <div class="lp-mock-track"><div style="width: 11.4%"></div></div>
            </div>
            <div class="lp-mock-stat">
              <span>MEMORY USAGE</span>
              <strong class="is-warn">64.2%</strong>
              <div class="lp-mock-track"><div class="is-warn" style="width: 64.2%"></div></div>
            </div>
            <div class="lp-mock-stat">
              <span>NETWORK THROUGHPUT</span>
              <strong class="is-net">↓ 2.4 MB/s · ↑ 840 KB/s</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AD SLOT: LEADERBOARD BANNER (728x90 / RESPONSIVE) -->
    <section class="lp-ad-banner-wrap">
      <div class="lp-container">
        <div class="lp-ad-slot is-leaderboard" data-ad-slot="top-leaderboard">
          <span class="lp-ad-badge">ADVERTISEMENT / SPONSOR</span>
          <strong>Slot Iklan Leaderboard (728 × 90 · Responsive)</strong>
          <small>Area ini siap dipasangi banner promo, pengumuman sponsor, atau script Google AdSense.</small>
        </div>
      </div>
    </section>

    <!-- FITUR UNGGULAN -->
    <section id="fitur" class="lp-section">
      <div class="lp-container">
        <div class="lp-section-head">
          <span>CAPABILITIES</span>
          <h2>Fitur Lengkap untuk Operasional Infrastruktur</h2>
          <p>Dirancang untuk administrator sistem, tim DevOps, dan pengelolaan server hybrid.</p>
        </div>

        <div class="lp-feature-grid">
          <article v-for="feat in features" :key="feat.title" class="lp-feature-card">
            <div class="lp-feature-icon">{{ feat.icon }}</div>
            <h3>{{ feat.title }}</h3>
            <p>{{ feat.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- INFORMASI, ARTIKEL & SIDEBAR AD -->
    <section id="informasi" class="lp-section lp-section-alt">
      <div class="lp-container lp-info-layout">
        <div class="lp-info-main">
          <div class="lp-section-head is-left">
            <span>INFORMASI &amp; PEMBARUAN</span>
            <h2>Berita, Pengumuman &amp; Panduan Terbaru</h2>
            <p>Ruang informasi seputar rilis fitur, tips keamanan server, dan pengumuman layanan.</p>
          </div>

          <div class="lp-post-list">
            <article v-for="post in infoPosts" :key="post.title" class="lp-post-card">
              <div class="lp-post-meta">
                <span>{{ post.tag }}</span>
                <small>{{ post.date }}</small>
              </div>
              <h3>{{ post.title }}</h3>
              <p>{{ post.excerpt }}</p>
              <NuxtLink :to="post.link" class="lp-post-link">{{ post.linkText }}</NuxtLink>
            </article>
          </div>
        </div>

        <aside class="lp-info-sidebar">
          <div class="lp-ad-slot is-rectangle" data-ad-slot="sidebar-rectangle">
            <span class="lp-ad-badge">ADVERTISEMENT</span>
            <strong>Slot Iklan Sidebar (300 × 250)</strong>
            <small>Cocok untuk iklan display, afiliasi cloud/VPS, atau info promo layanan.</small>
          </div>

          <div class="lp-ad-slot is-skyscraper" data-ad-slot="sidebar-info">
            <span class="lp-ad-badge">INFO &amp; PROMO</span>
            <strong>Slot Iklan / Banner Vertikal (300 × 600)</strong>
            <small>Siap diisi script AdSense atau banner informasi partner.</small>
          </div>
        </aside>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="lp-footer">
      <div class="lp-container lp-footer-inner">
        <div>
          <strong>Cloud Monitoring</strong>
          <p>Centralized Infrastructure Monitoring &amp; Remote Management Platform.</p>
        </div>
        <div class="lp-footer-links">
          <NuxtLink to="/login">Login</NuxtLink>
          <NuxtLink to="/register">Register</NuxtLink>
          <NuxtLink to="/servers/setup-guide">Setup Guide</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.lp-root { min-height: 100vh; background: var(--app-bg); color: var(--text); display: flex; flex-direction: column; }
.lp-container { max-width: 1180px; margin: 0 auto; padding: 0 22px; width: 100%; }

/* NAVBAR */
.lp-nav-wrap { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid var(--border-subtle); background: var(--surface); backdrop-filter: blur(10px); }
.lp-nav { height: 70px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.lp-brand { display: inline-flex; align-items: center; gap: 11px; text-decoration: none; color: var(--text-bright, var(--text)); }
.lp-logo { width: 38px; height: 38px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: #fff; background: linear-gradient(135deg, #2563eb, #06b6d4); }
.lp-brand strong { display: block; font-size: 16px; line-height: 1.15; }
.lp-brand small { display: block; font-size: 10px; letter-spacing: 0.08em; color: var(--text-secondary); }

.lp-links { display: flex; align-items: center; gap: 22px; }
.lp-links > a { color: var(--text-secondary); text-decoration: none; font-size: 13.5px; font-weight: 600; transition: color 0.15s; }
.lp-links > a:hover { color: var(--primary-text, #38bdf8); }
.lp-nav-actions { display: flex; align-items: center; gap: 10px; margin-left: 6px; }
.lp-menu-btn { display: none; padding: 7px 11px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-muted); color: var(--text); font-size: 18px; cursor: pointer; }

.lp-btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 600; text-decoration: none; transition: transform 0.15s, opacity 0.15s, border-color 0.15s; }
.lp-btn-lg { padding: 12px 22px; font-size: 14px; }
.lp-btn-ghost { border: 1px solid var(--border-strong); background: var(--surface-muted); color: var(--text); }
.lp-btn-ghost:hover { border-color: var(--primary-text, #38bdf8); }
.lp-btn-primary { border: 0; background: linear-gradient(135deg, #2563eb, #0284c7); color: #ffffff; box-shadow: 0 6px 18px rgba(37, 99, 235, 0.25); }
.lp-btn-primary:hover { transform: translateY(-1px); opacity: 0.95; }

/* HERO */
.lp-hero { padding: 56px 0 40px; }
.lp-hero-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 36px; align-items: center; }
.lp-eyebrow { display: inline-block; padding: 4px 11px; border-radius: 999px; border: 1px solid rgba(56, 189, 248, 0.35); background: rgba(56, 189, 248, 0.1); color: var(--primary-text, #38bdf8); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; margin-bottom: 14px; }
.lp-hero-copy h1 { margin: 0; font-size: clamp(28px, 4vw, 44px); line-height: 1.15; letter-spacing: -0.025em; color: var(--text-bright, var(--text)); }
.lp-hero-copy h1 span { color: var(--primary-text, #38bdf8); }
.lp-hero-copy p { margin: 16px 0 24px; font-size: 15px; line-height: 1.65; color: var(--text-secondary); max-width: 560px; }
.lp-hero-cta { display: flex; gap: 12px; flex-wrap: wrap; }
.lp-trust-row { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 22px; font-size: 12.5px; font-weight: 600; color: var(--text-secondary); }

.lp-hero-card { border: 1px solid var(--border); border-radius: 16px; background: var(--surface); box-shadow: 0 18px 40px rgba(2, 6, 23, 0.2); overflow: hidden; }
.lp-mock-bar { display: flex; align-items: center; gap: 6px; padding: 11px 16px; border-bottom: 1px solid var(--border-subtle); background: var(--surface-muted); }
.lp-mock-bar i { width: 9px; height: 9px; border-radius: 50%; background: var(--text-muted); opacity: 0.6; }
.lp-mock-bar span { margin-left: 8px; font-size: 11.5px; font-weight: 600; color: var(--text-secondary); }
.lp-mock-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.lp-mock-stat { padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--app-bg); display: flex; flex-direction: column; gap: 6px; }
.lp-mock-stat span { font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; color: var(--text-secondary); }
.lp-mock-stat strong { font-size: 15px; }
.lp-mock-stat strong.is-ok { color: var(--success-text, #22c55e); }
.lp-mock-stat strong.is-warn { color: var(--warning-text, #f59e0b); }
.lp-mock-stat strong.is-net { color: var(--primary-text, #38bdf8); font-size: 13px; }
.lp-mock-track { height: 6px; border-radius: 999px; background: var(--border-subtle); overflow: hidden; }
.lp-mock-track div { height: 100%; border-radius: 999px; background: #22c55e; }
.lp-mock-track div.is-warn { background: #f59e0b; }

/* AD SLOTS */
.lp-ad-banner-wrap { padding: 10px 0 26px; }
.lp-ad-slot { border: 1.5px dashed var(--border-strong); border-radius: 12px; background: var(--surface); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 4px; padding: 18px; }
.lp-ad-slot.is-leaderboard { min-height: 96px; }
.lp-ad-slot.is-rectangle { min-height: 240px; }
.lp-ad-slot.is-skyscraper { min-height: 300px; }
.lp-ad-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; padding: 2px 8px; border-radius: 999px; background: rgba(148, 163, 184, 0.14); color: var(--text-secondary); }
.lp-ad-slot strong { font-size: 13.5px; color: var(--text-bright, var(--text)); }
.lp-ad-slot small { font-size: 11.5px; color: var(--text-secondary); max-width: 420px; }

/* SECTIONS */
.lp-section { padding: 48px 0; }
.lp-section-alt { background: var(--surface); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); }
.lp-section-head { text-align: center; max-width: 640px; margin: 0 auto 32px; }
.lp-section-head.is-left { text-align: left; margin: 0 0 22px; }
.lp-section-head span { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--primary-text, #38bdf8); }
.lp-section-head h2 { margin: 6px 0 8px; font-size: 24px; color: var(--text-bright, var(--text)); }
.lp-section-head p { margin: 0; font-size: 13.5px; color: var(--text-secondary); }

.lp-feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.lp-feature-card { padding: 20px; border-radius: 14px; border: 1px solid var(--border); background: var(--surface); transition: border-color 0.15s, transform 0.15s; }
.lp-feature-card:hover { border-color: var(--primary-text, #38bdf8); transform: translateY(-2px); }
.lp-feature-icon { font-size: 24px; margin-bottom: 10px; }
.lp-feature-card h3 { margin: 0 0 6px; font-size: 15.5px; color: var(--text-bright, var(--text)); }
.lp-feature-card p { margin: 0; font-size: 13px; line-height: 1.55; color: var(--text-secondary); }

/* INFO & SIDEBAR */
.lp-info-layout { display: grid; grid-template-columns: 1.55fr 0.85fr; gap: 24px; align-items: start; }
.lp-post-list { display: flex; flex-direction: column; gap: 14px; }
.lp-post-card { padding: 18px 20px; border-radius: 13px; border: 1px solid var(--border); background: var(--app-bg); }
.lp-post-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.lp-post-meta span { font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; color: var(--primary-text, #38bdf8); }
.lp-post-meta small { font-size: 11px; color: var(--text-secondary); }
.lp-post-card h3 { margin: 0 0 6px; font-size: 16px; color: var(--text-bright, var(--text)); }
.lp-post-card p { margin: 0 0 10px; font-size: 13px; line-height: 1.55; color: var(--text-secondary); }
.lp-post-link { font-size: 12.5px; font-weight: 600; color: var(--primary-text, #38bdf8); text-decoration: none; }
.lp-post-link:hover { text-decoration: underline; }
.lp-info-sidebar { display: flex; flex-direction: column; gap: 16px; }

/* FOOTER */
.lp-footer { margin-top: auto; padding: 26px 0; border-top: 1px solid var(--border-subtle); background: var(--app-bg); }
.lp-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.lp-footer strong { font-size: 14px; color: var(--text-bright, var(--text)); }
.lp-footer p { margin: 4px 0 0; font-size: 12px; color: var(--text-secondary); }
.lp-footer-links { display: flex; gap: 18px; }
.lp-footer-links a { font-size: 12.5px; font-weight: 600; color: var(--text-secondary); text-decoration: none; }
.lp-footer-links a:hover { color: var(--primary-text, #38bdf8); }

@media (max-width: 960px) {
  .lp-hero-grid, .lp-info-layout { grid-template-columns: 1fr; }
  .lp-feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .lp-menu-btn { display: inline-flex; }
  .lp-links { position: fixed; top: 70px; left: 0; right: 0; flex-direction: column; align-items: stretch; gap: 12px; padding: 18px 22px; background: var(--surface); border-bottom: 1px solid var(--border); display: none; }
  .lp-links.open { display: flex; }
  .lp-nav-actions { margin-left: 0; padding-top: 8px; border-top: 1px solid var(--border-subtle); }
  .lp-nav-actions .lp-btn { flex: 1; }
  .lp-feature-grid { grid-template-columns: 1fr; }
}
</style>
