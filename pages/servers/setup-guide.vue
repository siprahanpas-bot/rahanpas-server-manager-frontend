<script setup lang="ts">
const route = useRoute()
const activeOs = ref<'linux' | 'windows'>(
  route.query.os === 'windows' ? 'windows' : 'linux'
)
const copiedKey = ref('')

watch(
  () => route.query.os,
  (val) => {
    if (val === 'windows' || val === 'linux') {
      activeOs.value = val
    }
  }
)

const linuxOneShotScript = `#!/usr/bin/env bash
set -euo pipefail

# 1. Pastikan OpenSSH Server terpasang & aktif (Debian/Ubuntu atau RHEL/Alma/Rocky)
if command -v apt-get >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y openssh-server
elif command -v dnf >/dev/null 2>&1; then
  dnf install -y openssh-server
elif command -v yum >/dev/null 2>&1; then
  yum install -y openssh-server
fi

# 2. Pastikan user root memiliki password & akses SSH aktif (idempoten)
echo ">>> Set/Update password untuk user root (atau tekan Ctrl+C jika sudah ada):"
passwd root || true

# 3. Konfigurasi sshd secara aman & bisa dijalankan berulang
mkdir -p /etc/ssh/sshd_config.d
cat <<'SSHD' > /etc/ssh/sshd_config.d/99-rahanpas-manager.conf
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
SSHD

# 4. Restart & enable service SSH
systemctl enable ssh 2>/dev/null || systemctl enable sshd 2>/dev/null || true
systemctl restart ssh 2>/dev/null || systemctl restart sshd

# 5. Buka port 22 di firewall jika aktif (idempoten)
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow 22/tcp || true
fi
if command -v firewall-cmd >/dev/null 2>&1 && systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-service=ssh || true
  firewall-cmd --reload || true
fi

echo "=== SELESAI: SSH Linux siap dihubungkan ke Rahanpas Server Manager (Port 22, User: root) ==="`

const linuxAdminUserScript = `#!/usr/bin/env bash
set -euo pipefail
ADMIN_USER="sysadmin"

# Buat user jika belum ada, dan masukkan ke grup sudo/wheel (aman dijalankan berulang)
if ! id -u "$ADMIN_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "$ADMIN_USER"
fi
usermod -aG sudo "$ADMIN_USER" 2>/dev/null || usermod -aG wheel "$ADMIN_USER" 2>/dev/null || true
echo ">>> Set password untuk user $ADMIN_USER:"
passwd "$ADMIN_USER"`

const linuxHostKeyScript = `for k in /etc/ssh/ssh_host_*_key.pub; do
  [ -f "$k" ] && ssh-keygen -lf "$k" -E sha256
done`

const windowsOneShotScript = `#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

# 1. Ubah profil jaringan Public menjadi Private agar WinRM diizinkan
Get-NetConnectionProfile | Where-Object { $_.NetworkCategory -eq 'Public' } | Set-NetConnectionProfile -NetworkCategory Private

# 2. Aktifkan user Administrator bawaan & set password (idempoten)
$adminUser = Get-LocalUser -Name "Administrator" -ErrorAction SilentlyContinue
if ($null -ne $adminUser) {
    Enable-LocalUser -Name "Administrator"
    $pass = Read-Host "Masukkan password baru untuk Administrator" -AsSecureString
    Set-LocalUser -Name "Administrator" -Password $pass
} else {
    $pass = Read-Host "Buat password untuk user Administrator" -AsSecureString
    New-LocalUser -Name "Administrator" -Password $pass -FullName "Server Administrator" -AccountNeverExpires
    Add-LocalGroupMember -Group "Administrators" -Member "Administrator" -ErrorAction SilentlyContinue
}

# 3. Izinkan remote admin token untuk Workgroup / Windows 10-11
New-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" -Name "LocalAccountTokenFilterPolicy" -Value 1 -PropertyType DWord -Force | Out-Null

# 4. Aktifkan & konfigurasi WinRM (HTTP Port 5985 + Basic Auth)
winrm quickconfig -q
winrm set winrm/config/service '@{AllowUnencrypted="true"}'
winrm set winrm/config/service/auth '@{Basic="true"}'
Set-Service -Name WinRM -StartupType Automatic
Restart-Service WinRM

# 5. Aktifkan Remote Desktop (RDP Port 3389) & buka Firewall
Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -Name "fDenyTSConnections" -Value 0
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# 6. Buka Firewall Port 5985 (cek dulu agar tidak duplikat)
if (-not (Get-NetFirewallRule -Name "WinRM-HTTP-5985" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -Name "WinRM-HTTP-5985" -DisplayName "WinRM HTTP 5985" -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 5985 | Out-Null
}

# 7. Verifikasi hasil
Write-Host "=== STATUS WINRM ===" -ForegroundColor Cyan
Get-Service WinRM | Select-Object Name, Status, StartType
winrm get winrm/config/service/auth
Write-Host "SELESAI: Windows siap didaftarkan (Protokol: WinRM, Port: 5985, User: Administrator)" -ForegroundColor Green`

