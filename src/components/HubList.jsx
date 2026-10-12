import React from 'react';
import { formatDwell } from '../utils/calculations.js';

export function HubList({ hubs, selectedHubId, onSelectHub }) {
  return (
    <div className="card list-card">
      <div className="list-header">
        <div className="list-header-left">
          <span className="list-title">Hub Ranking Queue</span>
          <span className="list-count-badge">{hubs.length} nodes listed</span>
        </div>
        <span className="list-hint">Tap row to inspect</span>
      </div>

      <div className="hub-items-scroll">
        {hubs.map((hub, idx) => {
          const isSelected = selectedHubId === hub.hubId;
          return (
            <div
              key={hub.hubId}
              className={`hub-list-row ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectHub(hub.hubId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectHub(hub.hubId);
                }
              }}
            >
              <div className="hub-row-left">
                <span className={`hub-row-rank ${idx < 3 ? 'top-rank' : ''}`}>
                  #{idx + 1}
                </span>
                <div className="hub-row-info">
                  <span className="hub-row-name">{hub.name}</span>
                  <span className="hub-row-id">{hub.hubId}</span>
                </div>
              </div>

              <div className="hub-row-right">
                <div style={{ textAlign: 'right' }}>
                  <div className={`hub-row-dwell ${hub.isPriority ? 'priority' : ''}`}>
                    {formatDwell(hub.meanDwellHours, 'jam')}
                  </div>
                  <span className={`badge ${hub.isPriority ? 'priority' : 'normal'}`} style={{ marginTop: '2px' }}>
                    {hub.isPriority ? 'Priority' : 'Normal'}
                  </span>
                </div>
                <span className="hub-row-chevron">&rsaquo;</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
