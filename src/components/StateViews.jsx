import React from 'react';

/**
 * LoadingView component
 * Skeletons and placeholder indicator while data is loading.
 */
export function LoadingView({ message = 'Loading hub dwell metrics and locations...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: '#6b6375'
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e4e7',
          borderTopColor: '#E6007E',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ margin: 0, fontWeight: 500 }}>{message}</p>
    </div>
  );
}

/**
 * ErrorView component
 * Displays error message with a clear Retry button.
 */
export function ErrorView({ error, onRetry }) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to load data';

  return (
    <div
      style={{
        padding: '2.5rem 1.5rem',
        margin: '1.5rem auto',
        maxWidth: '540px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        border: '1px solid #ffccd5',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#ffe5eb',
          color: '#E6007E',
          fontSize: '24px',
          marginBottom: '1rem'
        }}
      >
        ⚠️
      </div>
      <h3 style={{ margin: '0 0 0.5rem', color: '#1B1464' }}>Failed to Load Hub Data</h3>
      <p style={{ margin: '0 0 1.5rem', color: '#e02424', fontSize: '14px', wordBreak: 'break-word' }}>
        {errorMessage}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: '0.65rem 1.4rem',
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
          🔄 Retry Loading
        </button>
      )}
    </div>
  );
}

/**
 * EmptyView component
 * Displayed when filters return 0 results with an option to reset filters.
 */
export function EmptyView({
  message = 'No hubs match your current filter or search criteria.',
  onReset
}) {
  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: '#6b6375',
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px dashed #d1d5db',
        margin: '1rem 0'
      }}
    >
      <p style={{ margin: '0 0 1rem', fontSize: '15px' }}>{message}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1B1464',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Reset Filter
        </button>
      )}
    </div>
  );
}
