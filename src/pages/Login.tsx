import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || !password) {
      toast.error('Mohon isi NIK / ID Operator dan Kata Sandi.');
      return;
    }

    setIsProcessing(true);

    try {
      await useAuthStore.getState().login(nik, password);

      toast.success('Login berhasil! Mengalihkan ke Terminal...');
      navigate('/sla-queue', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Gagal login. Periksa NIK dan Kata Sandi.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-gray-50 lg:bg-white relative">
      {/* Background pattern for mobile/tablet */}
      <div
        className="absolute inset-0 lg:hidden pointer-events-none opacity-60"
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      ></div>

      {/* ─── LEFT PANE ─────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-between p-10 xl:p-16 bg-gray-50 border-r border-gray-200 relative z-10"
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        <div className="mt-8 max-w-xl xl:max-w-2xl">
          {/* Badge */}
          <div className="mb-6 xl:mb-8 inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 xl:px-4 py-1.5 xl:py-2 text-[10px] xl:text-xs font-bold tracking-wider text-anteraja-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-anteraja-primary"></span>
            ENTERPRISE LOGISTICS CONSOLE
          </div>

          <h1 className="text-3xl xl:text-4xl font-black leading-tight text-slate-900 mb-4 xl:mb-6">
            Sistem Manajemen Hub, Signaling &amp; Dispatch Kurir Logistik
          </h1>

          <p className="text-sm xl:text-base leading-relaxed text-gray-500 mb-8 xl:mb-12 max-w-[90%]">
            Pusat sinkronisasi manifest parcel, pemantauan SLA sorting real-time, dan orkestrasi armada Satria Kurir Anteraja seluruh Indonesia.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {[
              {
                color: 'bg-pink-50',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d81b60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                ),
                title: 'SLA Monitor',
                desc: '<30m breach alert',
              },
              {
                color: 'bg-blue-50',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8" /><path d="M8 12h8" />
                  </svg>
                ),
                title: 'In/Out Feeder',
                desc: 'Manifest transit antar-linehaul.',
              },
              {
                color: 'bg-pink-50',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d81b60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                  </svg>
                ),
                title: 'Satria Handover',
                desc: 'Distribusi last-mile & integrasi kurir.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex items-center xl:block rounded-xl border border-gray-200 bg-white p-4 xl:p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`mr-4 xl:mr-0 xl:mb-4 flex shrink-0 h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="mb-0.5 xl:mb-1 text-sm font-bold text-slate-900">{card.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-500">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANE ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center items-center p-4 sm:p-8 lg:p-10 relative z-10 w-full overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white/90 backdrop-blur-md lg:backdrop-blur-none lg:bg-transparent rounded-3xl shadow-2xl lg:shadow-none p-8 sm:p-10 lg:p-0 flex flex-col justify-center border border-white/50 lg:border-none">
          {/* Header */}
          <div className="mb-10 lg:mb-12 flex items-center justify-between">
            <span className="text-2xl font-black tracking-tighter text-anteraja-primary">anteraja</span>
            <span className="rounded-full bg-pink-100 px-3 py-1 lg:px-4 lg:py-1.5 text-[10px] lg:text-xs font-bold tracking-wider text-anteraja-primary">
              HUB ADMIN PORTAL
            </span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Masuk ke Akun</h2>
          <p className="mb-8 lg:mb-10 text-xs sm:text-sm leading-relaxed text-gray-500">
            Masukkan NIK / ID Operator dan kata sandi Anda untuk mengakses sistem terminal.
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5 sm:gap-6">
            
            {/* NIK */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="nik" className="text-xs sm:text-sm font-semibold text-gray-800">NIK / ID Operator</label>
                <span className="text-[10px] sm:text-xs font-semibold text-anteraja-primary">Format: ADM-XXX / NIK</span>
              </div>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="text"
                  id="nik"
                  value={nik}
                  onChange={e => setNik(e.target.value)}
                  placeholder="Contoh: ADM-102 atau NIK 3175..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-xs sm:text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-anteraja-primary focus:outline-none focus:ring-2 focus:ring-anteraja-primary/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-800">Kata Sandi</label>
              </div>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-11 text-xs sm:text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-anteraja-primary focus:outline-none focus:ring-2 focus:ring-anteraja-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-anteraja-primary"
              />
              <label htmlFor="remember" className="cursor-pointer text-xs sm:text-sm font-medium text-gray-700">
                Ingat Terminal &amp; ID Saya
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-anteraja-primary py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:bg-anteraja-primary-dark active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  Masuk ke Terminal Hub
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Right Footer (inside card for mobile) */}
          <div className="mt-10 pt-5 border-t border-gray-100 flex items-center justify-center lg:hidden text-[10px] sm:text-xs text-gray-400">
            <span>Timezone: WIB (UTC+7)</span>
          </div>
        </div>

        {/* Right Footer (desktop) */}
        <div className="hidden lg:flex w-full max-w-[420px] items-center justify-end mt-auto pt-8 text-xs text-gray-400">
          <span>Timezone: WIB (UTC+7)</span>
        </div>
      </div>
    </div>
  );
}
