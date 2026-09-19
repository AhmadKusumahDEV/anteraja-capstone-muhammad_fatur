# 📄 Product Requirements Document (PRD)
## Courier Admin Mini-Panel — SLA & Priority Signaling System

---

### 1. Tujuan & Latar Belakang (Purpose & Background)
Sistem **Courier Admin Mini-Panel** dikembangkan sebagai solusi operasional titik transit logistik (*mid-mile hub*) untuk mentransformasi manajemen antrean paket dari pendekatan konvensional **First-In-First-Out (FIFO)** menjadi **Dynamic Priority Queue System**.

Sistem ini berfungsi sebagai *early warning system* berbasis sisa waktu Service Level Agreement (SLA) dan kapasitas fisik hub guna mencegah keterlambatan pengiriman (*SLA breach*) serta penumpukan paket (*over-capacity*) saat terjadi lonjakan volume pengiriman.

---

### 2. Tantangan Operasional & Solusi Sistem

| Tantangan Operasional | Solusi Sistem (PRD v5.1) |
| :--- | :--- |
| **FIFO Bottleneck**: Paket ekspres/urgent tertumpuk di belakang antrean fisik. | **Dynamic SLA Queue Engine**: Mengurutkan antrean berdasarkan sisa menit SLA (`remaining_minutes`) & tombol manual *Priority Override*. |
| **Over-Capacity Tanpa Visibilitas**: Admin hub tidak tahu volume paket yang sedang menuju hub-nya (`in_transit`). | **Dual-Metric & Threshold Control**: Menampilkan akumulasi beban (`In Hub` + `In Transit`) dan batas persentase kapasitas hub. |
| **Keterlambatan Respon Intervensi**: Admin terlambat mengeksekusi penanganan khusus. | **Event-Driven Push Signaling (SSE)**: Pemicuan notifikasi otomatis secara *real-time* via Server-Sent Events (SSE) saat transaksi *outbound dispatch* berpotensi melebihi kapasitas Hub tujuan. |

---

### 3. Profil Pengguna (User Personas)

* **Admin Hub / Head of Warehouse Operations**:
  * **Kebutuhan Utama**: Dashboard operasional tunggal yang fokus, responsif, dan memberikan visibilitas penuh atas antrean paket, status sisa menit SLA, kapasitas hub, serta aksi rilis/dispatch paket (*Transfer to Next Hub* atau *Send to Customer*).

*(Catatan: Pengelolaan akun Admin & Hub dilakukan via DB Seeder / Script untuk fase MVP).*

---

### 4. Skala & Batasan Pengembangan (Scope & Scale)

#### **Phase 1: MVP (5 Fitur Utama — Target 2 Bulan)**
Hanya ada **Satu Dashboard Utama** (Admin Hub Dashboard) yang mencakup 5 fitur inti:

1. **Autentikasi & Sesi Multi-Admin / Multi-Hub**: Login terikat pada `id_admin` dan `id_hub`, mendukung relasi 1 Hub dapat diakses oleh banyak Admin dengan isolasi data penuh.
2. **Dashboard Admin Hub & Monitoring Dual-Metrik**: Monitoring jumlah paket **In Hub** (di gudang) dan **In Transit** (akan datang), serta gauge kapasitas hub.
3. **Dynamic SLA Queue Table & Priority Override**: Tabel antrean terurut otomatis berdasarkan sisa menit SLA terdekat & tombol *Priority Override*.
4. **Outbound Dispatch Action**: Modal rilis paket dengan 2 pilihan opsi: *Transfer to Next Hub* atau *Send to Customer (Last-Mile)*.
5. **Event-Driven Real-Time SSE Capacity Signaling**: Pemicuan notifikasi SSE *instant* saat transaksi *dispatch* antar-hub berpotensi melampaui `max_capacity` Hub tujuan.

#### **Phase 2: Post-MVP Expansion**
* Panel Manajemen Super Admin UI (Create Hub & Assign Admin via Web UI).
* Background CronJob Scheduler (Periodic Scan & Automated SLA Decay Alert).
* Modul Penugasan Kurir Last-Mile & Optimasi Rute.

