# Anteraja Hub Admin Panel (Next Gen AI Academy)

Aplikasi operasional Hub Anteraja dengan UI interaktif, manajemen armada, SLA, dan integrasi Public API. 

## 🏗️ Struktur Asynchronous Data Fetching & State Management

Pada iterasi ini, aplikasi mengimplementasikan manajemen state asinkron menggunakan Custom Hooks dan Context API untuk memenuhi prinsip **Separation of Concerns (SoC)**.

### 1. Context API (`AdminProvider`)
`src/context/AdminContext.tsx`
Context API digunakan sebagai *centralized store* untuk menghindari masalah *prop drilling* ketika membagikan state global ke berbagai komponen UI. 

**State yang dikelola:**
- `adminProfile`: Menyimpan data profil Admin (nama, foto) hasil dari pemanggilan API eksternal.
- `isAlarmMuted`: Menyimpan state pengaturan mute notifikasi kapasitas Hub (yang sebelumnya ada di Zustand, kini dimigrasi ke Context).

Komponen pembungkus `<AdminProvider>` diletakkan di tingkat teratas halaman aplikasi (`MainLayout.tsx`) sehingga *Navbar*, *Sidebar*, dan modul lainnya dapat mengakses `useAdminContext()` secara instan.

### 2. Custom Hooks untuk Data Fetching
Logika untuk menangani pemanggilan API asinkron dengan `useEffect` diabstraksikan ke dalam *hooks* yang reusable dan bersih.

#### `useFetchData.ts`
Custom Hook dasar (generik) yang dirancang agar kebal dari **memory leak** (melalui `AbortController`) dan **infinite re-render** (dependency array yang ketat pada `url`). 
Hook ini me-*return* status standar: `data`, `isLoading`, `isError`, dan `error`.

#### `useAdminProfile.ts`
Hook ini menggunakan `useFetchData` untuk mengkonsumsi **RandomUser API** (`randomuser.me/api`) sebagai simulasi pemanggilan profil "Admin Budi" (termasuk foto avatar). Setelah data sukses di-*fetch*, datanya disimpan ke dalam Context `AdminProvider` agar bisa ditampilkan pada komponen `Sidebar.tsx`.

#### `useHubWeather.ts`
Hook ini memanfaatkan **Open-Meteo API** untuk mengambil kondisi cuaca dan temperatur langsung di koordinat lokasi Hub (misal: Jakarta Selatan). Data tersebut dikonsumsi oleh `Navbar.tsx` untuk menampilkan indikator widget cuaca yang dinamis kepada Admin. Widget cuaca juga menangani visual *loading spinner* atau pesan peringatan jika API gagal diakses.

## 🗺️ Route Map & SPA Routing (React Router DOM)

Pada modul ini, aplikasi telah berevolusi menjadi **Single Page Application (SPA)** seutuhnya menggunakan `react-router-dom`. Transisi halaman tidak lagi memicu _full page reload_.

### 1. Struktur Layout (Persistent UI)
Semua halaman dibungkus oleh komponen `<MainLayout>`. Komponen ini mengandung *Sidebar* dan *Navbar* yang konstan/permanen. Konten halaman di-inject secara dinamis melalui komponen `<Outlet />` dari React Router. Hal ini sangat menghemat *resource* rendering karena antarmuka utama tidak di-*render* ulang dari nol.

### 2. Daftar Route Utama
```text
/                      -> Redirect otomatis ke /sla-queue
/sla-queue             -> Dashboard SlaQueue (SLA & Kinerja)
/inbound               -> Manajemen Inbound Sorting & Fleet ACK
/outbound              -> Manajemen Outbound Dispatch
/manifest-generator    -> Pembuatan Data Manifest Eksternal
/shipments/:id         -> Dynamic Route: Detail Manifest / Resi
/*                     -> Catch-All: Halaman 404 Not Found
```

### 3. Dynamic Parameters & Programmatic Navigation
- **`useParams`**: Digunakan di dalam halaman `/shipments/:id` (komponen `ShipmentDetail.tsx`). ID resi (misal: `MNF-2409-1234`) diambil dari parameter URL dan digunakan untuk mengambil data spesifik dari Context API / Global Store. Jika ID tidak valid, sistem memunculkan tampilan *Empty State* (Data Tidak Ditemukan).
- **`useNavigate`**: Diterapkan pada komponen baris tabel (`InboundTableRow.tsx` dan `ManifestLogRow.tsx`) untuk memindahkan (navigasi) pengguna secara terprogram (*programmatic routing*) ke halaman detail resi setelah tombol "Detail" diklik, menggantikan sistem *Modal* sebelumnya. Juga digunakan untuk tombol "Kembali" (`navigate(-1)`).
- **Fallback 404**: Jika pengguna memasukkan URL sembarangan, halaman `NotFound.tsx` yang interaktif akan muncul.

## 🚀 Instalasi & Menjalankan

1. Instalasi dependensi:
   ```bash
   npm install
   ```
2. Jalankan secara lokal:
   ```bash
   npm run dev
   ```
