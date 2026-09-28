export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Copyright & Branding */}
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="text-sm font-bold text-gray-800">
            &copy; {currentYear} Courier Admin Mini-Panel
          </p>
          <p className="text-xs font-medium text-gray-500">
            Dynamic SLA Queue &amp; Signaling System
          </p>
        </div>

        {/* Links & Metadata */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          <a href="#" className="hover:text-anteraja-primary transition-colors">Bantuan Pusat</a>
          <span className="h-3 w-px bg-gray-300" aria-hidden="true" />
          <a href="#" className="hover:text-anteraja-primary transition-colors">Kebijakan Privasi</a>
          <span className="h-3 w-px bg-gray-300" aria-hidden="true" />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            Sistem Normal (v1.0.0-beta)
          </span>
        </div>
      </div>
    </footer>
  );
}
