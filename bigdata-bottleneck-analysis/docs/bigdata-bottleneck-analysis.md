# Dokumentasi Big Data Bottleneck Analysis

## 1. Dataset & Schema
Dataset ini merupakan simulasi pergerakan log paket di berbagai hub (Warehouse). Dataset terdiri dari 2.400 paket yang bergerak melewati 1-3 hub dari tanggal 1–30 Oktober 2023.
Schema yang dianalisis:
- `hub_id` (STRING): ID Gudang / Hub tempat scan terjadi.
- `package_id` (STRING): ID unik Paket.
- `event_type` (STRING): Jenis aktivitas scan (misalnya `ARRIVAL`, `DEPARTURE`, `SORTING`).
- `timestamp` (TIMESTAMP): Waktu event terjadi (dalam format yyyy-mm-dd hh:mm:ss).

## 2. Data Quality Check
Sebelum menghitung *dwell time*, data kotor (*dirty data*) disaring dengan proses berikut:
1. **Filtering Noise**: Membuang `event_type` selain `ARRIVAL` dan `DEPARTURE` (misalnya membuang `SORTING`).
2. **Duplicate Scans**: Menghapus baris yang merupakan duplikat identik menggunakan `dropDuplicates()`.
3. **Missing Scans & Invalid Timestamps**: Menggunakan *Full Outer Join* untuk memasangkan *Arrival* dan *Departure*, lalu mengidentifikasi anomali:
   - Paket yang tidak memiliki `ARRIVAL` (*Missing Arrival*).
   - Paket yang tidak memiliki `DEPARTURE` (*Missing Departure*).
   - Timestamp yang tidak valid, ditandai dengan waktu keberangkatan (`DEPARTURE`) yang lebih awal dari kedatangan (`ARRIVAL`). Baris-baris berstatus anomali ini dibuang dari kalkulasi *dwell time*.

## 3. Kode PySpark
Kode utama yang digunakan untuk mengekstrak *insight*:

```python
# Gabungkan arrival & departure
df_joined = df_arrival.join(df_departure, on=["package_id", "hub_id"], how="full")

# Filter hanya pasangan yang valid
df_valid = df_joined.filter(
    F.col("arrival_time").isNotNull() & 
    F.col("departure_time").isNotNull() & 
    (F.col("departure_time") >= F.col("arrival_time"))
)

# Hitung durasi dan Agregasi per hub
df_dwell = df_valid.withColumn("dwell_time_hours", (F.unix_timestamp("departure_time") - F.unix_timestamp("arrival_time")) / 3600.0)
df_agg = df_dwell.groupBy("hub_id").agg(
    F.count("package_id").alias("package_count"),
    F.round(F.avg("dwell_time_hours"), 2).alias("avg_dwell_hours"),
    F.round(F.percentile_approx("dwell_time_hours", 0.5), 2).alias("median_dwell_hours")
)
```

## 4. Hasil Perhitungan Dwell Time
Setelah data dibersihkan, didapatkan hasil agregasi berupa jumlah paket, rata-rata durasi inap paket (*average dwell time*), serta median waktu inap per *hub* dalam satuan jam (Bisa dilihat secara lengkap pada `output/top_bottleneck_hubs.csv`).

## 5. Top 3 Bottleneck Hubs
Berdasarkan hasil pengolahan, berikut adalah 3 hub dengan *average dwell time* tertinggi:
1. **HUB-010**: Average 13.45 jam | Median 6.71 jam | Jumlah Paket: 150
2. **HUB-005**: Average 12.07 jam | Median 10.98 jam | Jumlah Paket: 477
3. **HUB-011**: Average 9.77 jam | Median 8.63 jam | Jumlah Paket: 247

## 6. Business Insight & Rekomendasi Investigasi
Meskipun **HUB-010** mencatatkan *average dwell time* tertinggi (13,45 jam), hub tersebut **bukan** merupakan *bottleneck* utama. Hal ini dibuktikan dari *median dwell time* yang hanya sebesar 6,71 jam dengan volume paket paling rendah (150 paket), yang mengindikasikan bahwa tingginya rata-rata hanya disebabkan oleh sebagian kecil paket (*outlier* ekstrem atau anomali data). 

Sebaliknya, **bottleneck terbesar secara sistemik terjadi di HUB-005**. Hub ini memikul beban volume yang sangat besar (477 paket) dengan rata-rata *dwell time* 12,07 jam dan median yang konsisten tinggi di angka 10,98 jam. Ini berarti mayoritas paket di sana benar-benar mengalami keterlambatan hampir setengah hari secara merata. Investigasi operasional selanjutnya harus diprioritaskan pada HUB-005, khususnya mengevaluasi kapasitas *sorting*, ketersediaan jumlah staf lapangan, dan efisiensi alur perpindahan barang (*inbound-outbound*) yang kemungkinan besar tidak sebanding dengan tingginya beban paket masuk.
