import React from 'react';
import { PRIORITY_THRESHOLD_HOURS } from '../utils/constants.js';

/**
 * Data Notes Page
 * Definitions, priority rules, and verified data sources.
 * Follows Skill Step 6 strictly (no invented systems, mentions real files).
 */
export function DataNotes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Metric Definitions */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1B1464', margin: '0 0 16px 0' }}>
          Metric Definitions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Dwell Time
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
              Elapsed time in hours between arrival and departure of a visit at the hub facility.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Completed Visits
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
              Number of visits with verified arrival and departure timestamps. Only completed visits are included in dwell calculations.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Open Visits (excluded from the average)
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
              Active visits currently inside the hub without a recorded departure scan. Tracked separately as operational backlog and excluded from any dwell mean.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Global Mean Dwell Time
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
              Network-wide mean dwell time across all hubs, weighted by completed visits: &Sigma;(hubMean &times; hubCompleted) / &Sigma;(hubCompleted). Open visits are excluded.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Priority Levels */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1B1464', margin: '0 0 12px 0' }}>
          Priority Levels
        </h2>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E6007E' }} />
          <span style={{ fontSize: '14px', color: '#1F2937' }}>
            <strong>Priority Hub:</strong> mean dwell time &ge; {PRIORITY_THRESHOLD_HOURS} hrs (aturan simulasi latihan operasional Day 19, bukan SLA resmi Anteraja).
          </span>
        </div>
      </section>

      {/* 3. Data Sources Table */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1B1464', margin: '0 0 12px 0' }}>
          Data Sources
        </h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '12px 18px', color: '#64748B', fontWeight: 600 }}>Source</th>
                <th style={{ padding: '12px 18px', color: '#64748B', fontWeight: 600 }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>metrics.json</td>
                <td style={{ padding: '12px 18px', color: '#475569' }}>
                  Visit records and dwell time per hub (mean, min, max, completed visit counts).
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>locations.json</td>
                <td style={{ padding: '12px 18px', color: '#475569' }}>
                  Hub ID, hub name, city, province, and map centroid coordinates.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
