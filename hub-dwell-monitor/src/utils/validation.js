/**
 * Data validation function for Hub Dwell Monitor.
 * Reports consistency issues, duplicates, missing coordinates, and invalid values.
 * Logs all warnings to the console and returns a list of warning messages.
 *
 * @param {Object} metricsData - Raw data from metrics.json
 * @param {Object} locationsData - Raw data from locations.json
 * @returns {Array<string>} List of human-readable warning messages
 */
export function validateHubData(metricsData, locationsData) {
  const warnings = [];

  const rawMetricsHubs = Array.isArray(metricsData?.hubs) ? metricsData.hubs : [];
  const rawLocationsHubs = Array.isArray(locationsData?.hubs) ? locationsData.hubs : [];

  const metricsIds = rawMetricsHubs.map(h => h?.hub_id).filter(Boolean);
  const locationsIds = rawLocationsHubs.map(h => h?.hub_id).filter(Boolean);

  // 1. Check duplicate IDs
  const seenMetricsIds = new Set();
  const dupMetricsIds = new Set();
  metricsIds.forEach(id => {
    if (seenMetricsIds.has(id)) dupMetricsIds.add(id);
    seenMetricsIds.add(id);
  });
  if (dupMetricsIds.size > 0) {
    const msg = `Duplicate hub_id found in metrics.json: ${Array.from(dupMetricsIds).join(', ')}`;
    warnings.push(msg);
  }

  const seenLocationIds = new Set();
  const dupLocationIds = new Set();
  locationsIds.forEach(id => {
    if (seenLocationIds.has(id)) dupLocationIds.add(id);
    seenLocationIds.add(id);
  });
  if (dupLocationIds.size > 0) {
    const msg = `Duplicate hub_id found in locations.json: ${Array.from(dupLocationIds).join(', ')}`;
    warnings.push(msg);
  }

  // 2. Check mismatched IDs between files
  const inLocNotMet = locationsIds.filter(id => !seenMetricsIds.has(id));
  if (inLocNotMet.length > 0) {
    const msg = `Hub IDs present in locations.json but missing from metrics.json: ${inLocNotMet.join(', ')}`;
    warnings.push(msg);
  }

  const inMetNotLoc = metricsIds.filter(id => !seenLocationIds.has(id));
  if (inMetNotLoc.length > 0) {
    const msg = `Hub IDs present in metrics.json but missing from locations.json: ${inMetNotLoc.join(', ')}`;
    warnings.push(msg);
  }

  // 3. Check coordinates in locations
  rawLocationsHubs.forEach(h => {
    const id = h?.hub_id || 'unknown';
    const hasValidLat = typeof h?.lat === 'number' && !Number.isNaN(h.lat);
    const hasValidLng = typeof h?.lng === 'number' && !Number.isNaN(h.lng);
    if (!hasValidLat || !hasValidLng) {
      const msg = `Hub ${id} has missing or non-numeric coordinates (lat: ${h?.lat}, lng: ${h?.lng}). Marker will be omitted.`;
      warnings.push(msg);
    }
  });

  // 4. Check dwell and visit values in metrics
  rawMetricsHubs.forEach(h => {
    const id = h?.hub_id || 'unknown';
    if (typeof h?.mean_dwell_hours !== 'number' || Number.isNaN(h.mean_dwell_hours)) {
      warnings.push(`Hub ${id} has missing or non-numeric mean_dwell_hours: ${h?.mean_dwell_hours}`);
    }
    if (typeof h?.min_dwell_hours !== 'number' || Number.isNaN(h.min_dwell_hours)) {
      warnings.push(`Hub ${id} has missing or non-numeric min_dwell_hours: ${h?.min_dwell_hours}`);
    }
    if (typeof h?.max_dwell_hours !== 'number' || Number.isNaN(h.max_dwell_hours)) {
      warnings.push(`Hub ${id} has missing or non-numeric max_dwell_hours: ${h?.max_dwell_hours}`);
    }
    if (typeof h?.completed_visits !== 'number' || Number.isNaN(h.completed_visits)) {
      warnings.push(`Hub ${id} has missing or non-numeric completed_visits: ${h?.completed_visits}`);
    } else if (h.completed_visits === 0) {
      warnings.push(`Hub ${id} has 0 completed_visits`);
    }
  });

  // Log all warnings to console
  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`[HubData Validation Warning] ${w}`));
  }

  return warnings;
}
