import { useEffect, useRef, useState } from 'react';
import cowwSoundUrl from '../assets/coww.mpeg';
import { useAdminContext } from '../context/AdminContext';
import { useNotificationStore } from '../store/useNotificationStore';

export default function CapacityAlarm() {
  const { isAlarmMuted, toggleAlarmMute } = useAdminContext();
  const capacityData = useNotificationStore((state) => state.capacityData);

  const [showModal, setShowModal] = useState(false);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const [alarmDetails, setAlarmDetails] = useState<{
    current_load: number;
    in_transit_load: number;
    max_capacity: number;
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const snoozeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSnooze = () => {
    setShowModal(false);
    setIsSnoozed(true);

    if (snoozeTimeoutRef.current) clearTimeout(snoozeTimeoutRef.current);

    snoozeTimeoutRef.current = setTimeout(() => {
      setIsSnoozed(false);
    }, 15 * 60 * 1000);
  };

  const handleDismissSession = () => {
    setShowModal(false);
    setIsDismissed(true);

    if (snoozeTimeoutRef.current) clearTimeout(snoozeTimeoutRef.current);
    snoozeTimeoutRef.current = null;
  };

  useEffect(() => {
    // Tangkap data dari SSE Backend
    // Sekarang Backend memberikan status_zone: "CRITICAL" jika bahaya
    if (capacityData && capacityData.status_zone === 'CRITICAL') {
      setAlarmDetails({
        current_load: capacityData.current_load,
        in_transit_load: capacityData.in_transit_load || 0, // Fallback jika dihapus
        max_capacity: capacityData.max_capacity,
      });

      if (!isSnoozed && !isDismissed) {
        setShowModal(true);
      }
    } else {
      // Jika sudah turun menjadi HIGH/MODERATE/SAFE, otomatis tutup modal
      setShowModal(false);
    }
  }, [capacityData, isSnoozed, isDismissed]);

  useEffect(() => {
    if (showModal && !isAlarmMuted && capacityData?.play_sound) {
      // Gunakan cowwSoundUrl bawaan kita sebagai default, atau audio dinamis
      const audio = new Audio(cowwSoundUrl);
      audio.loop = true;
      audio.play().catch((e) => console.error("Audio block oleh browser", e));
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [showModal, isAlarmMuted]);

  useEffect(() => {
    return () => {
      if (snoozeTimeoutRef.current) clearTimeout(snoozeTimeoutRef.current);
    };
  }, []);

  if (!showModal || !alarmDetails) return null;

  const totalIncomingLoad = alarmDetails.current_load + alarmDetails.in_transit_load;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-red-900/40 backdrop-blur-md"></div>

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-4 ring-red-500/50 animate-in zoom-in-95 duration-200">
        <div className="bg-red-600 px-6 py-5 flex flex-col items-center justify-center relative">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={toggleAlarmMute}
              className="text-white/80 hover:text-white"
              title={isAlarmMuted ? "Bunyikan Alarm" : "Matikan Suara"}
            >
              {isAlarmMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white mb-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-extrabold tracking-tight text-white uppercase text-center">
            Peringatan Kapasitas Kritis
          </h2>
        </div>

        <div className="p-8">
          <p className="text-gray-600 text-center text-sm font-medium mb-8">
            Hub mendeteksi potensi <strong className="text-red-600">OVERLOAD</strong>. Jumlah manifest yang sedang dalam perjalanan melebihi sisa kapasitas Hub.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Maksimal Hub</p>
              <p className="text-2xl font-black text-gray-900">{alarmDetails.max_capacity}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center shadow-inner">
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Total Proyeksi</p>
              <p className="text-2xl font-black text-red-600">{totalIncomingLoad}</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Telah berada di Hub:</span>
              <span className="font-bold text-gray-900">{alarmDetails.current_load} Paket</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Akan Tiba (In-Transit):</span>
              <span className="font-bold text-orange-600">+{alarmDetails.in_transit_load} Paket</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-sm">
              <span className="font-bold text-red-600">Kelebihan Beban:</span>
              <span className="font-black text-red-600">+{totalIncomingLoad - alarmDetails.max_capacity} Paket</span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleSnooze}
              className="w-full rounded-xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-red-700 active:scale-[0.98]"
            >
              TUNDA PERINGATAN (15 MENIT)
            </button>
            <button
              onClick={handleDismissSession}
              className="w-full rounded-xl bg-gray-50 py-3 text-xs font-bold text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-[0.98]"
            >
              MATIKAN PERINGATAN UNTUK SESI INI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}