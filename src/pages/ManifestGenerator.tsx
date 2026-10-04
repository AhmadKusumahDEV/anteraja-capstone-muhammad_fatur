import { useEffect } from 'react';
import ManifestConfigForm from '../features/manifest/ManifestConfigForm';
import ManifestPreview from '../features/manifest/ManifestPreview';
import ManifestLogTable from '../features/manifest/ManifestLogTable';
import api from '../services/api';
import { useHubStore } from '../store/useHubStore';

export default function ManifestGenerator() {
  const { setHubs, setManifestLogs } = useHubStore();

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const [hubsRes, manifestsRes] = await Promise.all([
          api.get('/hubs'),
          api.get('/manifests')
        ]);
        
        if (isMounted) {
          if (hubsRes.data?.data) {
            const mappedHubs = hubsRes.data.data.map((item: any, index: number) => ({
              id: item.id || (index + 1),
              hub_code: item.id, // backend API returns ID like 'HUB-JKS-01'
              hub_name: item.name,
              hub_color: 'bg-blue-500'
            }));
            setHubs(mappedHubs);
          }
          if (manifestsRes.data?.data?.items) {
            // Mapping from API response to ManifestLogEntry type
            const logs = manifestsRes.data.data.items.map((item: any) => ({
              manifest_code: item.manifest_code,
              destination_hub_code: item.destination_hub_code,
              destination_hub_name: item.destination_hub_name,
              total_packages: item.total_packages,
              vehicle_type: item.vehicle_type,
              created_at: item.created_at,
              hub_color: 'bg-blue-500', // default fallback color
              packages: [], // Detail not returned in list
            }));
            setManifestLogs(logs);
          }
        }
      } catch (error) {
        console.error('Error fetching manifest generator data:', error);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [setHubs, setManifestLogs]);

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
    </>
  );
}
