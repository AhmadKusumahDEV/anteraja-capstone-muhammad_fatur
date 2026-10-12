import React from 'react';
import { useHubData } from './hooks/useHubData.js';
import { LoadingView, ErrorView } from './components/StateViews.jsx';

export default function App() {
  const { status, data, error, fileStatuses, retry } = useHubData();

  if (status === 'loading') {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <LoadingView />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <ErrorView error={error} onRetry={retry} />
      </div>
    );
  }

  const { hubs, metrics, locations, aiSummary, validationWarnings } = data;

  const hasSummary = typeof aiSummary?.summary === 'string';
  const hasPriorityHubs = Array.isArray(aiSummary?.priority_hubs);
  const hasNextChecks = Array.isArray(aiSummary?.next_checks);
  const hasExpectedAiFields = hasSummary && hasPriorityHubs && hasNextChecks;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ marginBottom: '24px', borderBottom: '2px solid #E6007E', paddingBottom: '12px' }}>
        <h1 style={{ color: '#1B1464', margin: '0 0 8px 0', fontSize: '28px' }}>
          Anteraja Hub Dwell Monitor — Data Layer Check
        </h1>
        <p style={{ color: '#6b6375', margin: 0, fontSize: '14px' }}>
          Temporary verification screen for Step 1 &amp; Step 3 (will be replaced by full dashboard in the next step).
        </p>
      </header>

      {/* File Status Cards */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#1B1464', marginBottom: '12px' }}>1. File Load Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e5e4e7', background: '#fff' }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>metrics.json</div>
            <div style={{ color: fileStatuses.metrics === 'loaded' ? '#0e9f6e' : '#e02424', fontSize: '13px', marginTop: '4px' }}>
              ● {fileStatuses.metrics.toUpperCase()} ({metrics?.hubs?.length || 0} hubs)
            </div>
          </div>
          <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e5e4e7', background: '#fff' }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>locations.json</div>
            <div style={{ color: fileStatuses.locations === 'loaded' ? '#0e9f6e' : '#e02424', fontSize: '13px', marginTop: '4px' }}>
              ● {fileStatuses.locations.toUpperCase()} ({locations?.hubs?.length || 0} hubs)
            </div>
          </div>
          <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e5e4e7', background: '#fff' }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>ai-summary.json</div>
            <div style={{ color: fileStatuses.aiSummary === 'loaded' ? '#0e9f6e' : '#d97706', fontSize: '13px', marginTop: '4px' }}>
              ● {fileStatuses.aiSummary.toUpperCase()}
            </div>
          </div>
        </div>
      </section>

      {/* Data Join & Consistency Verification */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#1B1464', marginBottom: '12px' }}>2. Data Join &amp; Integrity Verification</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e4e7' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: '#374151' }}>Number of hubs in metrics.json:</td>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1B1464' }}>{metrics?.hubs?.length || 0}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: '#374151' }}>Number of hubs in locations.json:</td>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1B1464' }}>{locations?.hubs?.length || 0}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: '#374151' }}>Hubs joined successfully via adapter:</td>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0e9f6e' }}>{hubs?.length || 0}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: '#374151' }}>Validation warnings found:</td>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: validationWarnings.length === 0 ? '#0e9f6e' : '#d97706' }}>
                {validationWarnings.length}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: '#374151' }}>
                ai-summary.json has expected 3 fields (<code>summary</code>, <code>priority_hubs</code>, <code>next_checks</code>):
              </td>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: hasExpectedAiFields ? '#0e9f6e' : '#e02424' }}>
                {hasExpectedAiFields ? '✓ YES (valid shape)' : '❌ NO'}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Warnings List if Any */}
      {validationWarnings.length > 0 && (
        <section style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '15px' }}>⚠️ Validation Warnings ({validationWarnings.length})</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350f', fontSize: '13px' }}>
            {validationWarnings.map((w, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Sample Adapted Hubs Preview */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#1B1464', marginBottom: '12px' }}>3. Internal Hub Record Sample (Adapter Output)</h2>
        <pre style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', overflowX: 'auto' }}>
          {JSON.stringify(hubs?.slice(0, 2), null, 2)}
        </pre>
      </section>

      <div style={{ textAlign: 'right' }}>
        <button
          type="button"
          onClick={retry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1B1464',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          🔄 Test Reload / Retry Fetch
        </button>
      </div>
    </div>
  );
}
