# Rahanpas Server Manager – Frontend

Frontend aplikasi Rahanpas Server Manager menggunakan Nuxt 3 dan Node.js 22.

Repository ini dikelola secara independen dari backend Laravel dan dapat dibangun serta dijalankan menggunakan Docker.

## 1. Technology Stack

| Komponen | Teknologi |
|---|---|
| Framework | Nuxt 3.17.5 |
| Runtime | Node.js 22 |
| Package manager | npm |
| Production server | Nitro |
| RDP client | guacamole-common-js |
| Container | Docker |

## 2. Requirements

- Docker Engine
- Docker Compose Plugin
- Backend Laravel Rahanpas Server Manager
- Docker network yang dapat mengakses backend
- RDP WebSocket Bridge dan Guacamole Proxy untuk fitur RDP
- ONLYOFFICE Document Server untuk integrasi dokumen

## 3. Installation

Clone repository:

```bash
git clone <FRONTEND_REPOSITORY_URL> rahanpas-server-manager-frontend
cd rahanpas-server-manager-frontend
```

## 4. Environment Configuration

Buat file konfigurasi:

```bash
cp .env.example .env
```

Variabel konfigurasi:

| Variable | Default | Keterangan |
|---|---|---|
| APP_PORT | 13000 | Port aplikasi pada host |
| NITRO_HOST | 0.0.0.0 | Alamat bind Nitro |
| NITRO_PORT | 3000 | Port internal container |
| NUXT_API_INTERNAL_BASE | http://rahanpas-backend-nginx/api | URL backend Laravel |
| DOCKER_NETWORK | baota_net | External Docker network |
| CONTAINER_NAME | rahanpas-server-manager-frontend | Nama container |

Contoh konfigurasi:

```dotenv
APP_PORT=13000
NITRO_HOST=0.0.0.0
NITRO_PORT=3000
NUXT_API_INTERNAL_BASE=http://rahanpas-backend-nginx/api
DOCKER_NETWORK=baota_net
CONTAINER_NAME=rahanpas-server-manager-frontend
```

Penting:
- `NUXT_API_INTERNAL_BASE` harus menunjuk ke backend Laravel yang dapat dijangkau dari container frontend.
- Jangan menggunakan `localhost` untuk mengakses container backend lain.
- Sesuaikan nama host backend dengan service atau alias Docker yang digunakan pada deployment.
- Jangan commit file `.env`.

## 5. Docker Network

Frontend dan backend perlu terhubung melalui Docker network yang sama.

Buat network jika belum tersedia:

```bash
docker network create baota_net
```

Jika network sudah tersedia, perintah tersebut tidak perlu dijalankan kembali.

## 6. Docker Compose Deployment

Build image:

```bash
docker compose build
```

Jalankan aplikasi:

```bash
docker compose up -d
```

Periksa status:

```bash
docker compose ps
docker compose logs -f frontend
```

Akses aplikasi:

```text
http://localhost:13000
```

Port host dapat diubah melalui `APP_PORT` pada `.env`.

## 7. Docker Deployment without Compose

Build image:

```bash
docker build -t rahanpas-server-manager-frontend:latest .
```

Jalankan container:

```bash
docker run -d \
  --name rahanpas-server-manager-frontend \
  --restart unless-stopped \
  --network baota_net \
  -p 13000:3000 \
  -e NODE_ENV=production \
  -e NITRO_HOST=0.0.0.0 \
  -e NITRO_PORT=3000 \
  -e NUXT_API_INTERNAL_BASE=http://rahanpas-backend-nginx/api \
  rahanpas-server-manager-frontend:latest
```

Sesuaikan port, network, dan alamat backend dengan deployment.

## 8. Development

Persyaratan:
- Node.js 22
- npm

Install dependencies:

```bash
npm ci
```

Jalankan development server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 9. Backend Integration

Frontend menggunakan Nuxt server routes untuk berkomunikasi dengan Laravel API.

Konfigurasi alamat backend menggunakan:

```text
NUXT_API_INTERNAL_BASE
```

Contoh:

```text
http://rahanpas-backend-nginx/api
```

Backend harus dapat dijangkau dari container frontend melalui Docker network atau alamat jaringan yang sesuai.

API digunakan untuk:
- Authentication dan user management
- Server management
- Infrastructure monitoring
- Remote file management
- RDP session
- ONLYOFFICE integration

## 10. External Service Dependencies

Fitur tertentu membutuhkan service terpisah dari frontend.

| Service | Fungsi | Port default |
|---|---|---|
| Laravel Backend | REST API dan business logic | Sesuai deployment |
| RDP WebSocket Bridge | Koneksi RDP melalui browser | 13002 |
| Guacamole Proxy (`guacd`) | Proxy remote desktop | 4822 internal |
| ONLYOFFICE Document Server | Membuka dan mengedit dokumen | 13009 |

Keterangan:
- `guacamole-common-js` merupakan dependency frontend.
- RDP WebSocket Bridge dan `guacd` bukan bagian dari image frontend.
- ONLYOFFICE Document Server dijalankan sebagai service terpisah.
- Browser pengguna harus dapat menjangkau port publik RDP dan ONLYOFFICE.
- Port di atas merupakan default deployment dan dapat disesuaikan.

## 11. Production Deployment

Urutan deployment yang disarankan:

1. Siapkan Docker network bersama.
2. Deploy backend Laravel dan service pendukung.
3. Pastikan backend dapat diakses dari Docker network.
4. Konfigurasikan `NUXT_API_INTERNAL_BASE`.
5. Build dan deploy frontend.
6. Verifikasi halaman frontend dan koneksi API.
7. Verifikasi akses RDP dan ONLYOFFICE melalui browser jika digunakan.

## 12. Security

- Jangan commit `.env`.
- Jangan menyimpan password, token, atau private key di repository.
- Gunakan `.env.example` sebagai template konfigurasi.
- Gunakan HTTPS untuk production.
- Batasi akses port internal service sesuai kebutuhan.
- Simpan credential dan secret pada konfigurasi deployment yang aman.

## 13. Git Repository

Repository frontend dikelola secara independen dari backend.

```bash
git status
git add .
git commit -m "Initial frontend repository"
```

## 14. License

Private project — Rahanpas Server Manager.
