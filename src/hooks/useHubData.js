import { useState, useEffect, useCallback } from 'react';
import { validateHubData } from '../utils/validation.js';
import { joinAndAdaptHubs } from '../utils/adapter.js';

const FETCH_TIMEOUT_MS = 10000;

/**
 * Custom hook to load metrics.json and locations.json together,
 * and ai-summary.json independently.
 *
 * Implements:
 * - Response.ok verification
 * - JSON parse error handling
 * - AbortController timeout handling
 * - Status: 'loading' | 'error' | 'ready'
 * - Retry capability
 * - import.meta.env.BASE_URL resolution
 */
export function useHubData() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'ready'
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [fileStatuses, setFileStatuses] = useState({
    metrics: 'pending',
    locations: 'pending',
    aiSummary: 'pending'
  });
  const [fetchIndex, setFetchIndex] = useState(0);

  const retry = useCallback(() => {
    setStatus('loading');
    setError(null);
    setFetchIndex(prev => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let isCancelled = false;

    async function loadData() {
      setStatus('loading');
      setError(null);

      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

      const currentFileStatuses = {
        metrics: 'loading',
        locations: 'loading',
        aiSummary: 'loading'
      };
      setFileStatuses({ ...currentFileStatuses });

      try {
        // 1. Fetch metrics.json and locations.json together
        const [metricsRes, locationsRes] = await Promise.all([
          fetch(`${cleanBase}data/metrics.json`, { signal: controller.signal }),
          fetch(`${cleanBase}data/locations.json`, { signal: controller.signal })
        ]);

        if (!metricsRes.ok) {
          currentFileStatuses.metrics = 'error';
          throw new Error(`Failed to load metrics.json (HTTP ${metricsRes.status} ${metricsRes.statusText})`);
        }
        currentFileStatuses.metrics = 'loaded';

        if (!locationsRes.ok) {
          currentFileStatuses.locations = 'error';
          throw new Error(`Failed to load locations.json (HTTP ${locationsRes.status} ${locationsRes.statusText})`);
        }
        currentFileStatuses.locations = 'loaded';

        let metricsData;
        try {
          metricsData = await metricsRes.json();
        } catch (jsonErr) {
          currentFileStatuses.metrics = 'invalid_json';
          throw new Error(`Invalid JSON in metrics.json: ${jsonErr.message}`);
        }

        let locationsData;
        try {
          locationsData = await locationsRes.json();
        } catch (jsonErr) {
          currentFileStatuses.locations = 'invalid_json';
          throw new Error(`Invalid JSON in locations.json: ${jsonErr.message}`);
        }

        // 2. Fetch ai-summary.json independently
        let aiSummaryData = { summary: '', priority_hubs: [], next_checks: [] };
        let aiSummaryError = null;

        try {
          const aiRes = await fetch(`${cleanBase}data/ai-summary.json`, { signal: controller.signal });
          if (!aiRes.ok) {
            currentFileStatuses.aiSummary = 'not_found';
            aiSummaryError = `ai-summary.json returned HTTP ${aiRes.status}`;
          } else {
            const rawAi = await aiRes.json();
            aiSummaryData = {
              summary: typeof rawAi?.summary === 'string' ? rawAi.summary : '',
              priority_hubs: Array.isArray(rawAi?.priority_hubs) ? rawAi.priority_hubs : [],
              next_checks: Array.isArray(rawAi?.next_checks) ? rawAi.next_checks : [],
              ...rawAi
            };
            currentFileStatuses.aiSummary = 'loaded';
          }
        } catch (aiErr) {
          currentFileStatuses.aiSummary = 'error';
          aiSummaryError = aiErr.message;
        }

        if (isCancelled) return;

        // 3. Validation and Adaptation
        const validationWarnings = validateHubData(metricsData, locationsData);
        const hubs = joinAndAdaptHubs(metricsData, locationsData);

        setFileStatuses(currentFileStatuses);
        setData({
          hubs,
          metrics: metricsData,
          locations: locationsData,
          aiSummary: aiSummaryData,
          aiSummaryError,
          validationWarnings
        });
        setStatus('ready');
      } catch (err) {
        if (isCancelled) return;

        const isAbort = err.name === 'AbortError';
        const errorMessage = isAbort
          ? `Request timed out after ${FETCH_TIMEOUT_MS / 1000}s while fetching hub data.`
          : err.message || 'Unknown network error loading data files';

        setError(errorMessage);
        setStatus('error');
        setFileStatuses(prev => ({
          ...prev,
          metrics: prev.metrics === 'loaded' ? 'loaded' : 'error',
          locations: prev.locations === 'loaded' ? 'loaded' : 'error'
        }));
      } finally {
        clearTimeout(timeoutId);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchIndex]);

  return {
    status,
    data,
    error,
    fileStatuses,
    retry
  };
}
