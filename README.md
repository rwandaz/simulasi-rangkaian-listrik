# ⚡ Simulasi Rangkaian Listrik Cilik - by Pak Rwanda

Aplikasi web interaktif simulasi rangkaian listrik untuk siswa Sekolah Dasar (SD). Dirancang khusus agar **100% kompatibel dengan layar sentuh (HP, Tablet, Chromebook)**, interaktif, menyenangkan, dan siap diunggah ke **GitHub Pages** serta disematkan langsung di **Blogger (Blogspot)**.

---

## 🌟 Fitur Utama

1. **Mekanisme Sambungan Segmen & Titik Temu Fisik:**
   - **Kabel Fisik di Kotak Alat:** Siswa dapat mengambil kabel sebanyak mungkin, memanjangkannya, memendekkannya, dan menggesernya secara leluasa.
   - **Komponen Kaku (Rigid):** Panjang komponen (baterai, lampu, saklar, mistar, dll.) tetap konsisten dan tidak melar saat ditarik.
   - **Rotasi Presisi 90 Derajat:** Dilengkapi tombol rotasi berikon `🔄` dengan jarak aman agar tidak menutupi komponen.
   - **Sistem Magnet (*Snap & Merge*) & Sambungan Otomatis Saat Drag & Drop:**
     - Saat menarik komponen dari kotak alat maupun menggeser badan komponen, komponen otomatis mendeteksi titik terdekat dengan halo magnet dan langsung tersambung (*"KLEK!"*).
     - Jika diletakkan di celah antara dua titik (*gap bridging*), komponen langsung menyambungkan **kedua titik sekaligus** menjadi sirkuit tertutup.
   - **Alat Gunting di Titik Sambung (Scissors):** Mengklik titik sambungan memunculkan tombol **✂️ Gunting** berjarak aman untuk memisahkan komponen kembali.
   - **Memulai dengan Kanvas Bersih (Empty Canvas on Startup):** Aplikasi langsung menyambut siswa dengan papan kerja bersih dan kosong, siap untuk kreasi bebas tanpa komponen bawaan yang menghalangi.
   - **Layar Pemuatan Edukatif (App Loading Screen):** Dilengkapi animasi pemuatan modern berupa atom listrik berputar, orbit partikel, progress bar interaktif, dan transisi fade-out halus saat aplikasi siap digunakan.
   - **Tombol Aksi Mengambang di Luar Petak Sorotan:** Tombol rotasi (`🔄`), pembalik kutub (`⇄`), pengaturan volt (`⚡`), dan hapus (`🗑️`) otomatis diposisikan melayang secara presisi **di luar batas petak sorotan (selection highlight)** sehingga komponen dan indikator tidak pernah tertutupi.
   - **Pilihan Aliran Listrik (Elektron vs Arus vs Nonaktif/Mati):** Pilihan fleksibel antara **Aliran Elektron** (− ke +), **Arus Konvensional** (+ ke −), atau **Nonaktifkan Semua (Mati 🚫)** untuk mematikan seluruh animasi partikel.
   - **Kontrol Zoom Kanvas:** Fitur zoom in (`➕`), zoom out (`➖`), reset (`100%`), scroll mouse, dan gestur cubit dua jari (pinch gesture) pada layar sentuh.

