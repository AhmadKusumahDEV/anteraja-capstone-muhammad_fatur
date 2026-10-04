import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminProvider } from '../context/AdminContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import CreateBatchModal from '../features/outbound/CreateBatchModal';
import SharedManifestModal from '../components/SharedManifestModal';
import { useHubStore } from '../store/useHubStore';
import CapacityAlarm from '../components/CapacityAlarm';
import { Toaster } from 'react-hot-toast';
import { useSseConnection } from '../hooks/useSseConnection';
import SseToastListener from '../components/SseToastListener';
import SseConnectionIndicator from '../components/SseConnectionIndicator';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Memulai koneksi SSE
  useSseConnection();

  // Tutup sidebar di mobile setiap kali rute berpindah
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      useHubStore.getState().tickSla();

      import('../store/useInboundStore').then((m) => {
        m.useInboundStore.getState().setPage(m.useInboundStore.getState().currentPage);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AdminProvider>
      <div className="flex min-h-screen relative overflow-hidden bg-gray-50/30">
        {/* Overlay untuk Sidebar di Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar — fixed left column */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col w-full lg:pl-[260px] md:pl-[88px] transition-all duration-300">
          {/* Navbar — fixed top bar */}
          <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          {/* Page Content — scrollable area below navbar */}
          <main className="flex flex-1 flex-col pt-[var(--spacing-navbar)] h-full overflow-x-hidden">
            <div className="flex-1 p-4 sm:p-6 w-full max-w-[100vw]">
              <Outlet />
            </div>
            <Footer />
          </main>
        </div>

        {/* Global Modals & Utilities */}
        <CreateBatchModal />
        <SharedManifestModal />
        <CapacityAlarm />
        <Toaster position="bottom-right" reverseOrder={false} />
        
        {/* SSE Utilities */}
        <SseToastListener />
        <SseConnectionIndicator />
      </div>
    </AdminProvider>
  );
}
