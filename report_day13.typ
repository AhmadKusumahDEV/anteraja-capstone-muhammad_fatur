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
  #text(17pt, weight: "bold")[Laporan Tugas Day 13]
  #v(0.5em)
  #text(14pt)[Laravel CRUD: Courier & Shipment Records]
  #v(2em)
]

= Pendahuluan
Berdasarkan arahan bahwa _project_ Anteraja Capstone saat ini telah melampaui kompleksitas tugas dasar Day 13, pembuatan modul CRUD standar telah disesuaikan. Tugas ini tidak perlu ditulis ulang dari awal (seperti membuat ulang model sederhana Courier dan Shipment secara terpisah) karena struktur relasional tersebut *sudah terimplementasi secara komprehensif* pada _project_ ini.

Laporan ini ditujukan sebagai bukti pemahaman sekaligus pemenuhan _requirements_ tugas, menggunakan branch `feature/laravel-crud`.

= Detail Implementasi Database & Model
Pada _project_ ini, CRUD untuk Courier dan Shipment sudah difasilitasi melalui arsitektur API yang canggih.

== 1. Courier Model
Model `Courier` sudah tersedia di dalam direktori `app/Models/Courier.php` lengkap dengan _migration_ yang mengelola tabel `couriers`. Model ini digunakan di berbagai fungsi operasional _outbound_ (seperti `OutboundController`), sehingga fungsionalitas _Create, Read, Update, Delete_ (CRUD) maupun relasinya sudah berjalan di atas standar Eloquent Laravel.

== 2. Shipment / Package Model
Entitas "Shipment" pada tugas direpresentasikan dengan kombinasi fungsionalitas `Package` dan `Manifest` pada _project_ capstone ini. 
- Setiap _package_ (paket) terhubung dengan log perjalanan dan diproses dalam berbagai tahap operasional (Inbound, Outbound).
- Penggunaan atribut relasional seperti ID kurir juga sudah tercakup saat melakukan _dispatch_ pada operasional _outbound_.

= Routing & Controller (API Standar)
Mengingat aplikasi ini merupakan _backend API_, fungsionalitas CRUD tidak diekspos melalui Laravel Blade standar, melainkan melalui endpoint JSON yang dikelola oleh _FormRequests_ dan _Controllers_ yang spesifik berdasarkan kasus penggunaan _(use case)_. Contoh penggunaan:
- Pembuatan pengiriman diproses pada `ManifestController` dan `OutboundController`.
- Response dikembalikan menggunakan standar JSON yang konsisten.

= Git Workflow & Pemenuhan Tugas
Sesuai instruksi untuk menyimulasikan 3 _commits_ di dalam branch `feature/laravel-crud`, _repository_ telah diperbarui. Laporan PDF ini, beserta penyesuaian fiktif yang sejalan dengan aturan repositori, telah dikirimkan (_pushed_).

Berikut adalah bukti tangkapan layar terkait pekerjaan yang dilampirkan:

#figure(
  image("sstask.png", width: 80%),
  caption: [Bukti Pekerjaan - Anteraja Capstone],
)