const windowsRdpOnlyScript = `#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

# 1. Aktifkan Remote Desktop (RDP)
Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -Name "fDenyTSConnections" -Value 0

# 2. Pastikan service Remote Desktop (TermService) berjalan otomatis
Set-Service -Name TermService -StartupType Automatic
Start-Service -Name TermService -ErrorAction SilentlyContinue

# 3. Buka Firewall Remote Desktop (Port 3389) secara idempoten
Enable-NetFirewallRule -DisplayGroup "Remote Desktop" -ErrorAction SilentlyContinue
if (-not (Get-NetFirewallRule -Name "Rahanpas-RDP-3389" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -Name "Rahanpas-RDP-3389" -DisplayName "Rahanpas RDP 3389" -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 3389 | Out-Null
}

# 4. Pastikan user Administrator memiliki akses Remote Desktop
Add-LocalGroupMember -Group "Remote Desktop Users" -Member "Administrator" -ErrorAction SilentlyContinue

Write-Host "=== STATUS RDP ===" -ForegroundColor Cyan
Get-Service TermService | Select-Object Name, Status, StartType
netstat -ano | findstr :3389
Write-Host "SELESAI: Remote Desktop (RDP Port 3389) aktif dan siap dipakai dari browser." -ForegroundColor Green`

async function copyText(key: string, text: string) {
  let ok = false
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      ok = true
    }
  } catch {
    ok = false
  }

  if (!ok) {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.top = '-9999px'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      ok = document.execCommand('copy')
      document.body.removeChild(ta)
    } catch {
      ok = false
    }
  }

  if (ok) {
    copiedKey.value = key
    setTimeout(() => {
      if (copiedKey.value === key) copiedKey.value = ''
    }, 2000)
  }
}
</script>

<template>
  <main class="guide-page">
    <header class="guide-header">
      <div>
        <div class="guide-kicker">SERVER SETUP &amp; ONBOARDING GUIDE</div>
        <h1>Tutorial Konfigurasi Server Target</h1>
        <p>Panduan langkah demi langkah menyiapkan Linux (SSH) atau Windows (WinRM) sebelum ditambahkan ke Rahanpas Server Manager.</p>
      </div>
      <NuxtLink to="/servers/create" class="guide-back">← Kembali ke Add Server</NuxtLink>
    </header>

    <div class="os-tabs" role="tablist">
      <button
        type="button"
        :class="{ active: activeOs === 'linux' }"
        @click="activeOs = 'linux'"
      >
        🐧 Linux (SSH · Port 22)
      </button>
      <button
        type="button"
        :class="{ active: activeOs === 'windows' }"
        @click="activeOs = 'windows'"
      >
        ▣ Windows (WinRM · Port 5985)
      </button>
    </div>

    <!-- VISUALISASI ARSITEKTUR KONEKSI -->
    <section class="visual-card">
      <div class="visual-head">
        <h2>Visualisasi Alur Koneksi &amp; Fitur</h2>
        <span>{{ activeOs === 'linux' ? 'Protokol SSH / SFTP (Port 22)' : 'Protokol WinRM WS-Man SOAP (Port 5985)' }}</span>
      </div>

      <div class="diagram-flow">
        <div class="diagram-node is-manager">
          <strong>Rahanpas Server Manager</strong>
          <small>Dashboard · Live Monitoring · File Explorer</small>
        </div>
        <div class="diagram-arrow">
          <span>{{ activeOs === 'linux' ? 'SSH / SFTP :22' : 'WinRM HTTP :5985' }}</span>
          <div class="arrow-line">──────────▶</div>
        </div>
        <div class="diagram-node is-target">
          <strong>{{ activeOs === 'linux' ? 'Server Linux Target' : 'Server Windows Target' }}</strong>
          <small>{{ activeOs === 'linux' ? 'User: root / sudoer · sshd aktif' : 'User: Administrator · WinRM Basic Auth' }}</small>
        </div>
      </div>
    </section>

    <!-- PANDUAN LINUX -->
    <section v-if="activeOs === 'linux'" class="guide-steps">
      <article class="step-card">
        <div class="step-badge">LANGKAH 1</div>
        <h3>Login ke Terminal Server Linux</h3>
        <p>Masuk ke console/VM (Proxmox, VirtualBox, atau VPS) sebagai <code>root</code> atau user dengan akses <code>sudo</code>.</p>

        <div class="terminal-mockup">
          <div class="term-bar"><i></i><i></i><i></i><span>root@target-linux:~</span></div>
          <pre>$ sudo -i
