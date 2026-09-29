-- Seed Data for Anteraja Hub Logistics

-- ==========================================
-- 1. Insert Hubs
-- ==========================================
INSERT INTO hubs (id, name, region_name, location_tag, max_capacity, timezone) VALUES
('HUB-JKS-01', 'Jakarta Selatan Transit Hub', 'Jakarta Selatan', 'Jaksel', 200, 'WIB (UTC+7)'),
('HUB-BDO-01', 'Bandung Pusat Hub', 'Bandung', 'Bdg', 150, 'WIB (UTC+7)'),
('HUB-SBY-01', 'Surabaya Timur Hub', 'Surabaya', 'Sby', 300, 'WIB (UTC+7)'),
('HUB-DPS-01', 'Denpasar Gateway', 'Bali', 'Dps', 100, 'WITA (UTC+8)'),
('HUB-MDN-01', 'Medan Utara Hub', 'Medan', 'Mdn', 250, 'WIB (UTC+7)');

-- ==========================================
-- 2. Insert Couriers (Armada Satria)
-- ==========================================
INSERT INTO couriers (id, name, fleet_type, status, current_hub_id) VALUES
-- Couriers in HUB-JKS-01
('SAT-001', 'Budi Santoso', 'MOTORCYCLE', 'STANDBY', 'HUB-JKS-01'),
('SAT-002', 'Andi Wijaya', 'VAN', 'ON_DUTY', 'HUB-JKS-01'),
('SAT-003', 'Iwan Fals', 'MOTORCYCLE', 'STANDBY', 'HUB-JKS-01'),
('SAT-004', 'Joko Susilo', 'VAN', 'OFFLINE', 'HUB-JKS-01'),
('SAT-005', 'Rudi Hermawan', 'MOTORCYCLE', 'ON_DUTY', 'HUB-JKS-01'),

-- Couriers in HUB-BDO-01
('SAT-006', 'Citra Lestari', 'MOTORCYCLE', 'OFFLINE', 'HUB-BDO-01'),
('SAT-007', 'Deni Setiawan', 'VAN', 'STANDBY', 'HUB-BDO-01'),
('SAT-008', 'Erwin Syah', 'MOTORCYCLE', 'ON_DUTY', 'HUB-BDO-01'),

-- Couriers in HUB-SBY-01
('SAT-009', 'Eko Prasetyo', 'MOTORCYCLE', 'ON_DUTY', 'HUB-SBY-01'),
('SAT-010', 'Fajar Nugroho', 'VAN', 'STANDBY', 'HUB-SBY-01'),
('SAT-011', 'Galih Pratama', 'MOTORCYCLE', 'OFFLINE', 'HUB-SBY-01'),
('SAT-012', 'Harianto', 'VAN', 'ON_DUTY', 'HUB-SBY-01'),

-- Couriers in HUB-DPS-01
('SAT-013', 'Gilang Ramadhan', 'MOTORCYCLE', 'OFFLINE', 'HUB-DPS-01'),
('SAT-014', 'Hendra Gunawan', 'VAN', 'ON_DUTY', 'HUB-DPS-01'),
('SAT-015', 'Kadek Suastika', 'MOTORCYCLE', 'STANDBY', 'HUB-DPS-01'),

-- Couriers in HUB-MDN-01
('SAT-016', 'Lubis Siregar', 'VAN', 'ON_DUTY', 'HUB-MDN-01'),
('SAT-017', 'Maruli Tampubolon', 'MOTORCYCLE', 'STANDBY', 'HUB-MDN-01'),
('SAT-018', 'Nasution', 'MOTORCYCLE', 'OFFLINE', 'HUB-MDN-01');
