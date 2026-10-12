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

  // Toast saat kapasitas berubah (OVERCAPACITY / UPDATE)
  useEffect(() => {
    if (capacityData) {
      console.log('[SSE EVENT LOG] CAPACITY_LOAD_ALERT received:', capacityData);

      const isOverCapacity =
        capacityData.status_zone === 'CRITICAL' ||
        (capacityData.max_capacity > 0 &&
          (capacityData.current_load + (capacityData.in_transit_load || 0)) > capacityData.max_capacity);

      if (isOverCapacity) {
        toast.error(
          capacityData.message ||
            `🚨 AWAS! Beban: ${capacityData.current_load} + OTW: ${capacityData.in_transit_load || 0} melebihi Kapasitas (${capacityData.max_capacity})!`,
          { duration: 8000 }
        );
      } else if (capacityData.status_zone === 'WARNING') {
        toast.error(`⚠️ ${capacityData.message || 'Kapasitas hub mendekati batas maksimal!'}`, { duration: 5000 });
      } else {
        toast.success(`📦 ${capacityData.message || 'Kapasitas hub diperbarui.'}`, { duration: 4000 });
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