2. **Komponen Visual & Fisika Realistis (Hukum Ohm & Sirkuit Dinamis):**
   - **Kecerahan Lampu Bohlam Proporsional Tegangan:**
     - Kecerahan bohlam berubah secara kontinu sesuai tegangan ($0–24\text{V}$): dari redup hangat ($<1.1\text{V}$), standar terang ($1.5–3\text{V}$), hingga putih berkilau sangat terang ($>3\text{V}$) dengan lingkaran aura pendar (*radiant halo*) dan berkas sinar cahaya yang memanjang serta memancarkan kilau bintang (*sparkle beams*).
     - Rangkaian seri otomatis membagi tegangan sehingga lampu menyala lebih redup, sedangkan rangkaian paralel memberikan tegangan penuh ke setiap cabang.
   - **Kecepatan Putaran Dinamo Motor DC Proporsional Tegangan:**
     - Kecepatan baling-baling motor dinamo bertambah kencang seiring naiknya voltase baterai ($0–24\text{V}$). Pada voltase tinggi ($>2.5\text{V}$), muncul efek cincin pusaran *motion blur* realistis yang menggambarkan RPM tinggi.
     - Arah putaran baling-baling (searah vs berlawanan jarum jam) mengikuti arah polaritas arus listrik konvensional secara fisik!
   - **Kecepatan Aliran Partikel Listrik Proporsional Arus:**
     - Kecepatan hanyut partikel (elektron dan arus konvensional) bergerak sebanding dengan kuat arus riil ($I = \mathcal{E} / R$). Arus kecil mengalir lambat, arus besar mengalir deras, dan korsleting melesat sangat cepat.
   - **Resistor / Hambatan Listrik (10 Ohm):**
     - Komponen resistor keramik dengan gelang warna presisi (Coklat, Hitam, Hitam, Emas = $10\Omega$). Menghambat arus listrik secara nyata dan membagi tegangan saat dipasang seri dengan lampu maupun dinamo.
   - **Instrumen Multimeter & Amperemeter Realistis (Dock Samping Kanan):**
     - **Panel Dock Instrumen di Samping Kanan:** Siswa dapat mencentang atau mengklik kartu Voltmeter maupun Amperemeter untuk memunculkan instrumen di kanvas.
     - **Voltmeter Portabel (Multimeter Kuning):** Bodi multimeter kuning dengan layar LCD digital besar, port soket COM (−) hitam dan V (+) merah, serta dua jarum probe uji kabel fleksibel yang dapat disentuhkan ke titik sambungan.
     - **Amperemeter Portabel (Meter Biru + Sensor Wand):** Bodi meter biru dengan layar LCD digital dan tongkat sensor portabel ber-target lingkaran silang (`✛`) tanpa perlu memutus rangkaian (*contactless sensor target*).
     - **Kabel Fleksibel Realistis:** Kabel konektor menghubungkan soket instrumen ke jarum probe dan sensor secara dinamis mengikuti gerakan drag & drop.
   - **Bilah Kontrol Bawah Terpadu (Bottom Bar):**
     - Kontrol Zoom terpadu berbentuk pill (`−`, `100%`, `+`) yang responsif pada semua ukuran layar dan gestur sentuh.
     - Tombol **🗑️ Bersihkan Papan** yang menyatu rapi dan langsung merespon klik/sentuhan seketika tanpa terhalang SVG kanvas.
   - **Baterai (Dapat Diatur):** Tombol `⚡` khusus muncul saat baterai dipilih untuk mengatur tegangan ($0–24\text{V}$ dengan step halus $0.5\text{V}$). Kutub (+) dan (−) ditandai dengan jelas.
   - **Panel Surya Fotovoltaik:** Sumber daya energi terbarukan ramah lingkungan dengan kisi busbar sel silikon dan pengaturan tegangan ($0–24\text{V}$).
   - **Dinamo Motor DC (Baling-Baling Menghadap ke Atas):** Desain ergonomis dengan poros vertikal di mana baling-baling 3 daun berputar menghadap ke atas (*upward-facing propeller*). Kedua titik terminal (− dan +) di kiri dan kanan sepenuhnya terbuka, bersih, dan bebas hambatan sehingga kabel sangat mudah dipasang!
   - **Saklar Pisau:** Tuas mekanik klik ON/OFF dengan indikator status.
   - **Benda Uji Realistis:** Paku Besi baja & Koin Emas logam berigi (Konduktor), Penghapus karet dual-tone & Mistar bergaris ukuran cm nyata (Isolator).
   - **Fisika Seri vs Paralel & Multi-Sumber Listrik:** Menghitung GGL total baterai seri maupun paralel serta pembagian potensial secara akurat.
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
├── index.html                            <-- Pengalihan Otomatis (Redirect) ke Rangkaian Listrik/index.html
├── README.md                             <-- Dokumentasi Proyek
├── Rangkaian Listrik/                    <-- Folder Utama Aplikasi Simulasi Listrik
│   ├── index.html                        <-- Berkas HTML Utama Simulasi
│   ├── style.css                         <-- Styling Desain Interaktif & Instrumen
│   └── script.js                         <-- Mesin Fisika Rangkaian & Logika Interaksi
├── WEB/                                  <-- Folder Khusus Tema XML Blogger & Panduan
│   ├── tema-blogger-rangkaian-listrik.xml <-- File XML Tema Lengkap Siap Upload ke Blogger
│   ├── preview-tema.html                 <-- Pratinjau Tampilan Web Lokal
│   └── PANDUAN-PASANG-BLOGGER.md         <-- Panduan Pasang Tema di Blogger
└── hapus/                                <-- Arsip Berkas yang Dipindahkan dari Root
    ├── index.html
    ├── style.css
    └── script.js
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
