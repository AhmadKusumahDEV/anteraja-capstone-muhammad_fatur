import React from 'react';
import { formatDwell } from '../utils/calculations.js';

export function TopHubs({ topHubs, onSelectHub }) {
  if (!topHubs || topHubs.length === 0) return null;

  return (
    <section style={{ marginBottom: '24px' }}>
      <div className="section-header">
        <h2 className="section-title">Top 3 Hubs by Dwell Time</h2>
        <span className="section-subtitle">Real-time dwell bottleneck</span>
      </div>

      <div className="top-hubs-grid">
        {topHubs.map((hub, idx) => (
          <div
            key={hub.hubId}
            className="card top-hub-card"
            onClick={() => onSelectHub && onSelectHub(hub.hubId)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectHub && onSelectHub(hub.hubId);
              }
            }}
          >
            <div className="top-hub-header">
              <div className="top-hub-rank-name">
                <span className="rank-badge">#{idx + 1}</span>
                <span className="top-hub-name">{hub.name}</span>
              </div>
              <span className={`badge ${hub.isPriority ? 'priority' : 'normal'}`}>
                {hub.isPriority ? 'Priority' : 'Normal'}
              </span>
            </div>

            <div className="top-hub-dwell-row">
              <span className="top-hub-dwell-label">Avg Dwell Time</span>
              <span className="top-hub-dwell-val">{formatDwell(hub.meanDwellHours, 'hrs')}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
