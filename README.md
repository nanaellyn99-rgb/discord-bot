# Discord Ticket Bot

Bot Discord ini menyediakan sistem tiket lengkap dengan fitur-fitur seperti pembuatan tiket melalui tombol, embed informatif, auto-tag untuk Customer Service/Admin, dan transkrip tiket otomatis.

## Fitur
- Sistem tiket berbasis tombol interaktif.
- Embed yang informatif untuk panel tiket dan tiket yang dibuat.
- Otomatis membuat channel tiket baru dengan izin yang sesuai.
- Auto-tag peran Customer Service/Admin saat tiket baru dibuat.
- Tombol untuk menutup dan mengklaim tiket.
- Transkrip percakapan tiket otomatis disimpan ke channel log.

## Persyaratan
- Node.js v16.x atau lebih tinggi.
- Akun Discord Bot dengan izin yang diperlukan (Administrator direkomendasikan untuk kemudahan).
- Panel Pterodactyl untuk hosting bot.

## Instalasi dan Konfigurasi

### 1. Kloning Repositori atau Unggah File
Unggah semua file dari proyek ini ke direktori server Pterodactyl Anda.

### 2. Konfigurasi File `.env`
Buat file bernama `.env` di root direktori proyek Anda dan isi dengan informasi berikut:

```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_BOT_CLIENT_ID
GUILD_ID=YOUR_GUILD_ID
TICKET_CATEGORY_ID=YOUR_TICKET_CATEGORY_ID
STAFF_ROLE_ID=YOUR_STAFF_ROLE_ID
TRANSCRIPT_CHANNEL_ID=YOUR_TRANSCRIPT_CHANNEL_ID
```

- `YOUR_BOT_TOKEN`: Token bot Discord Anda. Anda bisa mendapatkannya dari [Discord Developer Portal](https://discord.com/developers/applications).
- `YOUR_BOT_CLIENT_ID`: ID aplikasi (Client ID) bot Discord Anda. Juga ditemukan di Discord Developer Portal.
- `YOUR_GUILD_ID`: ID server (guild) Discord tempat bot akan digunakan. Klik kanan pada nama server di Discord dan pilih "Copy ID" (pastikan Mode Developer aktif).
- `YOUR_TICKET_CATEGORY_ID`: ID kategori channel di server Discord Anda tempat channel tiket baru akan dibuat. Ini akan mengelompokkan semua tiket.
- `YOUR_STAFF_ROLE_ID`: ID peran Customer Service atau Admin di server Discord Anda. Peran ini akan di-tag saat tiket baru dibuat dan memiliki izin untuk mengelola tiket.
- `YOUR_TRANSCRIPT_CHANNEL_ID`: ID channel di server Discord Anda tempat transkrip tiket yang ditutup akan dikirim.

### 3. Instal Dependensi
Di terminal Pterodactyl Anda, navigasikan ke direktori proyek dan jalankan perintah berikut untuk menginstal semua dependensi:

```bash
npm install
```

### 4. Daftarkan Slash Commands
Jalankan skrip berikut untuk mendaftarkan slash commands bot ke Discord. Pastikan `CLIENT_ID` dan `GUILD_ID` di `.env` sudah benar.

```bash
node deploy-commands.js
```

### 5. Jalankan Bot
Setelah semua dependensi terinstal dan slash commands terdaftar, Anda dapat menjalankan bot dengan perintah:

```bash
node index.js
```

### Konfigurasi Pterodactyl Panel

Pastikan konfigurasi startup di panel Pterodactyl Anda diatur untuk menjalankan `node index.js`. Anda mungkin perlu menyesuaikan `Startup Command` di bagian `Startup` server Anda di Pterodactyl.

Contoh Startup Command:
```
/usr/bin/node /home/container/index.js
```
(Sesuaikan `/home/container/` jika direktori proyek Anda berbeda)

Pastikan juga Anda telah mengalokasikan sumber daya yang cukup (RAM, CPU) untuk bot Anda agar berjalan dengan stabil.
