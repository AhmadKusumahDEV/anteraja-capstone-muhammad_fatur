# Dokumentasi Prototype Antarmuka (UI) - Anteraja Hub
Branch: `7-prototype`

Dokumen ini merupakan penjelasan sederhana tentang antarmuka (*user interface*) yang telah dibangun pada folder `app/`, serta keterkaitannya dengan dokumen *Feature Requirement Document* (FRD) yang relevan.

---

## 1. Priority SLA Queue (`app/sla-queue.html`)
**Mengacu pada:** `FRD_F03_Dynamic_SLA_Queue.md`
Halaman ini adalah dashboard pemantauan antrean paket masuk. Halaman ini merepresentasikan secara langsung aturan *business logic* dari F-03:
- **Tabel Antrean:** Menyortir paket berdasarkan sisa waktu (SLA Remaining) dan bendera prioritas (Escalated/Critical).
- **Indikator Visual:** Menggunakan warna hijau, kuning, dan merah (badge dan timer) untuk merepresentasikan kondisi batas waktu pengiriman logistik, mempermudah admin hub (Operator) mengambil keputusan.
- **Tindakan Bypassing:** Tombol "Outbound Dispatch" digunakan jika paket berstatus kritis harus segera dialihkan ke *Quick Release*.

## 2. Inbound Sorting (`app/inbound-sorting.html`)
**Mengacu pada:** `FRD_F06_Inbound_Sorting_Workflow.md` (atau alur umum Inbound)
Halaman ini didesain untuk menangani kedatangan truk *feeder* antar kota ke Hub.
- **Tabel Manifest Masuk:** Memperlihatkan truk feeder mana yang sedang menuju ke Hub, terlambat, atau sudah tiba di *docking bay*.
- Sesuai dengan spesifikasi FRD, operator hanya bisa melakukan aksi "Terima & Bongkar" ketika truk sudah benar-benar masuk status "Menunggu Konfirmasi" (tiba di hub fisik).

## 3. Outbound Dispatch (`app/outbound-dispatch.html`)
**Mengacu pada:** `FRD_F04_Outbound_Dispatch_Action.md`
Halaman ini merupakan pusat kontrol pengiriman logistik keluar Hub ke pelanggan (*last-mile*).
- **Pemilihan Armada (Handover):** Menyediakan fitur bagi admin untuk menugaskan (assign) *Batch* atau paket prioritas langsung kepada *Kurir Satria* yang sedang berstatus *Standby*.
- **Modal Dispatch:** Mengimplementasikan UI daftar kartu *(radio cards)* kurir agar admin bisa melihat metrik armada, jenis kendaraan (Motor/Van), dan sisa kapasitas sebelum memberangkatkan.

## 4. Manifest Generator (`app/manifest-generator.html`)
**Mengacu pada:** `FRD_F02_Manifest_Data_Generator.md`
Ini adalah *tools* / alat bantu simulasi pengujian teknis.
- Menyediakan UI *range slider* untuk membuat ribuan resi data simulasi (`JSON Payload`) secara instan.
- Sesuai FRD-F02, fitur ini digunakan untuk memastikan sistem antrean (*queueing*) dan kapasitas *database* dapat menangani beban data yang ekstrem sebelum aplikasi meluncur ke *production*.
