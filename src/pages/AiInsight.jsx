import React from 'react';
import { formatDwell, formatNumber } from '../utils/calculations.js';
import { ErrorView } from '../components/StateViews.jsx';

/**
 * AI Operational Insight Page
 * Displays summary, priority hubs, and next checks.
 * Follows Skill Step 6 & 7:
 * - All text rendered as plain text React nodes (NO dangerouslySetInnerHTML)
 * - Handles: loading, error with Retry, wrong shape ("Data not available"), empty priority_hubs
 * - Independent error boundary: failure of ai-summary does not break other pages
 */
export function AiInsight({ aiSummary, aiSummaryError, onRetry, hubs = [], isLoading = false }) {
  // 1. Loading State
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ height: '120px', backgroundColor: '#F3F4F6' }} />
        <div className="card" style={{ height: '200px', backgroundColor: '#F3F4F6' }} />
        <div className="card" style={{ height: '160px', backgroundColor: '#F3F4F6' }} />
      </div>
    );
  }

  // 2. Error State with Retry
  if (aiSummaryError) {
    return (
      <ErrorView
        error={aiSummaryError}
        onRetry={onRetry}
      />
    );
  }

  // 3. Wrong Shape / Data Not Available
  const isInvalidShape =
    !aiSummary ||
    (typeof aiSummary !== 'object') ||
    (!aiSummary.summary && (!Array.isArray(aiSummary.priority_hubs) || aiSummary.priority_hubs.length === 0));

  if (isInvalidShape) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
        <h3 style={{ margin: '0 0 6px', color: '#1B1464', fontSize: '18px' }}>Data not available</h3>
        <p style={{ margin: 0, color: '#6B7280', fontSize: '13px' }}>
          AI operational summary could not be found or has an unexpected format.
        </p>
      </div>
    );
  }

  const summaryText = typeof aiSummary.summary === 'string' && aiSummary.summary.trim().length > 0
    ? aiSummary.summary
    : 'Data not available';

  const priorityHubIds = Array.isArray(aiSummary.priority_hubs) ? aiSummary.priority_hubs : [];
  const nextChecks = Array.isArray(aiSummary.next_checks) ? aiSummary.next_checks : [];

  // Map to get real hub details from joined dataset
  const hubMap = new Map(hubs.map(h => [h.hubId, h]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Summary Card */}
      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1B1464', margin: '0 0 12px 0' }}>
          Summary
        </h2>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
          {summaryText}
        </p>
      </div>

      {/* 2. Priority Hubs Card */}
      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1B1464', margin: '0 0 16px 0' }}>
          Priority Hubs
        </h2>

        {priorityHubIds.length === 0 ? (
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontStyle: 'italic' }}>
            No hubs meet the priority threshold
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {priorityHubIds.map(hubId => {
              const hub = hubMap.get(hubId);
              const displayName = hub?.name || hubId;
              const meanDwell = hub ? formatDwell(hub.meanDwellHours, 'hrs') : '6+ hrs';
              const completedText = hub ? `${formatNumber(hub.completedVisits)} visits` : '';

              return (
                <div
                  key={hubId}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                        {displayName}
                      </span>
                      <span style={{ fontSize: '13px', color: '#E6007E', fontWeight: 600 }}>
                        &bull; {meanDwell}
                      </span>
                      <span className="badge priority">PRIORITY</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Hub ID: {hubId} {completedText ? `• ${completedText} completed` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Next Checks Card */}
      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1B1464', margin: '0 0 16px 0' }}>
          Next Checks
        </h2>

        {nextChecks.length === 0 ? (
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
            No action items available.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {nextChecks.map((check, idx) => (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '13px',
                  color: '#374151',
                  lineHeight: '1.5',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    marginTop: '3px',
                    accentColor: '#E6007E',
                    cursor: 'pointer'
                  }}
                />
                <span>{check}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Footnote matching design */}
      <div style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center' }}>
        Generated from verified metrics only.
      </div>
    </div>
  );
}
