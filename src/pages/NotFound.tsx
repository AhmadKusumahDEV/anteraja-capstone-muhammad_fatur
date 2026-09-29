import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="rounded-2xl bg-white p-8 shadow-xl max-w-md w-full">
        <h1 className="text-6xl font-black text-anteraja-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8">
          Maaf, rute atau halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)} // Programmatic Routing
            className="w-full rounded-xl bg-gray-100 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            Kembali ke Halaman Sebelumnya
          </button>
          
          <Link
            to="/"
            className="w-full rounded-xl bg-anteraja-primary py-3 font-semibold text-white shadow-md transition-all hover:bg-anteraja-primary-dark"
          >
            Ke Beranda Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
