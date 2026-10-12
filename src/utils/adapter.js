import { PRIORITY_THRESHOLD_HOURS } from './constants.js';

/**
 * Adapter function that maps raw metric and location records to the internal hub shape.
 * Keeps raw field names insulated from the rest of the application.
 *
 * Internal hub shape:
 * {
 *   hubId: string,
 *   name: string,
 *   lat: number | null,
 *   lng: number | null,
 *   meanDwellHours: number,
 *   minDwellHours: number | null,
 *   maxDwellHours: number | null,
 *   completedVisits: number,
 *   openVisits: number | null,
 *   isPriority: boolean
 * }
 */
export function adaptHubRecord(metricRecord, locationRecord) {
  const hubId = metricRecord?.hub_id || locationRecord?.hub_id || '';
  const name = locationRecord?.hub_name || hubId;

  const lat = typeof locationRecord?.lat === 'number' && !Number.isNaN(locationRecord.lat)
    ? locationRecord.lat
    : null;
  const lng = typeof locationRecord?.lng === 'number' && !Number.isNaN(locationRecord.lng)
    ? locationRecord.lng
    : null;

  const meanDwellHours = typeof metricRecord?.mean_dwell_hours === 'number' && !Number.isNaN(metricRecord.mean_dwell_hours)
    ? metricRecord.mean_dwell_hours
    : 0;

  const minDwellHours = typeof metricRecord?.min_dwell_hours === 'number' && !Number.isNaN(metricRecord.min_dwell_hours)
    ? metricRecord.min_dwell_hours
    : null;

  const maxDwellHours = typeof metricRecord?.max_dwell_hours === 'number' && !Number.isNaN(metricRecord.max_dwell_hours)
    ? metricRecord.max_dwell_hours
    : null;

  const completedVisits = typeof metricRecord?.completed_visits === 'number' && !Number.isNaN(metricRecord.completed_visits)
    ? metricRecord.completed_visits
    : 0;

  // open_visits is missing per-hub in the raw dataset, keeping null so UI renders 'N/A'
  const openVisits = typeof metricRecord?.open_visits === 'number' && !Number.isNaN(metricRecord.open_visits)
    ? metricRecord.open_visits
    : null;

  // Binary rule: meanDwellHours >= PRIORITY_THRESHOLD_HOURS (practice rule, not official SLA)
  const isPriority = meanDwellHours >= PRIORITY_THRESHOLD_HOURS;

  return {
    hubId,
    name,
    lat,
    lng,
    meanDwellHours,
    minDwellHours,
    maxDwellHours,
    completedVisits,
    openVisits,
    isPriority
  };
}

/**
 * Joins metrics and locations by hub_id and maps all items through the adapter.
 *
 * @param {Object} metricsData - parsed metrics.json
 * @param {Object} locationsData - parsed locations.json
 * @returns {Array<Object>} List of internal hub objects
 */
export function joinAndAdaptHubs(metricsData, locationsData) {
  const rawMetricsHubs = Array.isArray(metricsData?.hubs) ? metricsData.hubs : [];
  const rawLocationsHubs = Array.isArray(locationsData?.hubs) ? locationsData.hubs : [];

  // Map locations by hub_id
  const locationMap = new Map();
  rawLocationsHubs.forEach(loc => {
    if (loc?.hub_id) {
      locationMap.set(loc.hub_id, loc);
    }
  });

  const hubs = rawMetricsHubs.map(metric => {
    const loc = locationMap.get(metric.hub_id);
    return adaptHubRecord(metric, loc);
  });

  return hubs;
}
