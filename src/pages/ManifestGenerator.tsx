import ManifestConfigForm from '../features/manifest/ManifestConfigForm';
import ManifestPreview from '../features/manifest/ManifestPreview';
import ManifestLogTable from '../features/manifest/ManifestLogTable';
import ManifestDetailModal from '../features/manifest/ManifestDetailModal';

export default function ManifestGenerator() {
  return (
    <>
      <section aria-labelledby="generator-heading" className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1
            id="generator-heading"
            className="text-2xl font-bold tracking-tight text-gray-900"
          >
            Manifest Data Generator
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Halaman simulasi &amp; pembuatan skenario manifest batch paket otomatis ke Hub tujuan pilihan untuk pengujian alur sorting dan outbound dispatch.
          </p>
        </div>

        {/* Top Section: Form + Preview (2 Columns) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Column 1: Config Form */}
          <div className="flex flex-col h-full">
            <ManifestConfigForm />
          </div>

          {/* Column 2: Live Preview */}
          <div className="flex flex-col h-full">
            <ManifestPreview />
          </div>
        </div>

        {/* Bottom Section: Log History */}
        <ManifestLogTable />
      </section>

      {/* Detail Modal Portal */}
      <ManifestDetailModal />
    </>
  );
}
