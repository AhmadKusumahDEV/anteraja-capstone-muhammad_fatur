import React from 'react';
import { formatDwell } from '../utils/calculations.js';

export function AiInsight({ aiSummary, hubs = [] }) {
  const summaryText = aiSummary?.summary || 'Data not available';
  const priorityHubIds = Array.isArray(aiSummary?.priority_hubs) ? aiSummary.priority_hubs : [];
  const nextChecks = Array.isArray(aiSummary?.next_checks) ? aiSummary.next_checks : [];

  // Match priority hub details if available
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
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
            No hubs meet the priority threshold
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {priorityHubIds.map(hubId => {
              const hub = hubMap.get(hubId);
              const displayName = hub?.name || hubId;
              const meanDwell = hub ? formatDwell(hub.meanDwellHours, 'jam') : '6+ jam';

              return (
                <div
                  key={hubId}
                  style={{
                    padding: '12px 16px',
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
                    Hub ID: {hubId} {hub ? `• ${hub.completedVisits.toLocaleString('id-ID')} kunjungan selesai` : ''}
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
            No checklist items available.
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

      <div style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center' }}>
        Generated from verified metrics only.
      </div>
    </div>
  );
}
