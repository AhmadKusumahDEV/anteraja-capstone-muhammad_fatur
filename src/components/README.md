# Dokumentasi Komponen React - Anteraja Hub Capstone

Dokumen ini berisi pemetaan struktur komponen (Tree of Components) serta alur pengelolaan State dan Props dalam proyek refaktorisasi UI ke arsitektur React (Vite).

## 🌳 Struktur Komponen (Tree of Components)

Aplikasi ini menggunakan pendekatan arsitektur **Feature-Sliced Design** yang membagi antarmuka menjadi halaman utama (`pages`), fitur modul spesifik (`features`), dan komponen UI *reusable* (`components`).

```text
App / MainLayout
├── components/ (Komponen General)
│   ├── Navbar (Navigasi Atas)
│   ├── Sidebar (Navigasi Samping)
│   ├── HubCapacityCard (Kartu Indikator Kapasitas)
│   ├── CapacityAlarm (Sistem Peringatan Kapasitas Hub)
│   └── SharedManifestModal (Modal global untuk detail manifest)
│
└── pages/ (Halaman Utama Aplikasi)
    ├── Inbound (Penerimaan Barang)
    │   ├── features/inbound/InboundStatWidget
    │   ├── features/inbound/InboundTable
    │   └── features/inbound/InboundConfirmModal
    │
    ├── Outbound (Pengiriman Barang)
    │   ├── features/outbound/OutboundStatCards
    │   ├── features/outbound/DispatchBatchCard
    │   └── features/outbound/CreateBatchModal
    │
    ├── SlaQueue (Antrean Berdasarkan SLA)
    │   ├── features/sla-queue/MetricCards
    │   ├── features/sla-queue/CapacityAlert
    │   ├── features/sla-queue/SlaQueueTable
    │   │   └── SlaQueueTableRow (Rendering list dinamis melalui .map)
    │   └── features/sla-queue/QuickDispatchModal
    │
    └── ManifestGenerator (Simulasi Pembuatan Manifest)
        ├── features/manifest/ManifestConfigForm (Controlled Form Component)
        ├── features/manifest/ManifestPreview
        └── features/manifest/ManifestLogTable
```

## 🔄 Alur Props & State (Data Flow)

Aplikasi ini menggunakan pola **Unidirectional Data Flow** (aliran data satu arah) yang dipadukan dengan **Global State Management (Zustand)** untuk efisiensi render yang modern.

### 1. Pengelolaan Global State (Zustand)
Alih-alih melakukan *prop-drilling* (mengirim props melewati terlalu banyak layer), data bisnis utama dikelola secara terpusat melalui folder `src/store/`:
- **`useHubStore`**: Menyimpan data kapasitas Hub saat ini.
- **`useManifestStore`**: Mengelola data interaktif form *generator* manifest dan log riwayat manifest.
- **`useSlaQueueStore`**: Mengatur data antrean paket beserta logika simulasi perhitungan sisa waktu SLA.
- **`useOutboundStore`**: Mengatur daftar *batch* armada pengiriman.

*Child components* dapat langsung membaca state dari *store* dan memicu *Action* (mutasi data yang dikontrol). Contohnya: Tombol navigasi ETA di `ManifestConfigForm` secara langsung memanggil fungsi aksi state global `useManifestStore.getState().setEtaOffsetMins(value)`.

### 2. Pengelolaan Local State (`useState`)
React Hooks `useState` tetap digunakan khusus untuk menyimpan data UI yang bersifat *sementara* atau kontrol antarmuka lokal:
- Mengelola *visibility* seperti membuka dan menutup jendela Modal (contoh: status boolean `isOpen` beserta fungsi `setIsOpen` pada `QuickDispatchModal`).
- Kontrol masukan data *input value* pada form teks sebelum proses validasi atau submission dilakukan.

### 3. Pengiriman Props (Unidirectional Props Flow)
Data mengalir dari *Parent Component* ke *Child Component* secara bersih melalui *Props* (tanpa terjadi direct state mutation pada *Child*):
- **Data Objek**: Komponen tabel induk mengirimkan *object* data per baris ke komponen *Row* (misal: `<SlaQueueTableRow data={item} />`).
- **Fungsi Callback**: *Parent* mengirimkan fungsi sebagai props ke *Modal component* (misal `onClose={() => setIsModalOpen(false)}`) agar *Child* dapat memberitahu *Parent* untuk menutup modal.
- **Conditional Rendering**: Props status akan dievaluasi oleh *Child* secara deklaratif (menggunakan *ternary operator* `? :` atau logical AND `&&`) untuk merender warna antarmuka yang berbeda (misalnya: warna peringatan *Critical* merah jika SLA tersisa <30 menit).

### 4. Dynamic List Rendering
Berbagai data *array* dirender secara dinamis menggunakan iterasi `.map()`. Pada setiap *render list*, elemen selalu disematkan **atribut `key` yang unik** (misalnya `key={opt.value}` pada pemetaan pilihan ETA) agar mekanisme *Virtual DOM* dari React dapat melakukan proses pembaruan (rekonsiliasi) elemen UI secara terukur dan presisi tanpa memunculkan error pada konsol peramban.
