import React, { useMemo, useEffect, useState } from 'react';
import { KpiCards } from '../components/KpiCards.jsx';
import { TopHubs } from '../components/TopHubs.jsx';
import { FilterBar } from '../components/FilterBar.jsx';
import { HubMap } from '../components/HubMap.jsx';
import { HubList } from '../components/HubList.jsx';
import { HubDetail } from '../components/HubDetail.jsx';
import { EmptyView } from '../components/StateViews.jsx';
import {
  computeGlobalMeanDwell,
  computeTotalCompletedVisits,
  countPriorityHubs,
  getTop3Hubs,
  rankHubsByDwell
} from '../utils/calculations.js';

export function Dashboard({ hubs }) {
  // Shared Filter State
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHubId, setSelectedHubId] = useState(null);

  // Responsive state for mobile layout check
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute un-filtered network KPIs from full dataset
  const totalHubs = hubs.length;
  const totalCompletedVisits = useMemo(() => computeTotalCompletedVisits(hubs), [hubs]);
  const globalMeanDwell = useMemo(() => computeGlobalMeanDwell(hubs), [hubs]);
  const priorityCount = useMemo(() => countPriorityHubs(hubs), [hubs]);
  const top3Hubs = useMemo(() => getTop3Hubs(hubs), [hubs]);

  // Ranked all hubs (descending numeric dwell time)
  const rankedHubs = useMemo(() => rankHubsByDwell(hubs), [hubs]);

  // Derived visible hubs based on shared filters
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

  // Clear selected hub if it gets filtered out
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

  return (
    <div>
      {/* 1. Four KPI Cards */}
      <KpiCards
        totalHubs={totalHubs}
        completedVisits={totalCompletedVisits}
        globalMeanDwell={globalMeanDwell}
        priorityCount={priorityCount}
      />

      {/* 2. Top 3 Critical Hubs */}
      <TopHubs
        topHubs={top3Hubs}
        onSelectHub={(id) => setSelectedHubId(id)}
      />

      {/* 3. Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityOnly={priorityOnly}
        onPriorityToggle={setPriorityOnly}
        totalCount={totalHubs}
        priorityCount={priorityCount}
      />

      {/* 4. Split Map and List View */}
      {visibleHubs.length === 0 ? (
        <EmptyView
          message={`No hubs match "${searchQuery || 'selected filter'}". Try resetting filters to see all hubs.`}
          onReset={handleResetFilter}
        />
      ) : (
        <div className="dashboard-split">
          {/* Left Column: Interactive Leaflet Map */}
          <HubMap
            hubs={visibleHubs}
            selectedHubId={selectedHubId}
            onSelectHub={(id) => setSelectedHubId(id)}
          />

          {/* Right Column: List or Detail on Desktop */}
          <div className="list-detail-column">
            {/* Desktop replacement: Detail replaces List when selected */}
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

      {/* Mobile Bottom Sheet Modal for Hub Detail */}
      {isMobile && selectedHub && (
        <HubDetail
          hub={selectedHub}
          onClose={() => setSelectedHubId(null)}
          isMobile={true}
        />
      )}

      {/* 5. Practice Simulation Disclaimer Note */}
      <div className="simulation-disclaimer">
        <span>ℹ️</span>
        <span>
          <strong>Catatan Simulasi:</strong> Ambang batas 6 jam adalah aturan simulasi latihan operasional Day 19, bukan Service Level Agreement (SLA) resmi Anteraja.
        </span>
      </div>
    </div>
  );
}
