# COLLECTEAK

Website Collecteak, kolektif musik elektronik Jakarta (RnB, Hip Hop, UK Garage, dan lainnya).
Site statis: HTML, CSS, dan JavaScript tanpa build step.

Live: https://farrizkyibnu.github.io/collecteak/

## Struktur

```
index.html
assets/
  css/style.css            semua style (warna/ukuran di variabel :root)
  js/main.js               animasi & interaksi utama
  js/*.js                  script kecil (grain, FAB, form booking, toggle venue, dll)
  js/vendor/               GSAP, ScrollTrigger, Lenis
  img/ui/                  logo, hero, cover, poster video, favicon
  img/talent/              foto performer
  img/gallery/             foto galeri
  img/venues/              logo venue
  img/brands/              logo brand
  img/share-preview.webp   gambar preview saat link dibagikan
  video/collecteak_loop.mp4
```

Semua gambar berformat `.webp` (kecuali `apple-touch-icon.png`, karena iOS belum mendukung webp untuk icon itu).

## Jalankan lokal

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

## Ubah konten

- Teks, event, dan link: edit langsung di `index.html`.
- Gambar: ganti file di `assets/img/...` dengan nama yang sama (format `.webp`).
- Warna dan ukuran: variabel `:root` di `assets/css/style.css`.

## Catatan

Font (Google Fonts), Three.js, YouTube, dan SoundCloud dimuat dari internet, jadi butuh koneksi.

## Deploy

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`.
