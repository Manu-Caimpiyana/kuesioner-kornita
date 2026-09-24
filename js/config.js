/* ================================================
   KONFIGURASI APLIKASI KUESIONER
   SMA Kornita IPB Bogor
   ================================================

   CARA SETUP SUPABASE:
   1. Buat akun di https://supabase.com
   2. Buat project baru
   3. Buka SQL Editor di Supabase Dashboard
   4. Jalankan SQL berikut untuk membuat tabel:

   --------------------------------------------------
   CREATE TABLE responses (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     nama TEXT NOT NULL,
     kelas TEXT NOT NULL,
     answers JSONB NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(nama, kelas)
   );

   ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Allow anonymous inserts"
     ON responses FOR INSERT
     WITH CHECK (true);

   CREATE POLICY "Allow anonymous reads"
     ON responses FOR SELECT
     USING (true);
   --------------------------------------------------

   5. Salin URL dan anon key dari Settings > API
   6. Isi SUPABASE_URL dan SUPABASE_ANON_KEY di bawah

   ================================================ */

const APP_CONFIG = {
  // ── Supabase Configuration ──
  // Kosongkan jika belum setup, otomatis pakai localStorage
  SUPABASE_URL: 'https://xtljuezqbcqtmllcjqtb.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0bGp1ZXpxYmNxdG1sbGNqcXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMjk0MTgsImV4cCI6MjEwNTgwNTQxOH0.-f7mGlVe5ZSikdDkqm1bPe7Rsqs96kM5qAXCwikCOs4',
  SUPABASE_TABLE: 'responses',

  // ── Application Settings ──
  APP_NAME: 'Kuesioner Sikap Disiplin Siswa',
  SCHOOL_NAME: 'SMA Kornita IPB Bogor',

  // ── Daftar Kelas (Kurikulum Merdeka) ──
  // Anda dapat menambah, mengubah, atau mengurangi nama kelas sesuai kebutuhan
  CLASSES: [
    {
      group: 'Kelas X (Fase E)',
      items: ['X-1', 'X-2', 'X-3', 'X-4'],
    },
    {
      group: 'Kelas XI (Fase F)',
      items: ['XI-1', 'XI-2', 'XI-3', 'XI-4'],
    },
    {
      group: 'Kelas XII (Fase F)',
      items: ['XII-1', 'XII-2', 'XII-3', 'XII-4'],
    },
  ],

  // ── Question Sections (Aspek Kedisiplinan) ──
  // Setiap section memiliki judul aspek dan daftar pertanyaan
  // Anda dapat mengubah atau menyesuaikan teks pertanyaan kapan saja
  SECTIONS: [
    {
      title: 'A. Kedisiplinan Waktu & Kehadiran',
      description: 'Pernyataan terkait ketepatan waktu hadir di sekolah dan kegiatan belajar.',
      questions: [
        'Saya selalu datang ke sekolah tepat waktu sebelum bel berbunyi.',
        'Saya tidak pernah terlambat masuk kelas setelah jam istirahat berakhir.',
        'Saya tidak pernah membolos atau meninggalkan sekolah tanpa izin guru.',
        'Saya mengikuti upacara bendera dan kegiatan sekolah tepat pada waktunya.',
        'Saya memanfaatkan waktu istirahat dan jam kosong dengan hal yang bermanfaat.',
      ],
    },
    {
      title: 'B. Kepatuhan Tata Tertib & Kerapian',
      description: 'Pernyataan terkait pemakaian seragam dan kepatuhan norma sekolah.',
      questions: [
        'Saya mengenakan seragam sekolah lengkap dan rapi sesuai jadwal harian.',
        'Saya memakai atribut sekolah (badge, dasi, ikat pinggang, kaos kaki) sesuai aturan.',
        'Saya mematuhi ketentuan potongan rambut, kuku, dan penampilan yang ditentukan.',
        'Saya tidak membawa barang-barang yang dilarang oleh tata tertib sekolah.',
        'Saya mematuhi aturan penggunaan fasilitas dan area sekolah.',
      ],
    },
    {
      title: 'C. Kedisiplinan Belajar & Akademik',
      description: 'Pernyataan terkait keaktifan dan kejujuran dalam proses pembelajaran.',
      questions: [
        'Saya mengumpulkan tugas dan pekerjaan rumah tepat pada waktu yang ditentukan.',
        'Saya memperhatikan penjelasan guru dengan tertib selama proses pembelajaran.',
        'Saya tidak menggunakan smartphone saat pelajaran kecuali diinstruksikan oleh guru.',
        'Saya bersikap jujur dan tidak mencontek saat mengikuti ujian atau ulangan.',
        'Saya membawa buku pelajaran dan perlengkapan belajar yang dibutuhkan.',
      ],
    },
    {
      title: 'D. Etika, Sikap & Kepedulian Lingkungan',
      description: 'Pernyataan terkait sopan santun, interaksi sosial, dan kepedulian lingkungan.',
      questions: [
        'Saya selalu bertutur kata sopan kepada bapak/ibu guru dan staf sekolah.',
        'Saya menghormati teman dan menjaga ketertiban serta kedamaian di sekolah.',
        'Saya menjaga kebersihan kelas serta membuang sampah pada tempatnya.',
        'Saya merawat dan tidak merusak fasilitas sekolah yang saya gunakan.',
        'Saya bertanggung jawab dan siap menerima konsekuensi atas tindakan saya.',
      ],
    },
  ],

  // Otomatis menggabungkan seluruh pertanyaan dari SECTIONS
  get QUESTIONS() {
    return this.SECTIONS.reduce(function (all, sec) {
      return all.concat(sec.questions);
    }, []);
  },

  // ── Scale Labels ──
  SCALE: {
    1: 'Sangat Tidak Setuju',
    2: 'Tidak Setuju',
    3: 'Setuju',
    4: 'Sangat Setuju',
  },

  SCALE_MIN: 1,
  SCALE_MAX: 4,
};
