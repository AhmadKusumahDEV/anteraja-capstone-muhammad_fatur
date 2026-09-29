import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AdminProvider } from '../context/AdminContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import CreateBatchModal from '../features/outbound/CreateBatchModal';
import SharedManifestModal from '../components/SharedManifestModal';
import { useHubStore } from '../store/useHubStore';
import CapacityAlarm from '../components/CapacityAlarm';
import { Toaster } from 'react-hot-toast';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
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
      <div className="flex min-h-screen">
        {/* Sidebar — fixed left column */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col pl-[var(--spacing-sidebar)]">
          {/* Navbar — fixed top bar */}
          <Navbar />

          {/* Page Content — scrollable area below navbar */}
          <main className="flex flex-1 flex-col pt-[var(--spacing-navbar)] bg-gray-50/30">
            <div className="flex-1 p-6">
              {children}
            </div>
            <Footer />
          </main>
        </div>

        {/* Global Modals & Utilities */}
        <CreateBatchModal />
        <SharedManifestModal />
        <CapacityAlarm />
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </AdminProvider>
  );
}
