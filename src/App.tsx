import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Inbound from './pages/Inbound';
import ManifestGenerator from './pages/ManifestGenerator';
import Outbound from './pages/Outbound';
import SlaQueue from './pages/SlaQueue';

export default function App() {
  return (
    <Routes>
      {/* All pages wrapped in MainLayout */}
      <Route
        path="/sla-queue"
        element={
          <MainLayout>
            <SlaQueue />
          </MainLayout>
        }
      />
      <Route
        path="/inbound"
        element={
          <MainLayout>
            <Inbound />
          </MainLayout>
        }
      />
      <Route
        path="/outbound"
        element={
          <MainLayout>
            <Outbound />
          </MainLayout>
        }
      />
      <Route
        path="/manifest-generator"
        element={
          <MainLayout>
            <ManifestGenerator />
          </MainLayout>
        }
      />

      {/* Default redirect — SLA Queue is the main dashboard */}
      <Route path="*" element={<Navigate to="/sla-queue" replace />} />
    </Routes>
  );
}
