import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNotificationStore } from '../store/useNotificationStore';

const SseToastListener = () => {
  const latestInbound = useNotificationStore((state) => state.latestInbound);
  const capacityData = useNotificationStore((state) => state.capacityData);
  const slaBreach = useNotificationStore((state) => state.slaBreach);

  // Toast saat truk baru masuk
  useEffect(() => {
    if (latestInbound?.message) {
      console.log('[SSE EVENT LOG] INBOUND_ARRIVAL_SIGNAL received:', latestInbound);
      toast.success(`🚛 ${latestInbound.message}`, { duration: 5000 });
    }
  }, [latestInbound]);

  // Toast saat kapasitas berubah (OVERCAPACITY)
  useEffect(() => {
    if (capacityData) {
      console.log('[SSE EVENT LOG] CAPACITY_LOAD_ALERT received:', capacityData);
      
      // Jika ada peringatan overcapacity dengan in_transit_load (format baru dari backend)
      if (capacityData.in_transit_load !== undefined) {
        toast.error(
          `AWAS! Beban: ${capacityData.current_load} + OTW: ${capacityData.in_transit_load} melebihi Kapasitas (${capacityData.max_capacity})!`,
          { duration: 8000 }
        );
      } else {
        // Fallback untuk format payload kapasitas lama
        if (capacityData.status_zone === 'WARNING') {
          toast.error(`⚠️ ${capacityData.message}`, { duration: 5000 });
        } else {
          toast(`📦 ${capacityData.message}`, { duration: 3000 });
        }
      }
    }
  }, [capacityData]);

  // Toast saat SLA breach
  useEffect(() => {
    if (slaBreach?.message) {
      console.log('[SSE EVENT LOG] SLA_BREACH_WARNING received:', slaBreach);
      toast.error(`🚨 ${slaBreach.message}`, { duration: 8000 });
    }
  }, [slaBreach]);

  return null;
};

export default SseToastListener;