root@target-linux:~# whoami
root</pre>
        </div>
      </article>

      <article class="step-card">
        <div class="step-header-row">
          <div>
            <div class="step-badge">LANGKAH 2 · PERINTAH SEKALI JALAN</div>
            <h3>Install SSH, Aktifkan Login <code>root</code> &amp; Buka Port 22</h3>
            <p>Salin dan jalankan skrip berikut di terminal Linux. Skrip ini <strong>idempoten</strong> (aman dijalankan berulang kali tanpa merusak konfigurasi).</p>
          </div>
          <button type="button" class="copy-btn" @click="copyText('linux-main', linuxOneShotScript)">
            {{ copiedKey === 'linux-main' ? '✓ Tersalin' : 'Salin Skrip' }}
          </button>
        </div>
        <pre class="code-block"><code>{{ linuxOneShotScript }}</code></pre>
      </article>

      <article class="step-card">
        <div class="step-header-row">
          <div>
            <div class="step-badge">OPSIONAL</div>
            <h3>Buat User Admin Alternatif (Non-Root)</h3>
            <p>Jika ingin memakai user selain <code>root</code> (misalnya <code>sysadmin</code> dengan hak <code>sudo</code>):</p>
          </div>
          <button type="button" class="copy-btn" @click="copyText('linux-admin', linuxAdminUserScript)">
            {{ copiedKey === 'linux-admin' ? '✓ Tersalin' : 'Salin Skrip' }}
          </button>
        </div>
        <pre class="code-block"><code>{{ linuxAdminUserScript }}</code></pre>
      </article>

      <article class="step-card">
        <div class="step-header-row">
          <div>
            <div class="step-badge">KEAMANAN · HOST KEY VERIFICATION</div>
            <h3>Cara Menggunakan <code>Require host key verification</code></h3>
            <p>
              Fitur ini memastikan Rahanpas Server Manager hanya terhubung ke server Linux yang identitas SSH-nya cocok (mencegah serangan <em>Man-in-the-Middle</em>). Anda bisa mengaktifkannya dengan dua cara:
            </p>
          </div>
          <button type="button" class="copy-btn" @click="copyText('linux-hk', linuxHostKeyScript)">
            {{ copiedKey === 'linux-hk' ? '✓ Tersalin' : 'Salin Perintah' }}
          </button>
        </div>

        <p><strong>Cara 1 — Ambil Fingerprint Langsung di Terminal Linux Target:</strong></p>
        <pre class="code-block"><code>{{ linuxHostKeyScript }}</code></pre>
        <p style="margin-top: 10px;">
          Salin nilai berawalan <code>SHA256:...</code> (biasanya baris <code>ED25519</code> atau <code>RSA</code>, contoh: <code>SHA256:AbCdEf123456...</code>), lalu tempel ke kolom <strong>Host Key Fingerprint</strong> dan centang <strong>Require host key verification</strong> di form Add Server.
        </p>

        <div class="note-box">
          <strong>Cara 2 — Otomatis via UI (Discover Host Key):</strong><br />
          1. Tambahkan server terlebih dahulu tanpa mencentang <em>Require host key verification</em>.<br />
          2. Buka halaman detail server tersebut, lalu pada panel <strong>SSH Connection &amp; Host Verification</strong> klik tombol <strong>Discover Host Key</strong>.<br />
          3. Fingerprint <code>SHA256:...</code> akan terisi otomatis — klik <strong>Edit Configuration</strong>, centang <strong>Require host key verification</strong>, lalu simpan dan klik <strong>Test SSH Connection</strong>.
        </div>
      </article>

      <article class="step-card">
        <div class="step-badge">LANGKAH 3</div>
        <h3>Isi Form di Halaman Add Server</h3>
        <div class="summary-grid">
          <div><span>Operating System</span><strong>Linux</strong></div>
          <div><span>Protocol</span><strong>SSH</strong></div>
          <div><span>Port</span><strong>22</strong></div>
          <div><span>Username</span><strong>root (atau sysadmin)</strong></div>
        </div>
      </article>
    </section>

    <!-- PANDUAN WINDOWS -->
    <section v-else class="guide-steps">
      <article class="step-card">
        <div class="step-badge">LANGKAH 1</div>
        <h3>Buka PowerShell sebagai Administrator</h3>
        <p>Klik kanan tombol <strong>Start</strong> di Windows, lalu pilih <strong>Terminal (Admin)</strong> atau <strong>Windows PowerShell (Admin)</strong>.</p>

        <div class="terminal-mockup is-ps">
          <div class="term-bar"><i></i><i></i><i></i><span>Administrator: Windows PowerShell</span></div>
          <pre>PS C:\WINDOWS\system32&gt; whoami
