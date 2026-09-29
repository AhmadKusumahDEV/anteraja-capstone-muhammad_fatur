import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Inbound from './pages/Inbound';
import ManifestGenerator from './pages/ManifestGenerator';
import Outbound from './pages/Outbound';
import SlaQueue from './pages/SlaQueue';
import ShipmentDetail from './pages/ShipmentDetail';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Semua halaman (rute) di-nest ke dalam MainLayout yang menyediakan Persistent UI (Sidebar, Navbar) */}
      <Route element={<MainLayout />}>
        {/* Redirect root (/) ke /sla-queue sebagai HomePage default */}
        <Route path="/" element={<Navigate to="/sla-queue" replace />} />
        
        <Route path="/sla-queue" element={<SlaQueue />} />
        <Route path="/inbound" element={<Inbound />} />
        <Route path="/outbound" element={<Outbound />} />
        <Route path="/manifest-generator" element={<ManifestGenerator />} />
        
        {/* Dynamic Route dengan URL Parameter untuk Detail Resi / Manifest */}
        <Route path="/shipments/:id" element={<ShipmentDetail />} />
      </Route>

      {/* Rute Catch-All untuk Fallback 404 (Bisa dibiarkan di luar MainLayout atau di dalam. Kita taruh di dalam agar tetap ada Sidebar/Navbar atau di luar agar polos. Saya letakkan di luar sesuai standar 404 polos) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
