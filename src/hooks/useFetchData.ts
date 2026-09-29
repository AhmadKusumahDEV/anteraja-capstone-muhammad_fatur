import { useState, useEffect } from 'react';

// Tipe untuk state fetching data
interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Custom Hook yang reusable untuk melakukan Asynchronous Data Fetching.
 * - Menggunakan AbortController untuk mencegah memory leak
 * - Menangani status loading dan error dengan baik
 */
export function useFetchData<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    isError: false,
    error: null,
  });

  useEffect(() => {
    // 1. Inisialisasi AbortController untuk cancel request jika komponen unmount
    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      // Set loading state jika belum (terutama saat fetch ulang)
      setState((prev) => ({ ...prev, isLoading: true, isError: false, error: null }));

      try {
        const response = await fetch(url, { signal });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Gagal memuat data dari API`);
        }

        const json = await response.json();
        
        // Cek jika request tidak di-abort sebelum set state
        if (!signal.aborted) {
          setState({
            data: json as T,
            isLoading: false,
            isError: false,
            error: null,
          });
        }
      } catch (err: unknown) {
        // Abaikan error AbortError (disengaja saat unmount)
        if (err instanceof Error && err.name === 'AbortError') return;

        if (!signal.aborted) {
          setState({
            data: null,
            isLoading: false,
            isError: true,
            error: err instanceof Error ? err : new Error('Unknown Error'),
          });
        }
      }
    };

    fetchData();

    // Cleanup function untuk membatalkan request saat komponen di-unmount 
    // atau ketika URL berubah (mencegah memory leak / infinite loop).
    return () => {
      controller.abort();
    };
  }, [url]); // Dependency array: efek akan berjalan ulang HANYA jika URL berubah

  return state;
}
