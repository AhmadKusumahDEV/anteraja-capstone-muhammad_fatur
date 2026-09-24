# Anteraja Hub Capstone — Workspace Rules

## Documentation-First Rule
Sebelum memulai implementasi atau modifikasi kode untuk fitur apapun di project ini, **WAJIB** baca terlebih dahulu dokumen-dokumen berikut di folder `docs/`:

### Dokumen Utama (Selalu Dibaca)
1. **PRD-00.md** — Product Requirements Document: Visi produk, scope matrix, acceptance criteria, dan roadmap.
2. **FRD-00.md** — Master Functional Requirements: Ringkasan 6 modul, spesifikasi SSE events, dan system sequence diagram.
3. **ERD.md** — Entity Relationship Diagram: Relasi antar-tabel dan struktur data.
4. **ddl_schema.sql** — DDL PostgreSQL: Definisi tabel, tipe ENUM, foreign keys, dan indexing.
5. **table-docs.txt** — Dokumentasi penjelasan keputusan arsitektur database.

### Dokumen FRD Detail (Baca Sesuai Fitur yang Dikerjakan)
- `docs/frd/FRD_F01_Multi_Admin_Auth.md` — Autentikasi & Sesi Multi-Hub
- `docs/frd/FRD_F02_Manifest_Data_Generator.md` — Manifest Data Generator
- `docs/frd/FRD_F03_Dynamic_SLA_Queue.md` — Dynamic SLA Queue & Dashboard
- `docs/frd/FRD_F04_Outbound_Dispatch_Action.md` — Outbound Dispatch & Fleet Management
- `docs/frd/FRD_F05_Event_Driven_SSE_Signaling.md` — SSE Signaling Engine
- `docs/frd/FRD_F06_Inbound_Sorting_Fleet_ACK.md` — Inbound Sorting & Fleet ACK

### UI Mockups (Referensi Visual)
- `docs/ui/*.webp` — Lihat mockup UI untuk memastikan implementasi sesuai desain visual.

## Konvensi Project
- **Tech Stack Frontend**: React 19 + Vite + TypeScript + Zustand (state) + React Router DOM 7
- **Tech Stack Backend**: Laravel REST API + PostgreSQL + Redis + SSE (dikembangkan terpisah)
- **SLA Calculation**: Dihitung on-the-fly (`sla_deadline - NOW()`), BUKAN disimpan sebagai kolom `is_breached`
- **ID Format**: Hub (`HUB-XXX-XX`), Manifest (`MNF-YYMM-XXXX`), Package (`TRK-XXXXXXXXXX`), Courier (`SAT-XXX`)
- **Manifest Status Flow**: `MENUNGGU_KEDATANGAN → MENUNGGU_KONFIRMASI → SUDAH_DITERIMA → SIAP_BERANGKAT → DALAM_PENGANTARAN → SELESAI`
- **Package Status Flow**: `IN_TRANSIT → IN_HUB → OUT_FOR_DELIVERY → DELIVERED`
- **SLA Color Zones**: 🔴 Critical (<30m), 🟡 Warning (30-120m), 🟢 Normal (>120m)
- **Capacity Threshold**: Warning Alert muncul saat kapasitas hub ≥90%
