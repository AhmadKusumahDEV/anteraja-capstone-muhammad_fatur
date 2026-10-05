# SQL: Analisis Data Pengiriman (Anteraja Capstone)

Karena tugas Day 14 diadaptasikan dengan skema database _project_ Anteraja Capstone saat ini, tabel _shipments_ ekuivalen dengan `packages` (dan `manifests`), serta tabel `couriers` berelasi melalui tabel pivot/transaksi `courier_dispatches`.

Berikut adalah query SQL raw yang digunakan beserta simulasi output datanya.

## 1. Query Dasar

### A. Filter & Order
**Instruksi Adaptasi:** Query data _package_ dengan status `IN_TRANSIT`, diurutkan dari prioritas tertinggi (`is_priority`) dan tenggat waktu tercepat (`sla_deadline`).
```sql
SELECT tracking_id, current_hub_id, service_type, status, is_priority, sla_deadline
FROM packages
WHERE status = 'IN_TRANSIT'
ORDER BY is_priority DESC, sla_deadline ASC;
```
**Penjelasan:** Mengambil data paket yang sedang dalam perjalanan dan mengurutkannya agar paket prioritas dengan tenggat waktu terdekat muncul paling atas.

**Simulasi Output:**
| tracking_id | current_hub_id | service_type | status | is_priority | sla_deadline |
| :--- | :--- | :--- | :--- | :--- | :--- |
| PKG-991 | HUB-JKT-01 | SAME_DAY | IN_TRANSIT | 1 | 2026-10-05 15:00:00 |
| PKG-012 | HUB-BDO-02 | NEXT_DAY | IN_TRANSIT | 0 | 2026-10-06 12:00:00 |

### B. Penggunaan CASE
**Instruksi Adaptasi:** Mengelompokkan _package_ berdasarkan _service type_ ke kategori prioritas.
```sql
SELECT tracking_id, service_type,
CASE 
    WHEN service_type = 'SAME_DAY' THEN 'High Priority'
    WHEN service_type = 'NEXT_DAY' THEN 'Medium Priority'
    ELSE 'Normal Priority'
END AS priority_level
FROM packages;
```
**Penjelasan:** Memberikan label tingkat prioritas yang mudah dibaca berdasarkan jenis layanan pengiriman.

**Simulasi Output:**
| tracking_id | service_type | priority_level |
| :--- | :--- | :--- |
| PKG-991 | SAME_DAY | High Priority |
| PKG-102 | REGULAR | Normal Priority |

## 2. Agregasi & Join

### A. GROUP BY + Filter Tanggal
**Instruksi Adaptasi:** Total dispatch/penugasan per kurir di bulan ini.
```sql
SELECT c.name, COUNT(cd.dispatch_id) as total_dispatches
FROM couriers c
JOIN courier_dispatches cd ON c.id = cd.courier_id
WHERE EXTRACT(MONTH FROM cd.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY c.id, c.name;
```
**Penjelasan:** Menghitung berapa kali setiap kurir ditugaskan (dispatch) pada bulan berjalan dengan menggabungkan tabel `couriers` dan `courier_dispatches`.

**Simulasi Output:**
| name | total_dispatches |
| :--- | :--- |
| Budi Santoso | 15 |
| Andi Wijaya | 8 |

### B. Rata-rata/Total per Status
**Instruksi Adaptasi:** Jumlah total paket berdasarkan masing-masing status.
```sql
SELECT status, COUNT(tracking_id) as total_packages
FROM packages
GROUP BY status;
```
**Penjelasan:** Memberikan ringkasan distribusi jumlah paket di setiap status (IN_HUB, IN_TRANSIT, dll).

**Simulasi Output:**
| status | total_packages |
| :--- | :--- |
| IN_HUB | 120 |
| IN_TRANSIT | 45 |
| OUT_FOR_DELIVERY | 30 |

### C. HAVING
**Instruksi Adaptasi:** Mencari kurir yang telah menerima lebih dari 10 penugasan dispatch.
```sql
SELECT c.name, COUNT(cd.dispatch_id) as total_dispatches
FROM couriers c
JOIN courier_dispatches cd ON c.id = cd.courier_id
GROUP BY c.id, c.name
HAVING COUNT(cd.dispatch_id) > 10;
```
**Penjelasan:** Menyaring hasil agregasi grup hanya untuk kurir yang memiliki jumlah penugasan di atas batas tertentu (10).

**Simulasi Output:**
| name | total_dispatches |
| :--- | :--- |
| Budi Santoso | 15 |
| Clara Bella | 12 |

### D. LEFT JOIN
**Instruksi Adaptasi:** Menampilkan seluruh kurir, termasuk kurir baru yang belum pernah menerima penugasan dispatch sama sekali.
```sql
SELECT c.name, cd.dispatch_id, cd.status
FROM couriers c
LEFT JOIN courier_dispatches cd ON c.id = cd.courier_id;
```
**Penjelasan:** Mengambil semua baris dari tabel `couriers` terlepas dari apakah ada kecocokan di tabel `courier_dispatches` (yang tidak memiliki dispatch akan bernilai NULL).

**Simulasi Output:**
| name | dispatch_id | status |
| :--- | :--- | :--- |
| Budi Santoso | DSP-001 | ACCEPTED |
| Joko Kendil | NULL | NULL |