desktop\administrator</pre>
        </div>
      </article>

      <article class="step-card">
        <div class="step-header-row">
          <div>
            <div class="step-badge">LANGKAH 2 · PERINTAH SEKALI JALAN</div>
            <h3>Aktifkan User <code>Administrator</code>, WinRM (5985), &amp; Remote Desktop (RDP 3389)</h3>
            <p>Salin skrip PowerShell di bawah dan paste ke PowerShell (Admin). Aman dijalankan berulang kali: otomatis mengubah network <code>Public</code> ke <code>Private</code>, mengaktifkan <code>Administrator</code>, mengatur WinRM Basic Auth, dan membuka firewall port <code>5985</code>.</p>
          </div>
          <button type="button" class="copy-btn" @click="copyText('win-main', windowsOneShotScript)">
            {{ copiedKey === 'win-main' ? '✓ Tersalin' : 'Salin Skrip' }}
          </button>
        </div>
        <pre class="code-block"><code>{{ windowsOneShotScript }}</code></pre>
      </article>

      <article class="step-card">
        <div class="step-header-row">
          <div>
            <div class="step-badge">REMOTE DESKTOP · PORT 3389</div>
            <h3>Aktifkan Remote Desktop (RDP) untuk Kontrol GUI di Browser</h3>
            <p>
              Jika ingin membuka desktop Windows &amp; aplikasi GUI (seperti VS Code, Browser, atau Task Manager) langsung dari tombol <strong>🖥️ Remote Desktop (RDP)</strong> di halaman detail server, jalankan skrip berikut di <strong>PowerShell (Admin)</strong>. Skrip ini <strong>aman dijalankan berulang kali</strong>.
            </p>
          </div>
          <button type="button" class="copy-btn" @click="copyText('win-rdp', windowsRdpOnlyScript)">
            {{ copiedKey === 'win-rdp' ? '✓ Tersalin' : 'Salin Skrip RDP' }}
          </button>
        </div>
        <pre class="code-block"><code>{{ windowsRdpOnlyScript }}</code></pre>
      </article>

      <article class="step-card">
        <div class="step-badge">LANGKAH 3</div>
        <h3>Isi Form di Halaman Add Server</h3>
        <div class="summary-grid">
          <div><span>Operating System</span><strong>Windows Server</strong></div>
          <div><span>Protocol</span><strong>WinRM</strong></div>
          <div><span>Port</span><strong>5985</strong></div>
          <div><span>Username</span><strong>Administrator</strong></div>
        </div>
        <p class="note-box">
          <strong>Catatan Keamanan:</strong> Untuk penyimpanan &amp; modifikasi di File Explorer, drive sistem OS (<code>C:\</code>) otomatis dibuat <em>Read-Only</em>, sedangkan drive data non-OS (<code>D:\</code>, USB flashdisk, dll.) bisa dipakai untuk Upload, New Folder, Rename, Delete, dan Format.
        </p>
      </article>
    </section>
  </main>
</template>

