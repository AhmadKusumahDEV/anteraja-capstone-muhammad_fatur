# UI Component Guidelines - Anteraja Hub Admin

Aturan ini harus selalu diikuti saat memodifikasi komponen UI atau membangun halaman baru.

## 1. General UI Rules
- **Semantic HTML**: Selalu gunakan tag semantic HTML5 yang tepat (misal: `<nav>`, `<aside>`, `<main>`, `<section>`, `<header>`, `<footer>`) untuk tujuan SEO dan struktur yang baik.
- **Styling**: Gunakan Tailwind CSS secara eksklusif. Hindari penambahan CSS eksternal kecuali untuk token desain di `index.css`.
- **Strict TypeScript**: Pastikan penulisan typing TypeScript yang ketat dan benar (misalnya, mendefinisikan tipe `ReactNode` untuk prop `children` di komponen Layout).
- **Tanpa Halaman Login**: Fitur Login saat ini ditunda (FRD 01 ditunda). **JANGAN** membuat, merouting, atau menyarankan halaman Login.

## 2. Sidebar Component (`<aside>`)
- **Ukuran Logo**: Logo Anteraja harus berukuran spesifik `width={81}` dan `height={81}` dengan class `rounded-xl flex-shrink-0`.
- **Teks Brand**: Teks "anteraja" harus diberi padding kiri (`pl-1`) agar rata/sejajar secara visual dengan elemen di atas dan bawahnya.
- **Active State**: Item navigasi yang aktif harus menggunakan background `bg-anteraja-primary` beserta efek shadow.

## 3. Navbar Component (`<nav>`)
- **Left Section**: Dibiarkan kosong atau hanya digunakan untuk Breadcrumb halaman.
- **Right Section (Unified Pill)**: Informasi kode Hub (`HUB-JKS-01`) dan Jam real-time (`WIB`) wajib digabungkan menjadi satu elemen "pill" (`rounded-full bg-gray-100`) dan diletakkan di sisi kanan layar, tepat sebelum ikon Notifikasi.

## 4. Struktur Halaman Dasar
- Semua halaman (SlaQueue, Inbound, Outbound, ManifestGenerator) wajib dibungkus di dalam `<MainLayout>` yang mengelola posisi Sidebar dan Navbar.
