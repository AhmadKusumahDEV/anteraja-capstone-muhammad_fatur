import React, { useState } from 'react';
import { formatDwell, formatNumber } from '../utils/calculations.js';

export function HubDetail({ hub, onClose, isMobile = false }) {
  const [isMarked, setIsMarked] = useState(false);

  if (!hub) return null;

  const content = (
    <>
      {!isMobile && (
        <button
          type="button"
          className="hub-detail-back-btn"
          onClick={onClose}
        >
          &larr; Back to list
        </button>
      )}

      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>HUB DETAIL</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              color: '#6B7280',
              cursor: 'pointer',
              padding: '4px'
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      )}

      <div className="hub-detail-header">
        <div>
          <h3 className="hub-detail-title">{hub.name}</h3>
          <span className="hub-detail-id">{hub.hubId}</span>
        </div>
        <span className={`badge ${hub.isPriority ? 'priority' : 'normal'}`}>
          {hub.isPriority ? 'Priority' : 'Normal'}
        </span>
      </div>

      <div className="detail-metrics-grid">
        <div className="detail-metric-box">
          <div className="detail-metric-label">Avg Dwell Time</div>
          <div className={`detail-metric-val ${hub.isPriority ? 'highlight' : ''}`}>
            {formatDwell(hub.meanDwellHours, 'jam')}
          </div>
        </div>

        <div className="detail-metric-box">
          <div className="detail-metric-label">Completed Visits</div>
          <div className="detail-metric-val">{formatNumber(hub.completedVisits)}</div>
        </div>

        <div className="detail-metric-box">
          <div className="detail-metric-label">Min Dwell Time</div>
          <div className="detail-metric-val">{formatDwell(hub.minDwellHours, 'jam')}</div>
        </div>

        <div className="detail-metric-box">
          <div className="detail-metric-label">Max Dwell Time</div>
          <div className="detail-metric-val">{formatDwell(hub.maxDwellHours, 'jam')}</div>
        </div>

        <div className="detail-metric-box" style={{ gridColumn: 'span 2' }}>
          <div className="detail-metric-label">Open Visits</div>
          <div className="detail-metric-val">
            {hub.openVisits !== null ? formatNumber(hub.openVisits) : 'N/A'}
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
            {hub.openVisits === null ? 'Not provided in per-hub dataset (tracked at network level)' : ''}
          </span>
        </div>
      </div>

      <button
        type="button"
        className={`investigate-btn ${isMarked ? 'marked' : ''}`}
        onClick={() => setIsMarked(!isMarked)}
      >
        {isMarked ? '✓ Marked for Investigation' : 'Mark for investigation'}
      </button>
    </>
  );

  if (isMobile) {
    return (
      <div className="mobile-sheet-overlay" onClick={onClose}>
        <div className="mobile-sheet-container" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-sheet-handle" />
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="card hub-detail-card">
      {content}
    </div>
  );
}
