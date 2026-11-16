# Rahanpas Server Manager - Frontend

Frontend interface untuk Rahanpas Server Manager yang dibangun menggunakan **Nuxt 3** dan didingkus menggunakan Docker. Mendukung pengaturan port secara fleksibel melalui file `.env`.

---

## 🚀 Prasyarat
- Docker & Docker Compose terinstal di server.
- Akses Git / SSH Key terhubung ke GitHub.

---

## 📦 Panduan Instalasi & Deployment

### 1. Clone Repository
```bash
git clone git@github.com:siprahanpas-bot/rahanpas-server-manager-frontend.git .
2. Konfigurasi Environment (.env)
Salin file .env.example menjadi .env dan sesuaikan port publik sesuai keinginan Anda:
cp .env.example .env
nano .env
Contoh isi .env:
FRONTEND_PORT=3000
DOCKER_NETWORK=baota_net
3. Menjalankan Docker Container
Pastikan Docker network eksternal tersedia, lalu build dan jalankan:
docker network create baota_net || true
docker compose up -d --build
🛠️ Penjelasan Third-Party / Tech Stack
Nuxt 3 (Vue.js Framework): Framework SSR/SPA modern untuk antarmuka pengguna.

Guacamole Common JS (guacamole-common-js): Pustaka pihak ketiga yang digunakan untuk merender tampilan klien remote desktop (RDP/VNC) langsung di browser secara interaktif.

Docker Multi-stage Build / Node Alpine: Lingkungan kontainerisasi yang ringan dan optimal untuk build serta production runtime aplikasi Nuxt.