<style scoped>
.guide-page { min-height: 100vh; max-width: 980px; margin: 0 auto; padding: 28px 20px 60px; color: var(--text); }
.guide-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
.guide-kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--primary-text, #38bdf8); margin-bottom: 6px; }
.guide-header h1 { margin: 0; font-size: 24px; color: var(--text-bright, var(--text)); }
.guide-header p { margin: 6px 0 0; font-size: 13.5px; color: var(--text-secondary); max-width: 640px; }
.guide-back { padding: 9px 14px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface-deep, transparent); color: var(--text); font-size: 13px; font-weight: 600; text-decoration: none; }
.guide-back:hover { border-color: var(--primary-text, #38bdf8); }

.os-tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
.os-tabs button { padding: 10px 18px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface-deep, rgba(15, 23, 42, 0.4)); color: var(--text-secondary); font-size: 13.5px; font-weight: 600; cursor: pointer; }
.os-tabs button.active { background: #0284c7; border-color: #0284c7; color: #ffffff; }

.visual-card, .step-card { padding: 18px 20px; border-radius: 14px; border: 1px solid var(--border); background: var(--surface-deep, rgba(15, 23, 42, 0.45)); margin-bottom: 16px; }
.visual-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.visual-head h2 { margin: 0; font-size: 15px; color: var(--text-bright, var(--text)); }
.visual-head span { font-size: 12px; color: var(--primary-text, #38bdf8); font-weight: 600; }

.diagram-flow { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 14px; }
.diagram-node { padding: 14px 16px; border-radius: 10px; border: 1px solid var(--border); background: var(--app-bg); display: flex; flex-direction: column; gap: 4px; }
.diagram-node strong { font-size: 13.5px; color: var(--text-bright, var(--text)); }
.diagram-node small { font-size: 11.5px; color: var(--text-secondary); }
.diagram-arrow { text-align: center; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.diagram-arrow span { display: block; font-size: 11px; font-weight: 700; color: var(--primary-text, #38bdf8); margin-bottom: 2px; }
.arrow-line { font-size: 13px; color: var(--text-secondary); }

.guide-steps { display: flex; flex-direction: column; gap: 4px; }
.step-badge { display: inline-block; padding: 3px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.14); color: var(--primary-text, #38bdf8); font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 8px; }
.step-card h3 { margin: 0 0 6px; font-size: 16px; color: var(--text-bright, var(--text)); }
.step-card p { margin: 0 0 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.55; }
.step-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }

.copy-btn { padding: 7px 13px; border-radius: 8px; border: 1px solid #0284c7; background: rgba(2, 132, 199, 0.15); color: #38bdf8; font-size: 12px; font-weight: 600; cursor: pointer; flex: none; }
.copy-btn:hover { background: #0284c7; color: #ffffff; }

.code-block { margin: 0; padding: 14px; border-radius: 10px; border: 1px solid var(--border); background: #090f1d; color: #e2e8f0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.55; overflow-x: auto; }
.terminal-mockup { border-radius: 10px; border: 1px solid #334155; background: #090f1d; overflow: hidden; }
.terminal-mockup.is-ps { border-color: #1d4ed8; background: #071530; }
.term-bar { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.term-bar i { width: 9px; height: 9px; border-radius: 50%; background: #64748b; }
.term-bar span { margin-left: 6px; font-size: 11px; color: #94a3b8; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.terminal-mockup pre { margin: 0; padding: 12px; color: #e2e8f0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.5; overflow-x: auto; }

.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.summary-grid div { padding: 10px 12px; border-radius: 9px; border: 1px solid var(--border); background: var(--app-bg); display: flex; flex-direction: column; gap: 3px; }
.summary-grid span { font-size: 11px; color: var(--text-secondary); }
.summary-grid strong { font-size: 13px; color: var(--text-bright, var(--text)); }
.note-box { margin-top: 12px !important; padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.35); background: rgba(245, 158, 11, 0.08); font-size: 12px !important; }

:global(html[data-theme="light"]) .visual-card,
:global(html[data-theme="light"]) .step-card { background: #ffffff; }
:global(html[data-theme="light"]) .diagram-node,
:global(html[data-theme="light"]) .summary-grid div { background: #f8fafc; }
:global(html[data-theme="light"]) .copy-btn { color: #0369a1; }

@media (max-width: 720px) {
  .diagram-flow { grid-template-columns: 1fr; }
  .arrow-line { transform: rotate(90deg); margin: 4px 0; }
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
