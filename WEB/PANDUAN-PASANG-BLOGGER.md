# 📖 Panduan Memasang Tema XML di Blogger (Blogspot)

Berikut adalah panduan lengkap langkah demi langkah untuk menerapkan tema **Simulasi Rangkaian Listrik** ke blog Blogger Anda:

---

## 📁 Berkas yang Tersedia di Folder `WEB/`

| Nama Berkas | Keterangan & Fungsi |
|---|---|
| **`tema-blogger-rangkaian-listrik.xml`** | **Berkas Utama Tema XML Blogger**. Siap diunggah (*Pulihkan/Restore*) langsung di dashboard Blogger. |
| **`preview-tema.html`** | Berkas pratinjau tampilan tema web (dapat dibuka langsung di browser). |
| **`PANDUAN-PASANG-BLOGGER.md`** | Dokumen panduan instalasi ini. |

---

## 🚀 Langkah 1: Cadangkan (Backup) Tema Lama (Opsional tapi Disarankan)

1. Buka dashboard **[Blogger](https://www.blogger.com/)** dan login dengan akun Google Anda.
2. Di menu bilah kiri, klik menu **Tema (Theme)**.
3. Di samping tombol oranye *Sesuaikan (Customize)*, klik tanda panah ke bawah `▼`.
4. Pilih **Cadangkan (Backup)** -> klik **Download**.
5. Simpan file cadangan tersebut di komputer Anda.

---

## 🚀 Langkah 2: Unggah Tema Baru (`.xml`)

1. Pada halaman **Tema (Theme)** di Blogger, klik kembali tanda panah ke bawah `▼` di samping tombol *Sesuaikan*.
2. Pilih **Pulihkan (Restore)**.
3. Klik tombol **Upload**.
4. Arahkan dan pilih file:
   ```
   WEB/tema-blogger-rangkaian-listrik.xml
   ```
5. Tunggu 5–10 detik hingga muncul notifikasi: *"Tema berhasil dipulihkan"*.

---

## 🚀 Langkah 3: Matikan Tampilan Tema Seluler Default Blogger

Agar Blogger menampilkan tampilan responsif modern di smartphone (bukan tema jadul bawaan seluler):
1. Pada menu **Tema**, klik kembali tanda panah ke bawah `▼`.
2. Pilih **Setelan Seluler (Mobile Settings)**.
3. Pilih opsi **Desktop** (atau *"Tidak, tampilkan tema desktop pada perangkat seluler"*).
4. Klik **Simpan (Save)**.

---

## 🌐 Menghubungkan ke GitHub Pages

Secara default, tema ini memuat simulasi dari:
```
https://rwandaz.github.io/simulasi-rangkaian-listrik/
```
Setelah repositori diunggah ke GitHub dan fitur GitHub Pages diaktifkan, simulasi interaktif akan otomatis muncul di dalam bingkai kaca (*glass container*) di blog Anda secara langsung tanpa perlu pengaturan tambahan!

---

## 💡 Alternatif: Menyematkan ke Dalam Satu Artikel Saja (Iframe View)

Jika Anda ingin mempertahankan tema blog Anda saat ini dan **hanya ingin menyematkan simulasi ke dalam salah satu artikel postingan**:
1. Buat postingan baru di Blogger.
2. Ubah mode penulisan ke **Tampilan HTML (HTML View)** (ikon pensil di kiri atas editor).
3. Salin dan tempel kode berikut:
```html
<div style="position: relative; width: 100%; height: 680px; max-height: 85vh; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(2, 132, 199, 0.2); margin: 20px 0; background: #0f172a;">
  <iframe 
    src="https://rwandaz.github.io/simulasi-rangkaian-listrik/" 
    style="width: 100%; height: 100%; border: none;" 
    allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" 
    allowfullscreen="true">
  </iframe>
</div>
<p style="text-align: center; font-size: 13px; color: #64748b;">
  ⚡ <em>Simulasi Rangkaian Listrik interaktif oleh Pak Rwanda. Klik tombol layar penuh di kanan atas untuk pengalaman terbaik.</em>
</p>
```
4. Publikasikan artikel Anda!