---

### 5. Daftar Fitur Utama & Acceptance Criteria (Phase 1 MVP)

#### **F-01: Autentikasi & Sesi Multi-Admin / Multi-Hub**
* **User Story**: Sebagai Admin Hub, saya ingin login dan langsung masuk ke dashboard hub tempat saya bertugas agar data yang saya kelola tidak tertukar dengan hub lain.
* **Acceptance Criteria**:
  * [x] Login berhasil jika kredensial valid dan mengembalikan token sesi terikat `id_admin` dan `id_hub`.
  * [x] Admin dari Hub A tidak dapat melihat data atau menerima sinyal SSE dari Hub B.
  * [x] Banyak Admin dapat login bersamaan di Hub yang sama.

#### **F-02: Dashboard Admin Hub & Monitoring Dual-Metrik**
* **User Story**: Sebagai Admin Hub, saya ingin melihat statistik paket di gudang dan paket yang akan datang agar dapat mengantisipasi beban kerja hub.
* **Acceptance Criteria**:
  * [x] Menampilkan statistik paket `In Hub` (`status = 'in_hub'`).
  * [x] Menampilkan statistik paket `In Transit` (`status = 'in_transit'` dengan tujuan hub ini).
  * [x] Indikator kapasitas Hub menampilkan persentase `Total_Load / max_capacity` dengan warna dinamis (Hijau <80%, Kuning 80-99%, Merah ≥100%).

#### **F-03: Dynamic SLA Queue Table & Priority Override**
* **User Story**: Sebagai Admin Hub, saya ingin antrean paket terurut otomatis berdasarkan sisa menit SLA terdekat dan bisa menaikkan prioritas paket secara manual.
* **Acceptance Criteria**:
  * [x] Antrean terurut otomatis dengan logika: Paket `is_priority = TRUE` paling atas, diikuti `remaining_minutes` terkecil.
  * [x] Setiap baris memiliki badge sisa menit SLA yang terus berjalan dinamis.
  * [x] Tombol *Priority Override* dapat mengubah status `is_priority` menjadi `TRUE` secara instan.

#### **F-04: Outbound Dispatch Action**
* **User Story**: Sebagai Admin Hub, saya ingin memproses rilis paket keluar dari hub baik untuk diteruskan ke hub berikutnya maupun dikirimkan ke customer.
* **Acceptance Criteria**:
  * [x] Memiliki modal rilis paket dengan opsi **Transfer to Next Hub** (pilih Hub tujuan) atau **Send to Customer**.
  * [x] Jika memilih *Transfer to Next Hub*, status paket berubah dari `in_hub` menjadi `in_transit` dengan `next_hub_id` ter-update.
  * [x] Jika memilih *Send to Customer*, status paket berubah menjadi `out_for_delivery` dan berkurang dari beban hub.

#### **F-05: Event-Driven Real-Time SSE Capacity Signaling**
* **User Story**: Sebagai Admin Hub, saya ingin menerima notifikasi instan jika paket yang dikirim dari hub lain membuat kapasitas hub saya melampaui batas.
* **Acceptance Criteria**:
  * [x] Ketika Admin Hub A melakukan *dispatch* paket ke Hub B dan membuat `Total_Load` Hub B > `max_capacity`, backend langsung memicu pesan SSE ke channel Hub B.
  * [x] Toast alert / Pop-up modal muncul di layar Admin Hub B secara *real-time* (< 1 detik) tanpa perlu refresh browser.

---

### 6. Indikator Keberhasilan Produk (Product KPIs)

1. **Zero Unnoticed Over-Capacity**: 100% kondisi potensi *over-capacity* terdeteksi dan ter-signal via SSE secara *real-time*.
2. **SLA Breach Reduction**: Penurunan angka keterlambatan SLA paket Same Day & Next Day hingga 40%.
3. **Dispatch Speed**: Peningkatan kecepatan rilis paket antrean kritis di hub hingga 30%.
