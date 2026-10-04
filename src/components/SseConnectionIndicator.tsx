import { useNotificationStore } from '../store/useNotificationStore';

const SseConnectionIndicator = () => {
  const { sseConnected, sseReconnecting } = useNotificationStore();

  if (sseReconnecting) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-yellow-500/90 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur text-xs font-medium animate-pulse">
        <svg className="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Connecting to live updates...
      </div>
    );
  }

  if (!sseConnected && !sseReconnecting) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur text-xs font-medium">
        <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 00-12.728 0m12.728 0l-12.728 12.728m12.728-12.728l-1.414 1.414M5.636 5.636l1.414 1.414m11.314 1.414a7 7 0 00-9.9 0m9.9 0l-1.414 1.414m-7.072-1.414l1.414 1.414m5.657 1.414a5 5 0 00-7.071 0m7.071 0l-1.414 1.414m-4.243-1.414l1.414 1.414m2.829 1.414a3 3 0 00-4.243 0" />
        </svg>
        Live updates offline
      </div>
    );
  }

  // Jika connected tidak perlu nampilin apa-apa agar tidak mengganggu,
  // Atau bisa menampilkan green dot kecil sementara lalu fade out, tapi biar clean kita null-kan.
  return null;
};

export default SseConnectionIndicator;
