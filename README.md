Rahanpas Server Manager — Frontend
Antarmuka web untuk Rahanpas Server Manager yang dibangun menggunakan Nuxt 3 (SSR & Server API Proxy) dan dijalankan di dalam Docker.

Repository: git@github.com:siprahanpas-bot/rahanpas-server-manager-frontend.git

1. Arsitektur & Third-Party yang Terpasang
Nuxt 3 (3.17.5) — Framework utama berbasis Vue 3 dengan mesin server Nitro untuk rendering dan internal API routing (/manager-api).

Guacamole Common JS (guacamole-common-js ^1.5.0) — Pustaka klien HTML5 resmi dari Apache Guacamole untuk menampilkan dan mengontrol sesi Remote Desktop (RDP/VNC) langsung di browser melalui WebSocket.

Docker Multi-Stage Node Alpine — Menjalankan proses nuxt build dan menyajikan aplikasi production secara ringan.

2. Panduan Deployment
Langkah 1: Clone Repository
Bash
git clone git@github.com:siprahanpas-bot/rahanpas-server-manager-frontend.git /opt/rahanpas-server-manager/frontend
cd /opt/rahanpas-server-manager/frontend
Langkah 2: Konfigurasi .env & Custom Port
Salin file .env.example menjadi .env:

Bash
cp .env.example .env
nano .env
Sesuaikan port dan alamat internal backend:

Cuplikan kode
# Ubah APP_PORT sesuai port yang diinginkan di server
APP_PORT=13000

CONTAINER_NAME=rahanpas-server-manager-frontend
DOCKER_NETWORK=baota_net

NITRO_HOST=0.0.0.0
NITRO_PORT=3000

# Arahkan ke container Nginx backend dalam satu Docker network
NUXT_API_INTERNAL_BASE=http://rahanpas-backend-nginx/api
Langkah 3: Build & Jalankan Container
Pastikan backend sudah berjalan di network baota_net, lalu jalankan:

Bash
docker network create baota_net 2>/dev/null || true
docker compose up -d --build
Aplikasi frontend kini dapat diakses melalui http://IP_SERVER_ANDA:13000 (atau port lain sesuai APP_PORT).

3. Cara Mengubah Port di Kemudian Hari
Edit nilai APP_PORT di file .env.

Terapkan ulang tanpa perlu rebuild image:

Bash
docker compose up -d
