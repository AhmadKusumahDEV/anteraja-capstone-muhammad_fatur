import { useEffect } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';

export const useSseConnection = () => {
  const connectSSE = useNotificationStore((state) => state.connectSSE);
  const disconnectSSE = useNotificationStore((state) => state.disconnectSSE);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  
  const token = useAuthStore((state) => state.isAuthenticated); 

  useEffect(() => {
    if (!token) return;

    connectSSE();
    fetchNotifications();

    return () => {
      disconnectSSE();
    };
  }, [token, connectSSE, disconnectSSE, fetchNotifications]);
};
