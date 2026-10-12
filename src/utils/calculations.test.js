import { describe, it, expect } from 'vitest';
import {
  computeGlobalMeanDwell,
  rankHubsByDwell,
  getTop3Hubs,
  isPriorityHub,
  countPriorityHubs,
  formatDwell,
  formatNumber
} from './calculations.js';

describe('Calculations - computeGlobalMeanDwell', () => {
  it('calculates weighted mean correctly, differing from unweighted mean-of-means', () => {
    // Hub A: 10 hrs with 100 visits
    // Hub B: 2 hrs with 900 visits
    // Weighted mean: (10*100 + 2*900) / 1000 = (1000 + 1800) / 1000 = 2.8 hrs
    // Unweighted mean of means would be (10 + 2)/2 = 6.0 hrs!
    const hubs = [
      { hubId: 'HUB_A', meanDwellHours: 10, completedVisits: 100 },
      { hubId: 'HUB_B', meanDwellHours: 2, completedVisits: 900 }
    ];

    const result = computeGlobalMeanDwell(hubs);
    expect(result).toBe(2.8);
    expect(result).not.toBe(6.0);
  });

  it('excludes open visits from the calculation and does not let them inflate visit counts', () => {
    const hubs = [
      {
        hubId: 'HUB_A',
        meanDwellHours: 8.0,
        completedVisits: 100,
        openVisits: 50 // open visits present
      },
      {
        hubId: 'HUB_B',
        meanDwellHours: 4.0,
        completedVisits: 100,
        openVisits: 200 // open visits present
      }
    ];

    // (8*100 + 4*100) / 200 = 1200 / 200 = 6.0 hrs
    // If open visits were included: (800 + 400) / (200 + 250) would be ~2.66
    const result = computeGlobalMeanDwell(hubs);
    expect(result).toBe(6.0);
  });

  it('returns 0 safely for empty or invalid hub lists without NaN', () => {
    expect(computeGlobalMeanDwell([])).toBe(0);
    expect(computeGlobalMeanDwell(null)).toBe(0);
    expect(computeGlobalMeanDwell([{ hubId: 'EMPTY', meanDwellHours: 0, completedVisits: 0 }])).toBe(0);
  });
});

describe('Calculations - rankHubsByDwell', () => {
  it('sorts strictly on numeric values, not formatted strings', () => {
    // In lexicographical string sort: "9.5 hrs" > "10.2 hrs" (because '9' > '1')
    // In numeric sort: 10.2 > 9.5
    const hubs = [
      { hubId: 'HUB_A', meanDwellHours: 9.5 },
      { hubId: 'HUB_B', meanDwellHours: 10.2 },
      { hubId: 'HUB_C', meanDwellHours: 2.1 }
    ];

    const ranked = rankHubsByDwell(hubs);
    expect(ranked[0].hubId).toBe('HUB_B'); // 10.2
    expect(ranked[1].hubId).toBe('HUB_A'); // 9.5
    expect(ranked[2].hubId).toBe('HUB_C'); // 2.1
  });

  it('breaks ties deterministically by hubId ascending', () => {
    const hubs = [
      { hubId: 'HUB_Z', meanDwellHours: 8.0 },
      { hubId: 'HUB_A', meanDwellHours: 8.0 },
      { hubId: 'HUB_M', meanDwellHours: 8.0 }
    ];

    const ranked = rankHubsByDwell(hubs);
    expect(ranked.map(h => h.hubId)).toEqual(['HUB_A', 'HUB_M', 'HUB_Z']);
  });
});

describe('Calculations - Priority Rule & Threshold Edge Cases', () => {
  it('evaluates threshold boundary at exactly 6.0 hours as priority (>= 6)', () => {
    expect(isPriorityHub(6.0)).toBe(true);
    expect(isPriorityHub(6.0001)).toBe(true);
    expect(isPriorityHub(5.9999)).toBe(false);
    expect(isPriorityHub(5.9)).toBe(false);
  });

  it('handles invalid or non-numeric inputs safely', () => {
    expect(isPriorityHub(null)).toBe(false);
    expect(isPriorityHub(undefined)).toBe(false);
    expect(isPriorityHub(NaN)).toBe(false);
    expect(isPriorityHub('6.0')).toBe(false);
  });

  it('counts priority hubs accurately', () => {
    const hubs = [
      { hubId: 'H1', meanDwellHours: 7.2 },
      { hubId: 'H2', meanDwellHours: 6.0 }, // exact boundary
      { hubId: 'H3', meanDwellHours: 5.9 },
      { hubId: 'H4', meanDwellHours: 4.1 }
    ];
    expect(countPriorityHubs(hubs)).toBe(2);
  });
});

describe('Calculations - getTop3Hubs', () => {
  it('returns exactly top 3 hubs by dwell time', () => {
    const hubs = [
      { hubId: 'H1', meanDwellHours: 4.0 },
      { hubId: 'H2', meanDwellHours: 11.5 },
      { hubId: 'H3', meanDwellHours: 8.2 },
      { hubId: 'H4', meanDwellHours: 9.7 },
      { hubId: 'H5', meanDwellHours: 6.1 }
    ];
    const top3 = getTop3Hubs(hubs);
    expect(top3.length).toBe(3);
    expect(top3.map(h => h.hubId)).toEqual(['H2', 'H4', 'H3']);
  });
});

describe('Calculations - Formatters', () => {
  it('formats dwell time with unit', () => {
    expect(formatDwell(6.852)).toBe('6.85 hrs');
    expect(formatDwell(6.852, 'jam')).toBe('6.85 jam');
    expect(formatDwell(null)).toBe('N/A');
  });

  it('formats number with thousands separator', () => {
    expect(formatNumber(14820)).toContain('14');
    expect(formatNumber(null)).toBe('N/A');
  });
});
