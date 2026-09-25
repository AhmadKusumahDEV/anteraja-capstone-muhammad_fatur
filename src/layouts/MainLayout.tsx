import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CreateBatchModal from '../features/outbound/CreateBatchModal';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — fixed left column */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pl-[var(--spacing-sidebar)]">
        {/* Navbar — fixed top bar */}
        <Navbar />

        {/* Page Content — scrollable area below navbar */}
        <main className="flex-1 pt-[var(--spacing-navbar)] p-6">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <CreateBatchModal />
    </div>
  );
}
