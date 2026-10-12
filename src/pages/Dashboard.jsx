import React, { useMemo, useEffect, useState } from 'react';
import { KpiCards } from '../components/KpiCards.jsx';
import { TopHubs } from '../components/TopHubs.jsx';
import { FilterBar } from '../components/FilterBar.jsx';
import { HubMap } from '../components/HubMap.jsx';
import { HubList } from '../components/HubList.jsx';
import { HubDetail } from '../components/HubDetail.jsx';
import { EmptyView, EmptyDatasetView } from '../components/StateViews.jsx';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import {
  computeGlobalMeanDwell,
  computeTotalCompletedVisits,
  countPriorityHubs,
  getTop3Hubs,
  rankHubsByDwell
} from '../utils/calculations.js';

export function Dashboard({ hubs = [] }) {
  // 1. Shared filter state lives in the Dashboard page
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHubId, setSelectedHubId] = useState(null);

  // Responsive state for mobile layout
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute network-wide KPIs from all hubs
  const totalHubs = hubs.length;
  const totalCompletedVisits = useMemo(() => computeTotalCompletedVisits(hubs), [hubs]);
  const globalMeanDwell = useMemo(() => computeGlobalMeanDwell(hubs), [hubs]);
  const priorityCount = useMemo(() => countPriorityHubs(hubs), [hubs]);
  const top3Hubs = useMemo(() => getTop3Hubs(hubs), [hubs]);

  // Ranked all hubs by raw numeric dwell time descending
  const rankedHubs = useMemo(() => rankHubsByDwell(hubs), [hubs]);

  // Derived visible hubs based on shared filters: ONE visibleHubs passed to both HubList and HubMap
  const visibleHubs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rankedHubs
      .filter(h => !priorityOnly || h.isPriority)
      .filter(h => {
        if (!query) return true;
        const nameMatch = (h.name || '').toLowerCase().includes(query);
        const idMatch = (h.hubId || '').toLowerCase().includes(query);
        return nameMatch || idMatch;
      });
  }, [rankedHubs, priorityOnly, searchQuery]);

  // Edge case: Clear selected hub if no longer in visibleHubs after filter change
  useEffect(() => {
    if (selectedHubId && !visibleHubs.some(h => h.hubId === selectedHubId)) {
      setSelectedHubId(null);
    }
  }, [visibleHubs, selectedHubId]);

  const selectedHub = useMemo(() => {
    return hubs.find(h => h.hubId === selectedHubId) || null;
  }, [hubs, selectedHubId]);

  const handleResetFilter = () => {
    setPriorityOnly(false);
    setSearchQuery('');
  };

  // Empty Case: Dataset contains 0 hubs
  if (totalHubs === 0) {
    return (
      <div>
        <KpiCards
          totalHubs={0}
          completedVisits={0}
          globalMeanDwell={0}
          priorityCount={0}
        />
        <EmptyDatasetView />
      </div>
    );
  }

  return (
    <div>
      {/* Four KPI Cards */}
      <KpiCards
        totalHubs={totalHubs}
        completedVisits={totalCompletedVisits}
        globalMeanDwell={globalMeanDwell}
        priorityCount={priorityCount}
      />

      {/* Top 3 Hubs by Dwell Time */}
      <TopHubs
        topHubs={top3Hubs}
        onSelectHub={(id) => setSelectedHubId(id)}
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityOnly={priorityOnly}
        onPriorityToggle={setPriorityOnly}
        totalCount={totalHubs}
        priorityCount={priorityCount}
      />

      {/* Empty Case: Filter returns 0 hubs */}
      {visibleHubs.length === 0 ? (
        <EmptyView
          message="No hubs match your filter"
          onReset={handleResetFilter}
        />
      ) : (
        <div className="dashboard-split">
          {/* Map isolated in an ErrorBoundary: map failure must not break KPIs or list */}
          <ErrorBoundary
            name="HubMap"
            fallback={(err, retry) => (
              <div
                className="card map-card"
                style={{
                  height: '480px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F9FAFB',
                  padding: '24px',
                  textAlign: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺️</div>
                  <h4 style={{ margin: '0 0 6px', color: '#1B1464' }}>Map Failed to Render</h4>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B7280', maxWidth: '320px' }}>
                    The interactive map encountered an issue ({err?.message || 'render error'}). All KPIs and queue lists remain operational.
                  </p>
                  <button
                    type="button"
                    onClick={retry}
                    className="segment-btn active"
                  >
                    🔄 Retry Map
                  </button>
                </div>
              </div>
            )}
          >
            <HubMap
              hubs={visibleHubs}
              selectedHubId={selectedHubId}
              onSelectHub={(id) => setSelectedHubId(id)}
            />
          </ErrorBoundary>

          {/* Right Column: Detail replaces list on desktop, list always visible on mobile */}
          <div className="list-detail-column">
            {!isMobile && selectedHub ? (
              <HubDetail
                hub={selectedHub}
                onClose={() => setSelectedHubId(null)}
                isMobile={false}
              />
            ) : (
              <HubList
                hubs={visibleHubs}
                selectedHubId={selectedHubId}
                onSelectHub={(id) => setSelectedHubId(id)}
              />
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet for Detail */}
      {isMobile && selectedHub && (
        <HubDetail
          hub={selectedHub}
          onClose={() => setSelectedHubId(null)}
          isMobile={true}
        />
      )}

      {/* Practice Simulation Disclaimer Note */}
      <div className="simulation-disclaimer">
        <span>ℹ️</span>
        <span>
          <strong>Catatan Simulasi:</strong> Ambang batas 6 jam adalah aturan simulasi latihan operasional Day 19, bukan Service Level Agreement (SLA) resmi Anteraja.
        </span>
      </div>
    </div>
  );
}
