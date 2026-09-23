-- Data Definition Language (DDL) for Anteraja Hub Logistics
-- Dialect: PostgreSQL

-- 1. Tabel hubs (Master Data Terminal)
CREATE TABLE hubs (
    id VARCHAR(50) PRIMARY KEY, -- Contoh: HUB-JKS-01
    name VARCHAR(255) NOT NULL, -- Contoh: "Jakarta Selatan Transit Hub"
    region_name VARCHAR(100) NOT NULL, -- Contoh: "Jakarta Selatan"
    location_tag VARCHAR(50) NOT NULL, -- Contoh: "Jaksel"
    max_capacity INT NOT NULL, -- Contoh: 200
    timezone VARCHAR(50) NOT NULL, -- Contoh: "WIB (UTC+7)"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel users (Operator & Super Admin)
CREATE TYPE user_role AS ENUM ('HUB_ADMIN', 'SUPER_ADMIN');

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    nik VARCHAR(50) UNIQUE NOT NULL, -- Contoh: ADM-102
    name VARCHAR(255) NOT NULL, -- Contoh: "Admin Budi"
    role user_role NOT NULL,
    hub_id VARCHAR(50) REFERENCES hubs(id), -- Nullable, atau wajib jika HUB_ADMIN
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel couriers (Armada Satria / Kurir Lapangan)
CREATE TYPE courier_fleet_type AS ENUM ('MOTORCYCLE', 'VAN');
CREATE TYPE courier_status AS ENUM ('STANDBY', 'ON_DUTY', 'OFFLINE');

CREATE TABLE couriers (
    id VARCHAR(50) PRIMARY KEY, -- Contoh: SAT-001
    name VARCHAR(255) NOT NULL, -- Contoh: "Satria Bayu"
    fleet_type courier_fleet_type NOT NULL,
    status courier_status NOT NULL,
    current_hub_id VARCHAR(50) REFERENCES hubs(id), -- Nullable (tempat mangkal saat ini)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel manifests (Wadah Pengiriman / Feeder & Batch)
CREATE TYPE manifest_type AS ENUM ('INBOUND_FEEDER', 'OUTBOUND_DISPATCH');
CREATE TYPE manifest_status AS ENUM (
    'MENUNGGU_KEDATANGAN', 
    'MENUNGGU_KONFIRMASI', 
    'SUDAH_DITERIMA', 
    'SIAP_BERANGKAT', 
    'DALAM_PENGANTARAN', 
    'SELESAI'
);

CREATE TABLE manifests (
    manifest_code VARCHAR(50) PRIMARY KEY, -- Contoh: MNF-INB-2026-0917-01
    type manifest_type NOT NULL,
    origin_hub_id VARCHAR(50) REFERENCES hubs(id) NOT NULL,
    destination_hub_id VARCHAR(50) REFERENCES hubs(id), -- Nullable (rute last-mile langsung ke pelanggan)
    vehicle_plate VARCHAR(20),
    vehicle_type VARCHAR(50),
    status manifest_status NOT NULL,
    eta_timestamp TIMESTAMP,
    operator_id VARCHAR(50) REFERENCES users(id), -- Nullable sesuai kebijakan MVP
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel packages (Resi / State Terkini Paket)
CREATE TYPE service_level AS ENUM ('SAME_DAY', 'NEXT_DAY', 'REGULAR');
CREATE TYPE package_status AS ENUM ('IN_TRANSIT', 'IN_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED');

CREATE TABLE packages (
    tracking_id VARCHAR(50) PRIMARY KEY, -- Contoh: TRK-2139410001
    current_hub_id VARCHAR(50) REFERENCES hubs(id) NOT NULL,
    destination_area VARCHAR(255), -- Dummy Routing MVP (Contoh: 'Jakarta Selatan')
    service_type service_level NOT NULL,
    weight DECIMAL(10,2) NOT NULL, -- Contoh: 1.20
    status package_status NOT NULL,
    hub_arrival_timestamp TIMESTAMP, -- Titik mulai indikator SLA di hub
    sla_deadline TIMESTAMP, -- Batas waktu mutlak SLA
    is_priority BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel manifest_packages (Pivot Transisi Perjalanan)
CREATE TABLE manifest_packages (
    id BIGSERIAL PRIMARY KEY,
    manifest_code VARCHAR(50) REFERENCES manifests(manifest_code) ON DELETE CASCADE,
    tracking_id VARCHAR(50) REFERENCES packages(tracking_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel courier_dispatches (Kontrol Handover Outbound)
CREATE TYPE dispatch_status AS ENUM ('PENDING_ACCEPT', 'ACCEPTED', 'TIMEOUT_FAILED');

CREATE TABLE courier_dispatches (
    dispatch_id VARCHAR(50) PRIMARY KEY,
    courier_id VARCHAR(50) REFERENCES couriers(id) NOT NULL,
    manifest_code VARCHAR(50) REFERENCES manifests(manifest_code) NOT NULL,
    acceptance_timeout_minutes INT NOT NULL, -- Contoh: 5, 10
    status dispatch_status NOT NULL,
    dispatched_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXING untuk Performa (Opsional namun sangat direkomendasikan)
CREATE INDEX idx_packages_status_hub ON packages(status, current_hub_id);
CREATE INDEX idx_packages_sla_priority ON packages(is_priority DESC, sla_deadline ASC);
CREATE INDEX idx_manifests_status_hub ON manifests(status, destination_hub_id);
