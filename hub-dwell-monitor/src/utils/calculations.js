import { PRIORITY_THRESHOLD_HOURS } from './constants.js';

/**
 * Computes global weighted mean dwell time across hubs.
 * Formula: Σ(hub.meanDwellHours * hub.completedVisits) / Σ(hub.completedVisits)
 * 
 * Rules:
 * - Only completed visits count toward the dwell average.
 * - Open visits are strictly excluded and never included in the denominator or numerator.
 * - Handles empty array safely, returning 0 without NaN or crashes.
 *
 * @param {Array<Object>} hubs
 * @returns {number} Weighted mean in hours
 */
export function computeGlobalMeanDwell(hubs) {
  if (!Array.isArray(hubs) || hubs.length === 0) {
    return 0;
  }

  let totalWeightedDwell = 0;
  let totalCompletedVisits = 0;

  for (const hub of hubs) {
    const completed = typeof hub?.completedVisits === 'number' && !Number.isNaN(hub.completedVisits)
      ? hub.completedVisits
      : 0;
    const mean = typeof hub?.meanDwellHours === 'number' && !Number.isNaN(hub.meanDwellHours)
      ? hub.meanDwellHours
      : 0;

    if (completed > 0) {
      totalWeightedDwell += mean * completed;
      totalCompletedVisits += completed;
    }
  }

  if (totalCompletedVisits === 0) {
    return 0;
  }

  return Number((totalWeightedDwell / totalCompletedVisits).toFixed(4));
}

/**
 * Computes the total completed visits across all hubs.
 *
 * @param {Array<Object>} hubs
 * @returns {number}
 */
export function computeTotalCompletedVisits(hubs) {
  if (!Array.isArray(hubs)) return 0;
  return hubs.reduce((sum, h) => {
    const visits = typeof h?.completedVisits === 'number' && !Number.isNaN(h.completedVisits)
      ? h.completedVisits
      : 0;
    return sum + visits;
  }, 0);
}

/**
 * Ranks hubs by mean dwell time descending.
 * 
 * Rules:
 * - Sorts strictly on raw numeric values (meanDwellHours), NEVER on formatted strings.
 * - Ties are broken by hubId alphabetically for stable, predictable ordering.
 *
 * @param {Array<Object>} hubs
 * @returns {Array<Object>} Newly sorted array of hubs
 */
export function rankHubsByDwell(hubs) {
  if (!Array.isArray(hubs)) return [];

  return [...hubs].sort((a, b) => {
    const aVal = typeof a?.meanDwellHours === 'number' ? a.meanDwellHours : 0;
    const bVal = typeof b?.meanDwellHours === 'number' ? b.meanDwellHours : 0;

    if (bVal !== aVal) {
      return bVal - aVal;
    }

    const aId = String(a?.hubId || '');
    const bId = String(b?.hubId || '');
    return aId.localeCompare(bId);
  });
}

/**
 * Returns the Top 3 hubs with highest dwell time from all hubs.
 * Does NOT change when filters or search change.
 *
 * @param {Array<Object>} hubs
 * @returns {Array<Object>} Top 3 ranked hubs
 */
export function getTop3Hubs(hubs) {
  const ranked = rankHubsByDwell(hubs);
  return ranked.slice(0, 3);
}

/**
 * Evaluates binary priority status for a given dwell time.
 * Single rule: meanDwellHours >= PRIORITY_THRESHOLD_HOURS (default: 6 hours)
 *
 * @param {number} meanDwellHours
 * @param {number} threshold
 * @returns {boolean}
 */
export function isPriorityHub(meanDwellHours, threshold = PRIORITY_THRESHOLD_HOURS) {
  if (typeof meanDwellHours !== 'number' || Number.isNaN(meanDwellHours)) {
    return false;
  }
  return meanDwellHours >= threshold;
}

/**
 * Counts total priority hubs.
 *
 * @param {Array<Object>} hubs
 * @param {number} threshold
 * @returns {number}
 */
export function countPriorityHubs(hubs, threshold = PRIORITY_THRESHOLD_HOURS) {
  if (!Array.isArray(hubs)) return 0;
  return hubs.filter(h => isPriorityHub(h?.meanDwellHours, threshold)).length;
}

/**
 * Formats numeric dwell hours with specified unit.
 *
 * @param {number|null} hours
 * @param {string} unit - default 'jam'
 * @returns {string}
 */
export function formatDwell(hours, unit = 'hrs') {
  if (hours === null || hours === undefined || Number.isNaN(hours)) {
    return 'N/A';
  }
  return `${Number(hours).toFixed(2)} ${unit}`;
}

/**
 * Formats integers with thousands separator (id-ID locale)
 *
 * @param {number|null} count
 * @returns {string}
 */
export function formatNumber(count) {
  if (count === null || count === undefined || Number.isNaN(count)) {
    return 'N/A';
  }
  return Number(count).toLocaleString('id-ID');
}
