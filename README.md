# Kuesioner Sikap Disiplin Siswa — SMA Kornita IPB Bogor

Website formulir kuesioner sikap disiplin siswa SMA Kornita IPB Bogor (Lab School) dengan tema desain klasik elegan bernuansa **ungu pastel & putih**. Dilengkapi dashboard analisis real-time, visualisasi donut chart per butir pertanyaan, tabel rekap data dengan filter kelas, serta ekspor CSV untuk laporan sekolah.

---

## ✨ Fitur Utama

- **Desain Klasik & Elegan**: Menggunakan tipografi serif (*Playfair Display* & *Lora*), bingkai klasik, aksen ungu pastel, dan ornamen divider.
- **Formulir Terstruktur**:
  - Validasi identitas nama lengkap & pilihan kelas Kurikulum Merdeka (Fase E: X-1 s/d X-4, Fase F: XI-1 s/d XI-4, XII-1 s/d XII-4).
  - Skala penilaian 1 (Sangat Tidak Setuju) hingga 4 (Sangat Setuju).
  - Indikator kemajuan pengisian (*Progress Counter*) interaktif.
  - Pertanyaan dikelompokkan ke dalam 4 aspek kedisiplinan (Waktu, Tata Tertib, Belajar/Akademik, dan Etika/Lingkungan).
- **Notifikasi Pintar**: Pesan toast melayang dengan tombol tutup (X) dan *auto-dismiss* halus tanpa glitch.
- **Modal Konfirmasi Pengiriman**: Dialog konfirmasi sebelum pengiriman jawaban untuk mencegah ketidaksengajaan.
- **Pencegahan Duplikasi**: Sistem pengecekan satu pengisian per kombinasi nama & kelas siswa.
- **Dashboard Owner**:
  - Kartu statistik ringkasan (Total Responden, Rata-rata Skor Keseluruhan, Skor Tertinggi & Terendah).
  - 20 Donut Chart interaktif (Chart.js) dengan palet gradasi ungu.
  - Tabel rincian responden siswa lengkap dengan waktu pengisian & rata-rata skor per siswa.
  - Filter interaktif berdasarkan kelas rombel.
  - Ekspor data responden ke file format CSV / Microsoft Excel (mendukung karakter UTF-8).
- **Penyimpanan Fleksibel**:
  - Berjalan langsung menggunakan **localStorage** browser tanpa konfigurasi awal.
  - Siap dihubungkan ke cloud database **Supabase** (PostgreSQL) hanya dengan mengisi kredensial di `js/config.js`.

---

## 📁 Struktur Berkas

```
kuesioner-kornita/
├── assets/
│   └── logo.png              # Logo SMA Kornita IPB Bogor
├── css/
│   └── style.css             # Desain & stylesheet utama (ungu pastel & putih)
├── js/
│   ├── config.js             # Konfigurasi aplikasi, pertanyaan, dan daftar kelas
│   ├── storage.js            # Layer penyimpanan data (localStorage & Supabase)
│   ├── form.js               # Logika formulir, validasi, dan interaksi modal
│   └── dashboard.js          # Logika visualisasi chart, tabel, & ekspor CSV
├── index.html                # Halaman pembuka (Landing Page)
├── form.html                 # Halaman pengisian kuesioner
├── thankyou.html             # Halaman terima kasih setelah pengiriman
├── dashboard.html            # Halaman dashboard hasil kuesioner (Owner)
└── README.md
```

---

## 🚀 Cara Menjalankan Secara Lokal

Cukup buka berkas HTML langsung pada peramban web (*browser*), atau jalankan server lokal:

```bash
# Menggunakan npx serve
npx serve .

# Atau menggunakan ekstensi Live Server di VS Code
```

Akses melalui peramban:
- **Landing Page**: `http://localhost:3000/index.html`
- **Form Kuesioner**: `http://localhost:3000/form.html`
- **Dashboard Owner**: `http://localhost:3000/dashboard.html`

---

## ⚙️ Menghubungkan ke Supabase (Opsional)

Jika ingin menyimpan seluruh respons murid secara terpusat di cloud:
1. Buat proyek baru di [Supabase](https://supabase.com).
2. Jalankan perintah SQL yang tertera pada bagian atas berkas [`js/config.js`](js/config.js) di SQL Editor Supabase.
3. Salin `URL` dan `Anon Key` dari menu **Project Settings > API**.
4. Tempelkan kredensial tersebut ke variabel `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di [`js/config.js`](js/config.js).

---

© 2026 SMA Kornita IPB Bogor — Lab School
