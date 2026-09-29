import { useEffect } from 'react';
import { useAdminContext } from '../context/AdminContext';
import { useFetchData } from './useFetchData';

// Format respons dari RandomUser API (yang relevan untuk kita)
interface RandomUserResponse {
  results: Array<{
    name: { first: string; last: string };
    picture: { medium: string };
  }>;
}

/**
 * Custom Hook ini berfungsi memisahkan logika pengambilan data profil Admin
 * (Separation of Concerns). Hook ini menggunakan Public API (RandomUser API)
 * untuk mensimulasikan foto profil Admin Budi, lalu mengisinya ke dalam Context Store.
 */
export function useAdminProfile() {
  const { adminProfile, setAdminProfile } = useAdminContext();
  
  // Menggunakan custom hook useFetchData untuk memanggil API
  // Parameter ?seed=adminbudi digunakan agar foto yang dihasilkan konsisten (tidak berubah-ubah setiap refresh)
  const { data, isLoading, isError, error } = useFetchData<RandomUserResponse>('https://randomuser.me/api/?seed=adminbudi&inc=name,picture');

  useEffect(() => {
    // Memperbarui Context API global store jika data berhasil di-*fetch*
    if (data && data.results.length > 0 && !adminProfile) {
      const user = data.results[0];
      setAdminProfile({
        name: `${user.name.first} ${user.name.last}`,
        pictureUrl: user.picture.medium,
      });
    }
  }, [data, adminProfile, setAdminProfile]); // Dependency array diatur dengan tepat

  return { isLoading, isError, error };
}
