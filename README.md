# ⚡ Simulasi Rangkaian Listrik Cilik - by Pak Rwanda

Aplikasi web interaktif simulasi rangkaian listrik untuk siswa Sekolah Dasar (SD). Dirancang khusus agar **100% kompatibel dengan layar sentuh (HP, Tablet, Chromebook)**, interaktif, menyenangkan, dan siap diunggah ke **GitHub Pages** serta disematkan langsung di **Blogger (Blogspot)**.

---

## 🌟 Fitur Utama

1. **Mekanisme Sambungan Segmen & Titik Temu Fisik:**
   - **Kabel Fisik di Kotak Alat:** Siswa dapat mengambil kabel sebanyak mungkin, memanjangkannya, memendekkannya, dan menggesernya secara leluasa.
   - **Komponen Kaku (Rigid):** Panjang komponen (baterai, lampu, saklar, mistar, dll.) tetap konsisten dan tidak melar saat ditarik.
   - **Rotasi Presisi 90 Derajat:** Dilengkapi tombol rotasi berikon `🔄` dengan jarak aman agar tidak menutupi komponen.
   - **Sistem Magnet (*Snap & Merge*):** Ujung lingkaran merah komponen otomatis menempel (*"KLEK!"*) menjadi **1 titik sambungan hitam (*junction*)** saat didekatkan.
   - **Alat Gunting di Titik Sambung (Scissors):** Mengklik titik sambungan memunculkan tombol **✂️ Gunting** berjarak aman untuk memisahkan komponen kembali.
   - **Pilihan Aliran Listrik (Elektron vs Arus vs Nonaktif/Mati):** Pilihan fleksibel antara **Aliran Elektron** (− ke +), **Arus Konvensional** (+ ke −), atau **Nonaktifkan Semua (Mati 🚫)** untuk mematikan seluruh animasi partikel.
   - **Kontrol Zoom Kanvas:** Fitur zoom in (`➕`), zoom out (`➖`), reset (`100%`), scroll mouse, dan gestur cubit dua jari (pinch gesture) pada layar sentuh.

2. **Komponen Visual & Fisika Realistis:**
   - **Alat Ukur Voltmeter Digital:**
     - **Voltmeter Portabel:** Dilengkapi probe kabel merah (+) dan probe hitam (−) yang dapat digeser bebas untuk mengukur beda potensial antar titik sambungan secara akurat.
     - **Voltmeter Rangkaian:** Komponen voltmeter dalam kotak alat yang dapat dipasang paralel di sirkuit untuk membaca voltase secara langsung.
   - **Alat Ukur Amperemeter Digital:**
     - **Amperemeter Sensor Contactless:** Dilengkapi sensor penjepit portabel yang dapat didekatkan ke kabel atau komponen untuk mengukur kuat arus (Ampere) tanpa harus memutus kabel.
     - **Amperemeter Rangkaian:** Komponen amperemeter dalam kotak alat yang dipasang seri di dalam sirkuit dengan layar LCD hijau menyala.
   - **Baterai (Dapat Diatur):** Tombol `⚡` khusus muncul saat baterai dipilih untuk mengatur tegangan (0–24V). Kutub (+) dan (−) ditandai dengan jelas.
   - **Panel Surya Fotovoltaik:** Sumber daya energi terbarukan ramah lingkungan dengan kisi busbar sel silikon dan pengaturan tegangan (0–24V).
   - **Dinamo Motor DC:** Beban motor listrik dengan baling-baling 3 daun yang berputar secara otomatis dan dinamis sesuai tegangan listrik!
   - **Bohlam Pijar:** Radiasi cahaya dan pendar kuning saat dialiri arus listrik.
   - **Saklar Pisau:** Tuas mekanik klik ON/OFF dengan indikator status.
   - **Benda Uji Realistis:** Paku Besi baja & Koin Emas logam berigi (Konduktor), Penghapus karet dual-tone & Mistar bergaris ukuran cm nyata (Isolator).
   - **Fisika Seri vs Paralel & Beban:** Lampu paralel menyala terang penuh, lampu seri menyala redup (*dim*), dan korsleting mendeteksi beban dinamo maupun lampu secara akurat.
   - **Peringatan Korsleting:** Korsleting direct-short menghasilkan animasi api & asap kartun 🔥💨 serta mematikan beban.

