'use client';

import { SOURCE_COLOR_MAP } from '../lib/constants';
import { calculateClusterPosition, calculateArticleTickPosition } from '../lib/timelineMath';

export default function ClusterRow({
  cluster,
  activeSources,
  windowStart,
  windowEnd,
  width = 800,
  isSelected = false,
  onSelectCluster
}) {
  const pos = calculateClusterPosition(cluster, activeSources, windowStart, windowEnd, width);
  const { startX, barWidth, visibleCount, totalCount, visibleArticles } = pos;

  const isDimmed = !isSelected && visibleCount === 0;

  // Format time range from visible articles or cluster times
  const formatTimeRange = () => {
    if (visibleArticles.length > 0) {
      const times = visibleArticles.map(a => new Date(a.publishedAt).getTime()).filter(t => !isNaN(t));
      if (times.length > 0) {
        const earliest = new Date(Math.min(...times));
        const latest = new Date(Math.max(...times));
        const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${fmt(earliest)} – ${fmt(latest)}`;
      }
    }
    const start = new Date(cluster.startTime);
    const end = new Date(cluster.endTime);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${fmt(start)} – ${fmt(end)}`;
    }
    return '';
  };

  const timeRange = formatTimeRange();

  return (
    <div
      onClick={() => onSelectCluster(cluster.id)}
      role="button"
      tabIndex={0}
      aria-label={`${cluster.label} — ${visibleCount} articles`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectCluster(cluster.id); } }}
      className={`group relative flex items-center border-b border-border-secondary hover:bg-bg-hover transition-all duration-150 cursor-pointer select-none py-3.5 px-2 ${
        isSelected ? 'bg-bg-selected' : ''
      } ${isDimmed ? 'opacity-35' : 'opacity-100'}`}
    >
      {/* Left Column: Cluster Details */}
      <div className="w-64 sm:w-72 md:w-80 shrink-0 pr-4 flex flex-col justify-center">
        {/* Cluster headline */}
        <h3 className={`text-sm font-semibold tracking-tight leading-snug line-clamp-2 transition-colors ${
          isSelected ? 'text-text-primary' : 'text-text-primary group-hover:text-accent-red'
        }`}>
          {cluster.label}
        </h3>

        {/* Meta row: source dots + article count + time range */}
        <div className="flex items-center gap-2 mt-1.5">
          {/* Source color dots */}
          <div className="flex items-center gap-0.5">
            {(cluster.sources || []).map(src => (
              <span
                key={src}
                className={`w-2 h-2 rounded-full transition-opacity ${activeSources.has(src) ? 'opacity-100' : 'opacity-25'}`}
                style={{ backgroundColor: SOURCE_COLOR_MAP[src] || '#9CA3AF' }}
                title={src}
              />
            ))}
          </div>

          {/* Article count */}
          <span className="text-[11px] text-text-muted">
            {visibleCount} {visibleCount === 1 ? 'article' : 'articles'}
          </span>

          {/* Separator */}
          <span className="text-[10px] text-text-muted">·</span>

          {/* Time range */}
          {timeRange && (
            <span className="text-[11px] text-text-muted">{timeRange}</span>
          )}

          {/* LIVE tag */}
          {cluster.isLive && (
            <>
              <span className="text-[10px] text-text-muted">·</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-red uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
                LIVE
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Column: SVG Timeline Bar */}
      <div className="flex-1 relative h-10 flex items-center overflow-hidden">
        {visibleCount > 0 ? (
          <svg width={width} height="32" className="overflow-visible">
            {/* Cluster bar background */}
            <rect
              x={startX}
              y="4"
              width={barWidth}
              height="24"
              rx="4"
              fill={isSelected ? '#E5E7EB' : '#EEF0F3'}
              stroke={isSelected ? '#9CA3AF' : '#D1D5DB'}
              strokeWidth="1"
              className="transition-all duration-200"
            />

            {/* Article Tick Marks */}
            {visibleArticles.map((article, idx) => {
              const tickX = calculateArticleTickPosition(article.publishedAt, windowStart, windowEnd, width);
              const color = SOURCE_COLOR_MAP[article.source] || '#9CA3AF';

              return (
                <line
                  key={`${article.id || idx}-${tickX}`}
                  x1={tickX}
                  y1="7"
                  x2={tickX}
                  y2="25"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-150"
                  opacity="0.8"
                />
              );
            })}

            {/* Left Edge: Article Count Badge */}
            <g transform={`translate(${startX + 4}, 8)`}>
              <rect x="0" y="0" width="20" height="16" rx="3" fill="#374151" fillOpacity="0.9" />
              <text x="10" y="11.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="var(--font-sans)">
                {visibleCount}
              </text>
            </g>

            {/* LIVE red edge indicator */}
            {cluster.isLive && (
              <line
                x1={startX + barWidth}
                y1="4"
                x2={startX + barWidth}
                y2="28"
                stroke="#DC2626"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}
          </svg>
        ) : (
          /* Filtered Out Row */
          <div className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-muted">
            <span className="border border-dashed border-border-primary rounded-lg px-3 py-1">
              0 of {totalCount} articles visible · hidden by source filter
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
