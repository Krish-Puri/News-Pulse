/**
 * Pure temporal & spatial math utilities for timeline rendering.
 */

/**
 * Maps a date string/timestamp to an X coordinate (0 to width).
 */
export function timeToX(timeStr, windowStartStr, windowEndStr, width) {
  const t = new Date(timeStr).getTime();
  const start = new Date(windowStartStr).getTime();
  const end = new Date(windowEndStr).getTime();
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
  
  // Filter articles by active sources if activeSources Set is provided
  const visibleArticles = activeSources && activeSources.size > 0
    ? allArticles.filter(a => activeSources.has(a.source))
    : allArticles;
    
  if (visibleArticles.length === 0) {
    // If no articles visible, fallback to cluster default bounds with 0 visible count
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