3. **Mode Belajar Interaktif & Gamifikasi:**
   - **Mode Lab Bebas (Sandbox):** Bebas merakit sirkuit apa saja tanpa batasan.
   - **Mode Tantangan Misi (6 Level Lengkap):** Dari menyalakan lampu dasar, saklar, rangkaian seri, uji konduktor, putaran baling dinamo, hingga energi hijau panel surya.

4. **Audio Sintesis Mandiri (Web Audio API):**
   - Suara klik saklar, suara "klek" magnetik sambungan, denting lampu menyala, dan musik kemenangan misi (100% offline & bebas error CORS).

---

## 📁 Struktur Berkas Repositori

```
simulasi-rangkaian-listrik/
├── index.html                            <-- Aplikasi Simulasi (Root Entrypoint GitHub Pages)
├── style.css                             <-- CSS Styling Simulasi
├── script.js                             <-- Mesin Fisika & Animasi Simulasi
├── README.md                             <-- Dokumentasi Proyek
├── Rangkaian Listrik/                    <-- Folder Khusus Aplikasi Simulasi
│   ├── index.html
│   ├── style.css
│   └── script.js
└── WEB/                                  <-- Folder Khusus Tema XML Blogger & Panduan
    ├── tema-blogger-rangkaian-listrik.xml <-- File XML Tema Lengkap Siap Upload ke Blogger
    ├── preview-tema.html                 <-- Pratinjau Tampilan Web Lokal
    └── PANDUAN-PASANG-BLOGGER.md         <-- Panduan Pasang Tema di Blogger
```

---

## 🌐 Tautan Resmi Repositori & Live Demo

- **Repositori GitHub:** [https://github.com/rwandaz/simulasi-rangkaian-listrik](https://github.com/rwandaz/simulasi-rangkaian-listrik)
- **Live Demo (GitHub Pages):** [https://rwandaz.github.io/simulasi-rangkaian-listrik/](https://rwandaz.github.io/simulasi-rangkaian-listrik/)
- **Live Demo Folder Aplikasi:** [https://rwandaz.github.io/simulasi-rangkaian-listrik/Rangkaian%20Listrik/](https://rwandaz.github.io/simulasi-rangkaian-listrik/Rangkaian%20Listrik/)

---

## 📝 Cara Memasang Tema di Blogger (Blogspot)

1. Buka dashboard **[Blogger](https://www.blogger.com/)** Anda.
2. Di menu samping kiri, klik **Tema (Theme)**.
3. Klik tanda panah bawah `▼` di samping tombol *Sesuaikan (Customize)* -> pilih **Pulihkan (Restore)**.
4. Klik **Upload**, lalu pilih berkas:
   ```
   WEB/tema-blogger-rangkaian-listrik.xml
   ```
5. Tunggu proses upload selesai. Blog Anda kini memiliki antarmuka pembelajaran interaktif modern lengkap dengan simulator rangkaian listrik yang tersemat rapi!

---

## 💡 Alternatif: Menyematkan ke Dalam Artikel Tertentu (Iframe View)

Jika ingin menampilkan simulasi di dalam satu postingan artikel Blogger saja:
1. Buat postingan artikel baru di Blogger.
2. Ubah mode penulisan ke **Tampilan HTML (HTML View)**.
3. Salin dan tempel kode berikut:

```html
<!-- Simulasi Rangkaian Listrik Cilik - by Pak Rwanda -->
<div style="position: relative; width: 100%; height: 680px; max-height: 85vh; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(2, 132, 199, 0.2); margin: 20px 0; background: #0f172a;">
  <iframe 
    src="https://rwandaz.github.io/simulasi-rangkaian-listrik/" 
    style="width: 100%; height: 100%; border: none;" 
    allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" 
    allowfullscreen="true">
  </iframe>
</div>
<p style="text-align: center; font-size: 13px; color: #64748b; margin-top: 8px;">
  ⚡ <em>Tip: Klik tombol ⛶ (Layar Penuh) untuk tampilan maksimal pada smartphone atau tablet!</em>
</p>
```

4. Klik **Publikasikan**. Simulasi kini aktif di blog Anda!
