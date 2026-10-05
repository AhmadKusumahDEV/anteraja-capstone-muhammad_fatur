#set page(
  paper: "a4",
  margin: (x: 2cm, y: 2.5cm),
)
#set text(
  font: "New Computer Modern",
  size: 11pt,
  lang: "id"
)
#set heading(numbering: "1.1")

#align(center)[
  #text(17pt, weight: "bold")[Laporan Tugas Day 14]
  #v(0.5em)
  #text(14pt)[SQL: Analisis Data Pengiriman]
  #v(2em)
]

= Pendahuluan
Sama seperti tugas sebelumnya, _requirements_ pada Day 14 diadaptasikan untuk menyesuaikan arsitektur _database real_ dari _project_ Anteraja Capstone yang telah dibangun. Tabel `shipments` pada instruksi dasar dipetakan ke dalam skema tabel `packages` dan `manifests`, sementara tabel `couriers` direlasikan melalui tabel pivot operasional yaitu `courier_dispatches`.

Dokumen ini merupakan lampiran pembuktian pengerjaan analisis data menggunakan SQL *raw* (tanpa Eloquent) secara terstruktur. Seluruh rincian _query_ beserta simulasi _output_ datanya telah didokumentasikan di dalam file `docs/sql-queries.md` pada repositori.

= Ringkasan Eksplorasi Query
Berbagai teknik analisis SQL telah diimplementasikan sebagai berikut:

== 1. Query Dasar (Filter & CASE)
- *Filtering*: Melakukan pencarian data _package_ yang sedang dalam perjalanan (`status = 'IN_TRANSIT'`) dan diurutkan berdasarkan `is_priority` dan `sla_deadline` (sebagai substitusi filter berat pengiriman).
- *Pengelompokan Kategorikal*: Memanfaatkan struktur `CASE` untuk membuat pengelompokan tingkat prioritas (High, Medium, Normal) berdasarkan field `service_type` (SAME_DAY, NEXT_DAY, REGULAR).

== 2. Agregasi & Join Antar Tabel
- *Agregasi dengan GROUP BY*: Menghitung performa jumlah penugasan (_dispatches_) masing-masing kurir pada bulan berjalan dengan filter `CURRENT_DATE`. Serta menghitung total _package_ berdasarkan masing-masing status.
- *Filter Agregasi (HAVING)*: Menyaring data kurir yang beban penugasannya sudah melebihi 10 _dispatch_.
- *LEFT JOIN*: Menggabungkan tabel master `couriers` dengan data penugasan `courier_dispatches` untuk memastikan seluruh kurir (termasuk yang belum mendapatkan tugas) tetap muncul dalam pelaporan data.

= Git Workflow & Bukti Pekerjaan
Seluruh pekerjaan pada tugas ini diselesaikan di dalam _branch_ terisolasi bernama `feature/sql-analysis`. _Commit_ juga telah dipisah-pisah (minimal 3 buah _commit_ terpisah) untuk mendeskripsikan secara jelas perubahan mulai dari tahap penulisan _query dasar_, _agregasi_, hingga penambahan laporan.

Berikut adalah bukti tangkapan layar proses tersebut:

#figure(
  image("tugas-sql.png", width: 80%),
  caption: [Bukti Commit & Workflow - Day 14],
)
