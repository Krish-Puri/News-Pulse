import { MOCK_TIMELINE_DATA, MOCK_CLUSTER_DETAILS } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const USE_MOCK_FALLBACK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || false;

/**
 * Fetch GET /timeline data.
 */
export async function fetchTimeline(timeWindow = '24h') {
  if (USE_MOCK_FALLBACK) {
    return MOCK_TIMELINE_DATA;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/timeline?window=${timeWindow}`);
    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend API unavailable, using realistic mock data fallback:', err.message);
    return MOCK_TIMELINE_DATA;
  }
}

/**
 * Fetch GET /clusters/:id data.
 */
export async function fetchClusterDetail(clusterId) {
  if (!clusterId) return null;

  if (USE_MOCK_FALLBACK) {
    return MOCK_CLUSTER_DETAILS[clusterId] || MOCK_CLUSTER_DETAILS[1];
  }

  try {
    const res = await fetch(`${API_BASE_URL}/clusters/${clusterId}`);
    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Backend API unavailable for cluster ${clusterId}, using mock data fallback:`, err.message);
    return MOCK_CLUSTER_DETAILS[clusterId] || MOCK_CLUSTER_DETAILS[1];
  }
}

/**
 * Trigger POST /ingest/trigger.
 */
export async function triggerIngestion() {
  const res = await fetch(`${API_BASE_URL}/ingest/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await res.json();
  if (res.status === 409) {
    return { ...data, isConflict: true };
  }
  if (!res.ok) {
    throw new Error(data.error || `Ingestion trigger failed with status ${res.status}`);
  }
  return data;
}

/**
 * Fetch GET /ingest/status/:jobId.
 */
export async function fetchIngestionStatus(jobId) {
  if (!jobId) return null;
  const res = await fetch(`${API_BASE_URL}/ingest/status/${jobId}`);
  if (!res.ok) {
    throw new Error(`Ingestion status check failed with status ${res.status}`);
  }
  return await res.json();
}
