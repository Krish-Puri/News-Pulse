'use client';

import { SOURCES, SOURCE_COLOR_MAP } from '../lib/constants';
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

  return (
    <div
      onClick={() => onSelectCluster(cluster.id)}
      className={`group relative flex items-center border-b border-gray-850 hover:bg-gray-900/60 transition-all duration-150 cursor-pointer select-none py-3 px-2 ${
        isSelected ? 'bg-gray-900/90 border-l-4 border-l-red-500 shadow-md' : ''
      } ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
    >
      {/* Left Column: Cluster Details (Label, Sources, Count) */}
      <div className="w-64 sm:w-72 md:w-80 shrink-0 pr-4 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          {/* Source Color Dots */}
          <div className="flex items-center gap-1">
            {cluster.sources.map(src => (
              <span
                key={src}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: SOURCE_COLOR_MAP[src] || '#9CA3AF' }}
                title={src}
              />
            ))}
          </div>

          {/* Article Count Badge */}
          <span className="text-[11px] font-medium text-gray-400">
            {visibleCount} {visibleCount === 1 ? 'article' : 'articles'}
            {visibleCount < totalCount && (
              <span className="text-gray-500 font-normal"> ({totalCount} total)</span>
            )}
          </span>

          {/* LIVE Tag */}
          {cluster.isLive && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
              LIVE
            </span>
          )}
        </div>

        {/* Cluster Title Headline */}
        <h3 className={`text-sm font-semibold tracking-tight line-clamp-2 transition-colors ${
          isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
        }`}>
          {cluster.label}
        </h3>
      </div>

      {/* Right Column: Custom SVG Timeline Bar */}
      <div className="flex-1 relative h-10 flex items-center overflow-hidden">
        {visibleCount > 0 ? (
          <svg width={width} height="32" className="overflow-visible">
            {/* Extended Coverage Background Area */}
            <rect
              x={startX}
              y="4"
              width={barWidth}
              height="24"
              rx="6"
              className={`transition-all duration-200 ${
                isSelected ? 'fill-red-950/40 stroke-red-500/50' : 'fill-gray-800/80 stroke-gray-700/60'
              }`}
              strokeWidth="1"
            />

            {/* Main Bar Fill */}
            <rect
              x={startX}
              y="4"
              width={barWidth}
              height="24"
              rx="6"
              fill="currentColor"
              className={`${isSelected ? 'text-gray-700' : 'text-gray-800'}`}
            />

            {/* Article Tick Marks (Data-driven Positioning) */}
            {visibleArticles.map((article, idx) => {
              const tickX = calculateArticleTickPosition(article.publishedAt, windowStart, windowEnd, width);
              const color = SOURCE_COLOR_MAP[article.source] || '#9CA3AF';

              return (
                <line
                  key={`${article.id || idx}-${tickX}`}
                  x1={tickX}
                  y1="6"
                  x2={tickX}
                  y2="26"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-150"
                />
              );
            })}

            {/* Left Edge Badge: Article Count */}
            <g transform={`translate(${startX + 6}, 11)`}>
              <rect x="0" y="0" width="18" height="14" rx="3" fill="#111827" fillOpacity="0.8" />
              <text x="9" y="10.5" textAnchor="middle" fill="#F9FAFB" fontSize="10" fontWeight="bold">
                {visibleCount}
              </text>
            </g>

            {/* LIVE Red Edge Indicator */}
            {cluster.isLive && (
              <line
                x1={startX + barWidth}
                y1="4"
                x2={startX + barWidth}
                y2="28"
                stroke="#EF4444"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        ) : (
          /* Filtered Out Row Treatment */
          <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-800 bg-gray-950/40 text-xs text-gray-500">
            <span>0 of {totalCount} articles visible · hidden by source filter</span>
          </div>
        )}
      </div>
    </div>
  );
}
