'use client';

import { SOURCE_COLOR_MAP } from '../lib/constants';
import { calculateClusterPosition } from '../lib/timelineMath';

export default function MobileTimeline({
  clusters = [],
  activeSources,
  windowStart,
  windowEnd,
  selectedClusterId,
  onSelectCluster,
  sortBy = 'longest'
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          Topics
        </span>
        <span className="text-xs text-text-muted">
          {sortBy === 'longest' ? 'Longest active ↓' : 'Most recent ↓'}
        </span>
      </div>

      {/* Topic Cards */}
      {clusters.map(cluster => (
        <MobileTopicCard
          key={cluster.id}
          cluster={cluster}
          activeSources={activeSources}
          windowStart={windowStart}
          windowEnd={windowEnd}
          isSelected={selectedClusterId === cluster.id}
          onSelect={() => onSelectCluster(cluster.id)}
        />
      ))}

      {clusters.length === 0 && (
        <div className="text-center text-sm text-text-muted py-8">
          No topics available.
        </div>
      )}
    </div>
  );
}

function MobileTopicCard({
  cluster,
  activeSources,
  windowStart,
  windowEnd,
  isSelected,
  onSelect
}) {
  const pos = calculateClusterPosition(cluster, activeSources, windowStart, windowEnd, 280);
  const { visibleCount, totalCount, visibleArticles } = pos;
  const isDimmed = visibleCount === 0;

  // Format time range
  const fmt = (d) => {
    const date = new Date(d);
    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const timeRange = `${fmt(cluster.startTime)} – ${fmt(cluster.endTime)}`;

  // Mini bar positions (normalized 0-100%)
  const miniBarTicks = (() => {
    if (visibleArticles.length === 0) return [];
    const start = new Date(windowStart).getTime();
    const end = new Date(windowEnd).getTime();
    const range = end - start;
    if (range <= 0) return [];
    return visibleArticles.map(a => {
      const t = new Date(a.publishedAt).getTime();
      return {
        pct: Math.max(0, Math.min(100, ((t - start) / range) * 100)),
        source: a.source
      };
    });
  })();

  // Cluster bar extent (for the background bar)
  const barStart = (() => {
    const start = new Date(windowStart).getTime();
    const end = new Date(windowEnd).getTime();
    const range = end - start;
    if (range <= 0) return 0;
    const cs = new Date(cluster.startTime).getTime();
    return Math.max(0, Math.min(100, ((cs - start) / range) * 100));
  })();
  const barEnd = (() => {
    const start = new Date(windowStart).getTime();
    const end = new Date(windowEnd).getTime();
    const range = end - start;
    if (range <= 0) return 100;
    const ce = new Date(cluster.endTime).getTime();
    return Math.max(0, Math.min(100, ((ce - start) / range) * 100));
  })();

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left bg-bg-primary border rounded-xl p-4 transition-all ${
        isSelected
          ? 'border-text-primary shadow-sm'
          : 'border-border-primary hover:border-border-active'
      } ${isDimmed ? 'opacity-40' : ''}`}
    >
      {/* Header row: label + article count */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 flex-1">
          {cluster.label}
        </h3>
        <div className="shrink-0 text-right">
          <span className="text-lg font-bold text-text-primary">{visibleCount}</span>
          <span className="text-[10px] text-text-muted block">articles</span>
        </div>
      </div>

      {/* Meta row: source dots + time range + LIVE */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-0.5">
          {(cluster.sources || []).map(src => (
            <span
              key={src}
              className={`w-2 h-2 rounded-full ${activeSources.has(src) ? 'opacity-100' : 'opacity-25'}`}
              style={{ backgroundColor: SOURCE_COLOR_MAP[src] || '#9CA3AF' }}
            />
          ))}
        </div>
        <span className="text-[11px] text-text-muted">{timeRange}</span>
        {cluster.isLive && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-red uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* Mini Timeline Bar */}
      {visibleCount > 0 && (
        <div className="relative h-3 bg-bg-tertiary rounded-full overflow-hidden">
          {/* Cluster extent bar */}
          <div
            className="absolute top-0 bottom-0 bg-gray-200 rounded-full"
            style={{ left: `${barStart}%`, width: `${Math.max(2, barEnd - barStart)}%` }}
          />
          {/* Article ticks */}
          {miniBarTicks.map((tick, i) => (
            <div
              key={i}
              className="absolute top-0.5 bottom-0.5 w-[3px] rounded-full"
              style={{
                left: `${tick.pct}%`,
                backgroundColor: SOURCE_COLOR_MAP[tick.source] || '#9CA3AF'
              }}
            />
          ))}
        </div>
      )}

      {isDimmed && (
        <div className="text-[10px] text-text-muted mt-1">
          Hidden by source filter
        </div>
      )}
    </button>
  );
}
