import React from 'react';

/**
 * LoadingView component
 * Renders full layout skeletons: KPI cards, Top 3 hubs, Map placeholder, and list rows.
 */
export function LoadingView() {
  return (
    <div className="skeleton-container" style={{ width: '100%' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .skeleton-box {
          background-color: #E5E7EB;
          border-radius: 8px;
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* 4 KPI Skeletons */}
      <div className="kpi-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: '20px' }}>
            <div className="skeleton-box" style={{ width: '80px', height: '14px', marginBottom: '12px' }} />
            <div className="skeleton-box" style={{ width: '120px', height: '32px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ width: '90px', height: '12px' }} />
          </div>
        ))}
      </div>

      {/* Top 3 Hubs Skeletons */}
      <div style={{ marginBottom: '24px' }}>
        <div className="skeleton-box" style={{ width: '180px', height: '16px', marginBottom: '12px' }} />
        <div className="top-hubs-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ padding: '16px 20px', height: '88px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div className="skeleton-box" style={{ width: '140px', height: '18px' }} />
                <div className="skeleton-box" style={{ width: '60px', height: '18px', borderRadius: '12px' }} />
              </div>
              <div className="skeleton-box" style={{ width: '100px', height: '22px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div className="skeleton-box" style={{ flex: 1, maxWidth: '480px', height: '40px' }} />
        <div className="skeleton-box" style={{ width: '220px', height: '40px' }} />
      </div>

      {/* Split Map & List Skeletons */}
      <div className="dashboard-split">
        {/* Gray Map Placeholder */}
        <div className="card map-card" style={{ height: '480px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB' }}>
            <div className="skeleton-box" style={{ width: '100px', height: '18px' }} />
          </div>
          <div style={{ flex: 1, backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: '14px' }}>
              🗺️ Loading interactive map...
            </span>
          </div>
        </div>

        {/* List Rows Skeletons */}
        <div className="card list-card" style={{ height: '480px', padding: '16px' }}>
          <div className="skeleton-box" style={{ width: '160px', height: '20px', marginBottom: '20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="skeleton-box" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                  <div>
                    <div className="skeleton-box" style={{ width: '120px', height: '14px', marginBottom: '6px' }} />
                    <div className="skeleton-box" style={{ width: '80px', height: '11px' }} />
                  </div>
                </div>
                <div className="skeleton-box" style={{ width: '65px', height: '20px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ErrorView component
 * Branded error card with error details and working Retry button.
 */
export function ErrorView({ error, onRetry }) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to load data';

  return (
    <div
      style={{
        padding: '3rem 2rem',
        margin: '2rem auto',
        maxWidth: '560px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        border: '1px solid #FECACA',
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          fontSize: '24px',
          marginBottom: '1rem'
        }}
      >
        ⚠️
      </div>
      <h3 style={{ margin: '0 0 0.5rem', color: '#1B1464', fontSize: '18px' }}>
        Failed to Load Operational Data
      </h3>
      <p style={{ margin: '0 0 1.5rem', color: '#DC2626', fontSize: '13px', lineHeight: '1.5', wordBreak: 'break-word' }}>
        {errorMessage}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: '10px 22px',
            backgroundColor: '#E6007E',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
        >
          🔄 Retry
        </button>
      )}
    </div>
  );
}

/**
 * EmptyView component
 * Rendered when search/filter returns 0 hubs with a "Reset filter" button.
 */
export function EmptyView({
  message = 'No hubs match your filter',
  onReset
}) {
  return (
    <div
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px dashed #D1D5DB',
        margin: '1.5rem 0'
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
      <h3 style={{ margin: '0 0 8px', color: '#1B1464', fontSize: '16px' }}>{message}</h3>
      <p style={{ margin: '0 0 20px', color: '#6B7280', fontSize: '13px' }}>
        Try searching for another hub name or reset your priority filter.
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: '9px 20px',
            backgroundColor: '#1B1464',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Reset filter
        </button>
      )}
    </div>
  );
}

/**
 * EmptyDatasetView component
 * Rendered when the entire dataset is empty.
 */
export function EmptyDatasetView() {
  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        margin: '1.5rem 0'
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
      <h3 style={{ margin: '0 0 6px', color: '#1B1464', fontSize: '16px' }}>No Hub Data Available</h3>
      <p style={{ margin: 0, color: '#6B7280', fontSize: '13px' }}>
        The dataset contains 0 hubs. All calculations safely return default metrics.
      </p>
    </div>
  );
}
