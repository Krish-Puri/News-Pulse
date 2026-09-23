/**
 * API Client for News Pulse.
 * Mock data fallback is DEVELOPMENT-ONLY — in production, errors propagate to the UI.
 */

import { MOCK_TIMELINE_DATA, MOCK_CLUSTER_DETAILS } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Fetch GET /timeline data.
 */
export async function fetchTimeline(timeWindow = '24h') {
  try {
    const res = await fetch(`${API_BASE_URL}/timeline?window=${timeWindow}`);
    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // In development only, fall back to mock data so the UI is still usable
    if (IS_DEV) {
      console.warn('Backend API unavailable in dev, using mock data fallback:', err.message);
      return MOCK_TIMELINE_DATA;
    }
    // In production, let the error propagate to TanStack Query → ErrorState
    throw err;
  }
}

/**
 * Fetch GET /clusters/:id data.
 */
export async function fetchClusterDetail(clusterId) {
  if (!clusterId) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/clusters/${clusterId}`);
    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (IS_DEV) {
      console.warn(`Backend API unavailable for cluster ${clusterId}, using mock data fallback:`, err.message);
      return MOCK_CLUSTER_DETAILS[clusterId] || MOCK_CLUSTER_DETAILS[1];
    }
    throw err;
  }
}

/**
 * Trigger POST /ingest/trigger.
 * Handles network failures cleanly and attaches to existing job if 409 Conflict.
 */
export async function triggerIngestion() {
  try {
    const res = await fetch(`${API_BASE_URL}/ingest/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 409) {
      return {
        jobId: data.existingJobId,
        status: data.status || 'running',
        isConflict: true,
        message: data.error || 'An ingestion job is already in progress'
      };
    }

    if (!res.ok) {
      throw new Error(data.error || `Ingestion trigger failed with HTTP ${res.status}`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' || err.message.includes('fetch')) {
      throw new Error(`Unable to connect to News Pulse API at ${API_BASE_URL}. Please ensure the Node backend service is running.`);
    }
    throw err;
  }
}

/**
 * Fetch GET /ingest/status/:jobId.
 */
export async function fetchIngestionStatus(jobId) {
  if (!jobId) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/ingest/status/${jobId}`);
    if (!res.ok) {
      throw new Error(`Ingestion status check failed with HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' || err.message.includes('fetch')) {
      throw new Error(`Unable to connect to News Pulse API at ${API_BASE_URL}.`);
    }
    throw err;
  }
}
