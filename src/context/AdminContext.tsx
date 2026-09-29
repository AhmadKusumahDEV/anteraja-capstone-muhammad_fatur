import { createContext, useContext, useState, ReactNode } from 'react';

// Tipe data untuk Admin Profile (hasil dari RandomUser API)
export interface AdminProfile {
  name: string;
  pictureUrl: string;
}

// Interface untuk nilai Context
interface AdminContextType {
  adminProfile: AdminProfile | null;
  setAdminProfile: (profile: AdminProfile) => void;
  // Memindahkan toggle sound dari Zustand ke Context sesuai request tugas
  isAlarmMuted: boolean;
  toggleAlarmMute: () => void;
}

// 1. Inisialisasi Context dengan nilai default null
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// 2. Provider Component
export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);

  const toggleAlarmMute = () => {
    setIsAlarmMuted((prev) => !prev);
  };

  return (
    <AdminContext.Provider
      value={{
        adminProfile,
        setAdminProfile,
        isAlarmMuted,
        toggleAlarmMute,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

// 3. Custom Hook untuk mempermudah konsumsi Context (mencegah prop drilling)
export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext harus digunakan di dalam AdminProvider');
  }
  return context;
}
