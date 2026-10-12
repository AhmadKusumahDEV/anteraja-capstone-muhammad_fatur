import React from 'react';
import { formatNumber } from '../utils/calculations.js';

export function KpiCards({ totalHubs, completedVisits, globalMeanDwell, priorityCount }) {
  return (
    <div className="kpi-grid">
      <div className="card kpi-card">
        <div className="kpi-label">Total Hubs</div>
        <div className="kpi-value">{totalHubs}</div>
        <div className="kpi-note">Facilities</div>
      </div>

      <div className="card kpi-card">
        <div className="kpi-label">Completed Visits</div>
        <div className="kpi-value">{formatNumber(completedVisits)}</div>
        <div className="kpi-note">Visits</div>
      </div>

      <div className="card kpi-card">
        <div className="kpi-label">Global Mean Dwell Time</div>
        <div className="kpi-value">
          {globalMeanDwell.toFixed(2)}
          <span className="kpi-unit">hrs</span>
        </div>
        <div className="kpi-note">Network weighted average</div>
      </div>

      <div className="card kpi-card priority-kpi">
        <div className="kpi-label">Priority Hub Count</div>
        <div className="kpi-value">{priorityCount}</div>
        <div className="kpi-note">Above threshold (&ge; 6 hrs)</div>
      </div>
    </div>
  );
}
