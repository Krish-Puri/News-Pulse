/**
 * Pure temporal & spatial math utilities for timeline rendering.
 * All functions are deterministic, stateless, and testable.
 */

/**
 * Maps a date string/timestamp to an X coordinate (0 to width).
 */
export function timeToX(timeStr, windowStartStr, windowEndStr, width) {
  const t = typeof timeStr === 'number' ? timeStr : new Date(timeStr).getTime();
  const start = typeof windowStartStr === 'number' ? windowStartStr : new Date(windowStartStr).getTime();
  const end = typeof windowEndStr === 'number' ? windowEndStr : new Date(windowEndStr).getTime();
  if (end <= start || isNaN(t) || isNaN(start) || isNaN(end)) return 0;

  const ratio = Math.max(0, Math.min(1, (t - start) / (end - start)));
  return ratio * width;
}

/**
 * Maps an X coordinate back to a Date object.
 */
export function xToTime(x, windowStartStr, windowEndStr, width) {
  const start = new Date(windowStartStr).getTime();
  const end = new Date(windowEndStr).getTime();
  if (width <= 0) return new Date(start);

  const ratio = Math.max(0, Math.min(1, x / width));
  return new Date(start + ratio * (end - start));
}

/**
 * Calculates visual cluster position & duration based ONLY on active (visible) articles.
 * Dynamic Source Filtering Rule:
 * When sources are disabled, visual startX and width recompute from remaining visible articles.
 */
export function calculateClusterPosition(cluster, activeSources, windowStartStr, windowEndStr, width) {
  const allArticles = cluster.articles || [];

  // Filter articles by active sources
  const visibleArticles = activeSources && activeSources.size > 0
    ? allArticles.filter(a => activeSources.has(a.source))
    : allArticles;

  if (visibleArticles.length === 0) {
    const startX = timeToX(cluster.startTime, windowStartStr, windowEndStr, width);
    const endX = timeToX(cluster.endTime, windowStartStr, windowEndStr, width);
    return {
      startX,
      endX,
      barWidth: Math.max(8, endX - startX),
      visibleCount: 0,
      totalCount: allArticles.length,
      visibleArticles: []
    };
  }

  // Find min and max publishedAt among VISIBLE articles
  const times = visibleArticles.map(a => new Date(a.publishedAt).getTime()).filter(t => !isNaN(t));

  const minTime = times.length > 0 ? Math.min(...times) : new Date(cluster.startTime).getTime();
  const maxTime = times.length > 0 ? Math.max(...times) : new Date(cluster.endTime).getTime();

  const startX = timeToX(minTime, windowStartStr, windowEndStr, width);
  const endX = timeToX(maxTime, windowStartStr, windowEndStr, width);
  const barWidth = Math.max(8, endX - startX);

  return {
    startX,
    endX,
    barWidth,
    visibleCount: visibleArticles.length,
    totalCount: allArticles.length,
    visibleArticles
  };
}

/**
 * Calculates tick mark X position for an article inside a cluster bar.
 */
export function calculateArticleTickPosition(publishedAt, windowStartStr, windowEndStr, width) {
  return timeToX(publishedAt, windowStartStr, windowEndStr, width);
}

/**
 * Generates array of hourly tick objects for the time axis header.
 */
export function generateHourlyTicks(windowStartStr, windowEndStr, width) {
  const start = new Date(windowStartStr);
  const end = new Date(windowEndStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

  // Align start to the beginning of the hour
  const current = new Date(start);
  current.setMinutes(0, 0, 0);

  const ticks = [];
  while (current <= end) {
    if (current >= start) {
      const x = timeToX(current, windowStartStr, windowEndStr, width);
      const hours = current.getHours().toString().padStart(2, '0');
      const label = `${hours}:00`;
      ticks.push({ time: new Date(current), label, x });
    }
    current.setHours(current.getHours() + 1);
  }

  return ticks;
}

/**
 * Builds coverage histogram data from clusters + active sources.
 * Returns array of { hour: ISO string, count: number } bucketed by hour.
 */
export function buildCoverageData(clusters, activeSources, windowStartStr, windowEndStr) {
  const start = new Date(windowStartStr);
  const end = new Date(windowEndStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

  // Create hourly buckets
  const buckets = new Map();
  const cursor = new Date(start);
  cursor.setMinutes(0, 0, 0);

  while (cursor <= end) {
    if (cursor >= start) {
      buckets.set(cursor.toISOString(), 0);
    }
    cursor.setHours(cursor.getHours() + 1);
  }

  // Count visible articles per hourly bucket
  for (const cluster of clusters) {
    const articles = cluster.articles || [];
    for (const article of articles) {
      if (activeSources && activeSources.size > 0 && !activeSources.has(article.source)) {
        continue;
      }
      const t = new Date(article.publishedAt);
      if (isNaN(t.getTime())) continue;

      // Floor to hour
      const hourKey = new Date(t);
      hourKey.setMinutes(0, 0, 0);
      const key = hourKey.toISOString();

      if (buckets.has(key)) {
        buckets.set(key, buckets.get(key) + 1);
      }
    }
  }

  return Array.from(buckets.entries()).map(([hour, count]) => ({ hour, count }));
}

/**
 * Format a duration in milliseconds to "Xh Ym" string.
 */
export function formatDuration(ms) {
  if (!ms || ms <= 0) return '0m';
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
