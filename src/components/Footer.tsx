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

      </div>
    </footer>
  );
}
