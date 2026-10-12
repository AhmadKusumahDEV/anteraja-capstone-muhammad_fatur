import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { formatDwell } from '../utils/calculations.js';

// Subcomponent to handle fitBounds, panTo, and invalidateSize
function MapController({ hubs, selectedHubId }) {
  const map = useMap();
  const prevHubCountRef = useRef(hubs.length);

  // Invalidate map size and fit bounds when visible hubs change
  useEffect(() => {
    map.invalidateSize();

    const validCoords = hubs
      .filter(h => typeof h.lat === 'number' && typeof h.lng === 'number')
      .map(h => [h.lat, h.lng]);

    if (validCoords.length > 0 && prevHubCountRef.current !== hubs.length) {
      map.fitBounds(validCoords, { padding: [30, 30], maxZoom: 8 });
      prevHubCountRef.current = hubs.length;
    }
  }, [hubs, map]);

  // Pan to selected hub when selected
  useEffect(() => {
    if (selectedHubId) {
      const selected = hubs.find(h => h.hubId === selectedHubId);
      if (selected && typeof selected.lat === 'number' && typeof selected.lng === 'number') {
        map.panTo([selected.lat, selected.lng], { animate: true, duration: 0.5 });
      }
    }
  }, [selectedHubId, hubs, map]);

  // Resize handler for responsive switches
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  return null;
}

export function HubMap({ hubs, selectedHubId, onSelectHub }) {
  // Default coordinates centered on Indonesia archipelago
  const defaultCenter = [-2.5489, 118.0149];
  const defaultZoom = 5;

  const validHubs = hubs.filter(
    h => typeof h.lat === 'number' && typeof h.lng === 'number'
  );

  return (
    <div className="card map-card">
      <div className="map-card-header">
        <div className="map-title">
          <span>🗺️</span>
          <span>Hub Map</span>
        </div>
        <span style={{ fontSize: '11px', color: '#6B7280' }}>
          {validHubs.length} mapped markers
        </span>
      </div>

      <div className="leaflet-map-wrapper">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController hubs={validHubs} selectedHubId={selectedHubId} />

          {validHubs.map(hub => {
            const isSelected = selectedHubId === hub.hubId;
            const isPriority = hub.isPriority;

            const color = isPriority ? '#E6007E' : '#4B5563';
            const fillColor = isPriority ? '#E6007E' : '#9CA3AF';
            const radius = isSelected ? 12 : (isPriority ? 9 : 7);
            const weight = isSelected ? 3 : 1.5;

            return (
              <CircleMarker
                key={hub.hubId}
                center={[hub.lat, hub.lng]}
                radius={radius}
                pathOptions={{
                  color: isSelected ? '#1B1464' : color,
                  fillColor: fillColor,
                  fillOpacity: isSelected ? 0.95 : 0.8,
                  weight: weight
                }}
                eventHandlers={{
                  click: () => onSelectHub(hub.hubId)
                }}
              >
                <Tooltip direction="top" offset={[0, -8]}>
                  <div style={{ fontWeight: 600 }}>{hub.name}</div>
                  <div style={{ fontSize: '11px' }}>
                    {formatDwell(hub.meanDwellHours, 'hrs')} {isPriority ? '• Priority' : ''}
                  </div>
                </Tooltip>

                <Popup>
                  <div style={{ padding: '4px', minWidth: '140px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1B1464', marginBottom: '2px' }}>
                      {hub.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px' }}>
                      ID: {hub.hubId}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: isPriority ? '#E6007E' : '#111827' }}>
                      Avg Dwell: {formatDwell(hub.meanDwellHours, 'hrs')}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                      Status: {isPriority ? 'Priority' : 'Normal'}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot priority" />
          <span>Priority (&ge; 6 hrs)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot normal" />
          <span>Normal (&lt; 6 hrs)</span>
        </div>
      </div>
    </div>
  );
}
