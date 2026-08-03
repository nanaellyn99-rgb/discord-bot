# Skenario Pengujian Bot Ticket NarwHall MC

Dokumen ini berisi langkah-langkah untuk memastikan semua fitur bot berfungsi dengan benar setelah deploy.

## 1. Pengujian Panel Utama
*   **Langkah:** Ketik `/ticket setup` di channel yang diinginkan.
*   **Hasil yang Diharapkan:**
    *   Bot mengirimkan Embed dengan desain baru (berisi aturan ⚠️ dan ✅).
    *   Terdapat Select Menu di bawahnya dengan 3 kategori.
    *   Menu pilihan kembali ke tulisan awal ("Pilih kategori...") setelah diklik.

## 2. Pengujian Formulir (Modal)
*   **Langkah:** Pilih salah satu kategori dari menu.
*   **Hasil yang Diharapkan:**
    *   Muncul jendela pop-up (Modal) berjudul "Formulir Laporan Tiket".
    *   Terdapat input "Judul Masalah" dan "Detail Masalah".
    *   Bot tidak membuat tiket sebelum formulir dikirim.

## 3. Pengujian Pembuatan Tiket
*   **Langkah:** Isi formulir dan klik "Submit".
*   **Hasil yang Diharapkan:**
    *   Muncul channel baru di kategori yang benar (misal: `#ticket-bug-username`).
    *   Bot mengirimkan Embed rapi di channel tersebut yang berisi Judul dan Detail yang diisi tadi.
    *   Bot men-tag Role Staff dan Pengguna.
    *   Hanya Pengguna dan Staff yang bisa melihat channel tersebut.

## 4. Pengujian Notifikasi DM & Klaim (Internal)
*   **Langkah:** (Opsional, jika tombol klaim masih ada di versi tertentu) Klik tombol Klaim.
*   **Hasil yang Diharapkan:** Bot mengirim DM ke pengguna bahwa tiket sedang ditangani.

## 5. Pengujian Penutupan Tiket & Transkrip
*   **Langkah:** Klik tombol "Tutup Tiket" 🔒 di dalam channel tiket.
*   **Hasil yang Diharapkan:**
    *   Bot mengirim pesan "Sedang menutup tiket...".
    *   **PENTING:** Pengguna menerima file transkrip HTML di DM mereka.
    *   Channel log transkrip (Staff) menerima log dan file transkrip yang sama.
    *   Channel tiket terhapus otomatis setelah 5 detik.

---
**Catatan:** Jika ada langkah yang gagal, periksa tab **Logs** di Railway untuk melihat pesan error spesifik.
