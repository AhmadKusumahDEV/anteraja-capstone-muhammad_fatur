import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/useAuthStore';

// Tipe data untuk Admin Profile
export interface AdminProfile {
  name: string;
  pictureUrl: string;
  hub_id: string | null;
}

// Interface untuk nilai Context
interface AdminContextType {
  adminProfile: AdminProfile | null;
  setAdminProfile: (profile: AdminProfile) => void;
  // Memindahkan toggle sound dari Zustand ke Context sesuai request tugas
  isAlarmMuted: boolean;
  toggleAlarmMute: () => void;
  logout: () => Promise<void>;
}

// 1. Inisialisasi Context dengan nilai default null
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// 2. Provider Component
export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  const { user, logout: storeLogout } = useAuthStore();

  const toggleAlarmMute = () => {
    setIsAlarmMuted((prev) => !prev);
  };

  const logout = async () => {
    await storeLogout();
  };

  // Sinkronisasi data user dari JWT backend dengan adminProfile context
  useEffect(() => {
    if (user && !adminProfile) {
      setAdminProfile({
        name: user.name,
        pictureUrl: '', // Will be filled by useAdminProfile hook
        hub_id: user.hub_id
      });
    } else if (!user && adminProfile) {
      setAdminProfile(null);
    }
  }, [user, adminProfile]);

  return (
    <AdminContext.Provider
      value={{
        adminProfile,
        setAdminProfile,
        isAlarmMuted,
        toggleAlarmMute,
        logout,
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
