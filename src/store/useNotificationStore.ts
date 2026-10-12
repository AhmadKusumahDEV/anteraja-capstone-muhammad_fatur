import { create } from 'zustand';
import api from '../services/api';
import { useHubStore } from './useHubStore';
import { useInboundStore } from './useInboundStore';
import { useManifestStore } from './useManifestStore';
import { useOutboundStore } from './useOutboundStore';
import { useSlaQueueStore } from './useSlaQueueStore';
import slaWarningUrl from '../assets/sla_warning.wav';

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
  play_sound?: string;
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

            // Invalidate query style: refresh tables
            useInboundStore.getState().fetchManifests?.();
            useManifestStore.getState().fetchManifests?.();
            if (payload.data?.hub_id) {
              useHubStore.getState().fetchHubCapacity(payload.data.hub_id);
            }

            get().addLocalNotification({
              title: 'Manifest Baru Masuk',
              message: payload.data?.message || 'Truk manifest baru tiba di hub.',
              type: 'INFO',
            });
            break;

          case 'CAPACITY_LOAD_ALERT': {
            const data = payload.data || {};
            const currentCap = useHubStore.getState().hubCapacity;

            const curLoad = Number(data.current_load ?? currentCap?.current ?? 0);
            
            // Tangkap in_transit_load dari berbagai variasi field data atau fallback ke store
            const incomingInTransit = 
              data.in_transit_load ?? 
              data.in_transit ?? 
              data.in_transit_count ?? 
              data.in_transit_packages;

            const inTransit = Number(
              incomingInTransit !== undefined && incomingInTransit !== null && incomingInTransit !== ''
                ? incomingInTransit
                : (currentCap?.in_transit_load ?? 0)
            );

            const maxCap = Number(data.max_capacity ?? currentCap?.max ?? 0);

            // Hitung persentase jika backend tidak mengirimkannya langsung (misal payload manifest overcapacity)
            const calculatedPercent = maxCap > 0 
              ? Math.round(((curLoad + inTransit) / maxCap) * 100) 
              : 0;
            const percentage = data.capacity_percentage ?? calculatedPercent;

            // Tentukan status zone secara akurat
            const isCritical = payload.type === 'CRITICAL' || 
              (maxCap > 0 && (curLoad + inTransit) > maxCap) || 
              data.status_zone === 'CRITICAL';
            const statusZone = data.status_zone ?? (isCritical ? 'CRITICAL' : 'SAFE');

            const normalizedCapacityData = {
              ...data,
              current_load: curLoad,
              in_transit_load: inTransit,
              max_capacity: maxCap,
              capacity_percentage: percentage,
              status_zone: statusZone,
              message: payload.message || data.message || 'Kapasitas hub diperbarui.',
              play_sound: data.play_sound,
            };

            set({ capacityData: normalizedCapacityData });

            const standbyCouriers = data.standby_couriers !== undefined ? data.standby_couriers : currentCap?.standby_couriers;
            useHubStore.getState().setHubCapacity({
              ...currentCap,
              current: curLoad,
              max: maxCap > 0 ? maxCap : (currentCap?.max || 0),
              in_transit_load: inTransit,
              usage_percent: percentage,
              capacity_status: statusZone,
              standby_couriers: standbyCouriers,
            });

            if (standbyCouriers !== undefined) {
              const currentStats = useOutboundStore.getState().stats;
              useOutboundStore.setState({
                stats: {
                  ...currentStats,
                  active_couriers: standbyCouriers,
                },
              });
            }

            // Sync ke backend capacity jika ada hub_id
            if (data.hub_id) {
              useHubStore.getState().fetchHubCapacity(data.hub_id);
            }

            useSlaQueueStore.getState().fetchQueue?.();

            get().addLocalNotification({
              title: payload.title || 'Info Kapasitas Hub',
              message: payload.message || data.message || 'Kapasitas hub diperbarui.',
              type: payload.type || (isCritical ? 'CRITICAL' : 'INFO'),
            });
            break;
          }

          case 'SLA_BREACH_WARNING':
            set({ slaBreach: payload.data });

            // Putar audio peringatan SLA langsung dari asset frontend
            try {
              const audio = new Audio(slaWarningUrl);
              audio.play().catch((err) => {
                console.warn('[Audio] Autoplay SLA diblokir oleh browser:', err);
              });
            } catch (err) {
              console.warn('[Audio] Gagal memutar audio SLA:', err);
            }

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
