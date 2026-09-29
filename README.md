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

## 🚀 Instalasi & Menjalankan

1. Instalasi dependensi:
   ```bash
   npm install
   ```
2. Jalankan secara lokal:
   ```bash
   npm run dev
   ```
