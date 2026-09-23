'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import ClusterRow from './ClusterRow';
import CoverageHistogram from './CoverageHistogram';
import { generateHourlyTicks, timeToX, buildCoverageData } from '../lib/timelineMath';

export default function Timeline({
  clusters = [],
  activeSources,
  windowStart,
  windowEnd,
  selectedClusterId,
  onSelectCluster,
  timeWindow = '24h',
  onChangeTimeWindow,
  sortBy = 'longest',
  onChangeSortBy
}) {
  const containerRef = useRef(null);
  const [svgWidth, setSvgWidth] = useState(800);

  // Dynamically calculate timeline SVG width on resize
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        const fullWidth = containerRef.current.clientWidth;
        // Leave space for the left label column
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

  // Build coverage histogram data from visible articles
  const coverageData = useMemo(() => {
    return buildCoverageData(clusters, activeSources, windowStart, windowEnd);
  }, [clusters, activeSources, windowStart, windowEnd]);

  // Format date label for time axis
  const dateLabel = useMemo(() => {
    if (!windowStart) return '';
    const d = new Date(windowStart);
    if (isNaN(d.getTime())) return '';
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  }, [windowStart]);

  return (
    <div ref={containerRef} className="w-full bg-bg-primary border border-border-primary rounded-xl overflow-hidden">
      {/* Coverage Histogram + Sort/Window Controls */}
      <div className="flex items-end justify-between px-4 pt-3 pb-1 border-b border-border-secondary">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-accent-red uppercase tracking-wider">Coverage</span>
          <span className="text-[10px] text-text-muted">articles / hour</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Control */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted">
            <span>Sort</span>
            <button
              onClick={() => onChangeSortBy?.(sortBy === 'longest' ? 'recent' : 'longest')}
              className="font-semibold text-text-primary hover:text-accent-red transition-colors"
            >
              {sortBy === 'longest' ? 'Longest active' : 'Most recent'}
            </button>
          </div>

          {/* Time Window Selector */}
          <div className="hidden sm:flex items-center border border-border-primary rounded-lg overflow-hidden">
            {['12h', '24h', '48h'].map(tw => (
              <button
                key={tw}
                onClick={() => onChangeTimeWindow?.(tw)}
                className={`px-3 py-1 text-xs font-semibold transition-colors ${
                  timeWindow === tw
                    ? 'bg-text-primary text-text-inverse'
                    : 'bg-bg-primary text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                {tw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage Histogram */}
      <div className="px-4 pb-2">
        <div className="flex items-end">
          {/* Left spacer matching label column width */}
          <div className="w-64 sm:w-72 md:w-80 shrink-0" />
          <div className="flex-1 overflow-hidden">
            <CoverageHistogram
              data={coverageData}
              width={svgWidth}
              windowStart={windowStart}
              windowEnd={windowEnd}
            />
          </div>
        </div>
      </div>

      {/* Time Axis Header */}
      <div className="flex items-center border-b border-border-primary py-1.5 px-2">
        <div className="w-64 sm:w-72 md:w-80 shrink-0 text-[11px] font-bold text-text-secondary uppercase tracking-wider pl-2">
          {dateLabel}
        </div>
        <div className="flex-1 relative h-6 overflow-hidden">
          <svg width={svgWidth} height="24">
            {ticks.map((tick, i) => (
              <g key={i} transform={`translate(${tick.x}, 0)`}>
                <line x1="0" y1="14" x2="0" y2="24" stroke="#E5E7EB" strokeWidth="1" />
                <text x="0" y="11" textAnchor="middle" fill="#6B7280" fontSize="11" fontWeight="500" fontFamily="var(--font-sans)">
                  {tick.label}
                </text>
              </g>
            ))}

            {/* NOW marker */}
            {nowX > 0 && nowX < svgWidth && (
              <g transform={`translate(${nowX}, 0)`}>
                <rect x="-16" y="0" width="32" height="16" rx="3" fill="#DC2626" />
                <text x="0" y="11" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="var(--font-sans)">
                  NOW
                </text>
                <line x1="0" y1="16" x2="0" y2="24" stroke="#DC2626" strokeWidth="2" />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Timeline Cluster Rows */}
      <div>
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
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-bg-secondary border-t border-border-primary text-[11px] text-text-muted">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-3.5 rounded bg-gray-200 border border-gray-300 inline-block" />
            Bar length = how long the topic stayed active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-3.5 rounded bg-gray-300 inline-block" />
            Bar weight = article volume
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-0.5 h-3.5 bg-gray-500 inline-block rounded" />
            Tick = one article
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-0.5 h-3.5 bg-accent-red inline-block rounded" />
            Red = still receiving coverage
          </span>
        </div>
        <span className="text-text-muted">
          Click any topic bar to open its articles · Scroll horizontally to pan
        </span>
      </div>
    </div>
  );
}
