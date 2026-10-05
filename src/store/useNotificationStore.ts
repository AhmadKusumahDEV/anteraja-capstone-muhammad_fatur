import { create } from 'zustand';
import api from '../services/api';
import { useSlaQueueStore } from './useSlaQueueStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  is_read: boolean;
  created_at: string;
}

interface CapacityData {
  hub_id?: string;
  current_load: number;
  in_transit_load?: number;
  max_capacity: number;
  capacity_percentage?: number;
  status_zone?: string;
  message?: string;
  play_sound?: string;
}

interface SlaBreachData {
  hub_id: string;
  critical_packages_count: number;
  message: string;
}

interface InboundData {
  hub_id: string;
  manifest_code: string;
  new_trucks_count: number;
  message: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  sseConnected: boolean;
  sseReconnecting: boolean;
  eventSource: EventSource | null;

  capacityData: CapacityData | null;
  slaBreach: SlaBreachData | null;
  latestInbound: InboundData | null;

  connectSSE: () => void;
  disconnectSSE: () => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addLocalNotification: (notif: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  sseConnected: false,
  sseReconnecting: false,
  eventSource: null,

  capacityData: null,
  slaBreach: null,
  latestInbound: null,

  connectSSE: () => {
    const existing = get().eventSource;
    if (existing) {
      existing.close();
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    set({ sseReconnecting: true });

    const url = `${API_BASE_URL}/sse/stream?token=${token}`;
    const es = new EventSource(url);

    es.onopen = () => {
      console.log('[SSE] Connected ✅');
      set({ sseConnected: true, sseReconnecting: false });
    };

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('[SSE] Event received:', payload.event, payload);

        switch (payload.event) {
          case 'INBOUND_ARRIVAL_SIGNAL':
            set({ latestInbound: payload.data });

            // "Invalidate Query" style: Refresh InboundTable automatically!
            import('./useInboundStore').then((m) => {
              if (m.useInboundStore.getState().fetchManifests) {
                m.useInboundStore.getState().fetchManifests();
              }
            });
            import('./useManifestStore').then((m) => {
              if (m.useManifestStore.getState().fetchManifests) {
                m.useManifestStore.getState().fetchManifests();
              }
            });
            import('./useHubStore').then((m) => {
              const fetchHubCapacity = m.useHubStore.getState().fetchHubCapacity;
              if (fetchHubCapacity && payload.data.hub_id) {
                fetchHubCapacity(payload.data.hub_id);
              }
            });

            get().addLocalNotification({
              title: 'Manifest Baru Masuk',
              message: payload.data.message,
              type: 'INFO',
            });
            break;

          case 'CAPACITY_LOAD_ALERT':
            set({ capacityData: payload.data });

            // Sync secara real-time ke HubStore agar HubCapacityCard langsung bereaksi (Zero Polling)
            import('./useHubStore').then((m) => {
              const currentCap = m.useHubStore.getState().hubCapacity;
              m.useHubStore.getState().setHubCapacity({
                ...currentCap,
                current: payload.data.current_load,
                max: payload.data.max_capacity,
                usage_percent: payload.data.capacity_percentage,
                capacity_status: payload.data.status_zone,
              });
            });

            import('./useSlaQueueStore').then((m) => {
              if (m.useSlaQueueStore.getState().fetchQueue) {
                m.useSlaQueueStore.getState().fetchQueue();
              }
            });

            get().addLocalNotification({
              title: payload.title || 'Info Kapasitas Hub',
              message: payload.message || payload.data.message || 'Kapasitas hub diperbarui.',
              type: payload.type || 'INFO',
            });
            break;

          case 'SLA_BREACH_WARNING':
            set({ slaBreach: payload.data });
            get().addLocalNotification({
              title: 'Peringatan SLA',
              message: payload.data.message,
              type: 'CRITICAL',
            });
            break;

          case 'PACKAGE_PRIORITY_UPDATED':
            useSlaQueueStore.getState().updatePackagePriorityLocally(
              payload.data.tracking_id,
              payload.data.is_priority
            );
            get().addLocalNotification({
              title: 'Prioritas Paket Diperbarui',
              message: payload.data.message,
              type: 'INFO',
            });
            break;

          default:
            console.warn('[SSE] Unknown event:', payload.event);
        }
      } catch (err) {
        console.error('[SSE] Parse error:', err);
      }
    };

    es.onerror = (err) => {
      console.warn('[SSE] Connection error, browser will auto-reconnect...', err);
      set({ sseConnected: false, sseReconnecting: true });
    };

    set({ eventSource: es });
  },

  disconnectSSE: () => {
    const es = get().eventSource;
    if (es) {
      es.close();
      console.log('[SSE] Disconnected 🔌');
    }
    set({ eventSource: null, sseConnected: false, sseReconnecting: false });
  },

  fetchNotifications: async () => {
    try {
      const { data } = await api.get('/notifications');
      if (data.success) {
        const notifs = data.data;
        set({
          notifications: notifs,
          unreadCount: notifs.filter((n: NotificationItem) => !n.is_read).length,
        });
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic Update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Mark as read error:', err);
      // Optional: revert state on fail (we skip for simplicity in notifications)
    }
  },

  markAllAsRead: async () => {
    // Optimistic Update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
    try {
      await api.patch('/notifications/read-all');
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  },

  addLocalNotification: (notif) => {
    const newNotif: NotificationItem = {
      id: crypto.randomUUID(),
      ...notif,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 20),
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
