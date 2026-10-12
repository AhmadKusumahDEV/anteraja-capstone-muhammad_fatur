import React from 'react';
import { PRIORITY_THRESHOLD_HOURS } from '../utils/constants.js';

export function DataNotes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metric Definitions */}
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
              Waktu tunggu terukur dalam jam antara pencatatan kedatangan (arrival) hingga keberangkatan (departure) di dalam fasilitas hub.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Completed Visits
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
              Jumlah kunjungan dengan pasangan kedatangan dan keberangkatan yang valid. Hanya kunjungan selesai yang dihitung dalam kalkulasi dwell time.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Open Visits (excluded from the average)
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
              Kunjungan aktif yang belum memiliki pencatatan keberangkatan. Dikecualikan sepenuhnya dari rata-rata agar tidak mendistorsi metrik durasi.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Global Mean Dwell Time
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
              Rata-rata waktu tunggu seluruh jaringan yang dibobotkan secara proporsional dengan jumlah kunjungan selesai per hub (weighted average).
            </p>
          </div>
        </div>
      </section>

      {/* Priority Levels */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1B1464', margin: '0 0 12px 0' }}>
          Priority Levels
        </h2>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E6007E' }} />
          <span style={{ fontSize: '14px', color: '#1F2937' }}>
            <strong>Priority Hub:</strong> mean dwell time &ge; {PRIORITY_THRESHOLD_HOURS} jam (aturan simulasi latihan Day 19, bukan SLA resmi Anteraja).
          </span>
        </div>
      </section>

      {/* Data Sources */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1B1464', margin: '0 0 12px 0' }}>
          Data Sources
        </h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '12px 18px', color: '#64748B', fontWeight: 600 }}>Source File</th>
                <th style={{ padding: '12px 18px', color: '#64748B', fontWeight: 600 }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0F172A' }}>metrics.json</td>
                <td style={{ padding: '12px 18px', color: '#475569' }}>
                  Agregasi metrik operasional, durasi dwell (mean/min/max), dan jumlah kunjungan per hub.
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0F172A' }}>locations.json</td>
                <td style={{ padding: '12px 18px', color: '#475569' }}>
                  Metadata geografis hub, nama kota, provinsi, dan koordinat centroid lokasi fasilitas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
