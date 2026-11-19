# Rahanpas Server Manager — Frontend

Antarmuka web dan *server-side proxy* untuk **Rahanpas Server Manager**, dibangun menggunakan **Nuxt 3** (Node.js 22 Nitro Server) dan dijalankan dengan **Docker Compose** pada jaringan internal `baota_net` di atas lingkungan **aaPanel**.

* **IP Server Host:** `172.30.1.156` (aaPanel + Reverse Proxy Domain)
* **Default Custom Port Publik:** `13000` (dapat diubah via `.env`)
* **Docker Network:** `baota_net`

---

## 1. Arsitektur & Third-Party yang Terpasang

### Layanan Container (`docker-compose.yml`)
| Service | Image / Base | Fungsi Utama | Custom Port (`.env`) |
| :--- | :--- | :--- | :--- |
| **`frontend`** | `node:22-bookworm-slim` | Menjalankan Nuxt 3 SSR & Nitro Server API Proxy | `APP_PORT` (default: `13000`) |

### Library & Third-Party Utama (`package.json`)
* **Nuxt (`3.17.5`)** — Framework Vue.js *full-stack* dengan Nitro server engine untuk *rendering* halaman dan meneruskan (*proxy*) permintaan API dari browser ke container Backend secara internal (`server/routes` & `server/utils`).
* **Guacamole Common JS (`guacamole-common-js` `^1.5.0`)** — Klien *remote desktop* berbasis HTML5 Canvas & WebSocket yang menghubungkan tampilan sesi RDP/VNC langsung di browser ke layanan `rdp-ws` Backend.

---

## 2. Panduan Deployment (Dari Nol Hingga Siap Pakai)

### Langkah 1: Masuk ke Direktori Frontend (atau Clone dari GitHub)
Jika sudah ada di server:
```bash
cd /opt/rahanpas-server-manager/frontend
```
*(Atau jika deploy di server baru, clone repository frontend Anda terlebih dahulu).*

### Langkah 2: Buat & Rapikan File `.env`
> **Catatan Penting:** Pada `.env.example` bawaan, baris keterangan belum diawali tanda `#`. Pastikan seluruh baris komentar diberi tanda `#` agar Docker Compose tidak mengalami *error parsing*.

Salin dan timpa `.env` dengan format bersih berikut:

```bash
cat << 'EOF' > /opt/rahanpas-server-manager/frontend/.env
# Custom Port Publik Frontend di Host Server
APP_PORT=13000

# Nama Container & Network Docker
CONTAINER_NAME=rahanpas-server-manager-frontend
DOCKER_NETWORK=baota_net

# Konfigurasi Internal Nuxt Nitro Server
NITRO_HOST=0.0.0.0
NITRO_PORT=3000

# URL Internal API Backend (Gunakan nama container Nginx backend di baota_net)
NUXT_API_INTERNAL_BASE=http://rahanpas-backend-nginx/api
EOF
```

* **Penjelasan `NUXT_API_INTERNAL_BASE`:**
  * Jika Frontend dan Backend berada di server yang sama dalam network `baota_net` (kondisi saat ini), gunakan **`http://rahanpas-backend-nginx/api`**. Koneksi berjalan langsung antar-container dengan latensi minimal tanpa melewati firewall publik.
  * Jika Frontend dipisah ke server berbeda, ubah nilainya menjadi **`http://172.30.1.156:8080/api`** (atau URL domain API backend Anda).

### Langkah 3: Build & Jalankan Container Frontend
Pastikan network `baota_net` sudah aktif, lalu jalankan build Docker:

```bash
cd /opt/rahanpas-server-manager/frontend

# Pastikan network baota_net tersedia
docker network create baota_net 2>/dev/null || true

# Build image dan jalankan container di background
docker compose up -d --build
```

Cek status container dan pastikan berjalan tanpa error:
```bash
docker compose ps
docker compose logs -f frontend
```
*(Aplikasi kini sudah aktif dan dapat diakses melalui `http://172.30.1.156:13000`)*.

---

## 3. Konfigurasi Reverse Proxy Domain di aaPanel

Agar aplikasi Frontend (`APP_PORT=13000`) dan sesi Remote Desktop WebSocket (`13002`) dapat diakses secara aman menggunakan domain HTTPS melalui aaPanel:

1. **Tambah Website Baru di aaPanel:**
   * Buka menu **Website** > **Add site**.
   * Masukkan domain utama dashboard Anda (contoh: `manager.domainanda.com`), pilih **PHP Version: Pure static**.
   * Aktifkan **SSL (Let's Encrypt)** pada tab **SSL** website tersebut.

2. **Atur Reverse Proxy Frontend:**
   * Klik **Settings** pada domain `manager.domainanda.com` > pilih tab **Reverse proxy** > **Add reverse proxy**.
   * **Proxy name:** `frontend-nuxt`
   * **Target URL:** `http://127.0.0.1:13000` *(sesuaikan dengan `APP_PORT` di `.env`)*
   * **Sent domain:** `$host`
   * Klik **Save**.

3. **Tambahkan Dukungan WebSocket (Untuk Remote Desktop / RDP):**
   * Masih di tab **Reverse proxy**, klik **Config file** pada proxy `frontend-nuxt`.
   * Pastikan header WebSocket berikut aktif di dalam blok `location /` (atau tambahkan blok `location /rdp-ws/` jika frontend mengakses bridge RDP lewat path domain yang sama):
   ```nginx
   # Pastikan header WebSocket aktif pada proxy utama
   proxy_http_version 1.1;
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection "upgrade";
   proxy_read_timeout 86400;
   ```

4. **Sesuaikan `SANCTUM_STATEFUL_DOMAINS` di Backend:**
   * Setelah domain `manager.domainanda.com` aktif, pastikan domain tersebut sudah terdaftar pada variabel `SANCTUM_STATEFUL_DOMAINS` di `.env` **Backend** agar autentikasi sesi berjalan lancar.

---

## 4. Registrasi Akun Pertama (`SUPER_ADMIN_EMAIL`)

1. Buka alamat Frontend Anda melalui browser (`https://manager.domainanda.com` atau `http://172.30.1.156:13000`).
2. Masuk ke halaman **Register** (`/register`).
3. Daftarkan akun baru menggunakan **alamat email yang sama persis** dengan nilai `SUPER_ADMIN_EMAIL` yang telah diatur pada `.env` Backend.
4. Setelah berhasil mendaftar dan login, akun Anda otomatis mendapatkan hak akses penuh sebagai **Super Admin**.

---

## 5. Perintah Operasional & Push ke GitHub

### Push Kode Frontend ke GitHub
Pastikan file `.env` masuk ke dalam `.gitignore` agar kredensial lokal tidak ikut ter-upload ke repository publik/privat:
```bash
cd /opt/rahanpas-server-manager/frontend
grep -qxF '.env' .gitignore 2>/dev/null || echo '.env' >> .gitignore

git init
git add .
git commit -m "chore: setup docker deployment and README for frontend"
git branch -M main
# Ganti URL dengan repository GitHub frontend Anda
git remote add origin git@github.com:siprahanpas-bot/rahanpas-server-manager-frontend.git
git push -u origin main
```

### Update Aplikasi dari GitHub di Masa Mendatang
```bash
cd /opt/rahanpas-server-manager/frontend
git pull origin main
docker compose up -d --build
```