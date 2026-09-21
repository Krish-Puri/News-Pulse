'use client';

import { useState, useRef, useEffect } from 'react';
import ClusterRow from './ClusterRow';
import { generateHourlyTicks, timeToX } from '../lib/timelineMath';

export default function Timeline({
  clusters = [],
  activeSources,
  windowStart,
  windowEnd,
  selectedClusterId,
  onSelectCluster
}) {
  const containerRef = useRef(null);
  const [svgWidth, setSvgWidth] = useState(800);

  // Dynamically calculate timeline SVG width on resize
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        // Leave ~320px for the left label column
        const fullWidth = containerRef.current.clientWidth;
        const availableForBar = Math.max(400, fullWidth - 320);
        setSvgWidth(availableForBar);
      }
    }

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const ticks = generateHourlyTicks(windowStart, windowEnd, svgWidth);
  const nowX = timeToX(new Date().toISOString(), windowStart, windowEnd, svgWidth);

  return (
    <div ref={containerRef} className="w-full bg-gray-950 border border-gray-850 rounded-xl overflow-hidden shadow-xl">
      {/* Time Axis Header */}
      <div className="flex items-center border-b border-gray-800 bg-gray-900/80 py-2.5 px-2">
        <div className="w-64 sm:w-72 md:w-80 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-2">
          Topic / Story Headline
        </div>
        <div className="flex-1 relative h-6 overflow-hidden">
          <svg width={svgWidth} height="24">
            {ticks.map((tick, i) => (
              <g key={i} transform={`translate(${tick.x}, 0)`}>
                <line x1="0" y1="14" x2="0" y2="24" stroke="#374151" strokeWidth="1" />
                <text x="0" y="10" textAnchor="middle" fill="#9CA3AF" fontSize="11" fontWeight="500">
                  {tick.label}
                </text>
              </g>
            ))}

            {/* NOW Vertical Red Line Indicator */}
            {nowX > 0 && nowX < svgWidth && (
              <g transform={`translate(${nowX}, 0)`}>
                <line x1="0" y1="0" x2="0" y2="24" stroke="#EF4444" strokeWidth="2" strokeDasharray="2 2" />
                <text x="0" y="10" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">
                  NOW
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Timeline Cluster Rows List */}
      <div className="divide-y divide-gray-850/60">
        {clusters.map(cluster => (
          <ClusterRow
            key={cluster.id}
            cluster={cluster}
            activeSources={activeSources}
            windowStart={windowStart}
            windowEnd={windowEnd}
            width={svgWidth}
            isSelected={selectedClusterId === cluster.id}
            onSelectCluster={onSelectCluster}
          />
        ))}
      </div>

      {/* Timeline Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-gray-900/60 border-t border-gray-850 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-2 rounded bg-gray-700 border border-gray-600 inline-block" />
            Bar length = topic duration
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-0.5 h-3 bg-red-500 inline-block" />
            Tick = one article
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
            Red edge = LIVE coverage
          </span>
        </div>
        <span className="text-gray-500 text-[11px]">
          Click any row to view full cluster articles & stats
        </span>
      </div>
    </div>
  );
}
