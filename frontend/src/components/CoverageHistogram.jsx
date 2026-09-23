'use client';

import { useMemo } from 'react';
import { timeToX } from '../lib/timelineMath';

export default function CoverageHistogram({
  data = [],
  width = 800,
  windowStart,
  windowEnd,
  height = 32
}) {
  const barWidth = useMemo(() => {
    if (data.length <= 1) return 20;
    // Calculate width based on hour gaps
    const x0 = timeToX(data[0]?.hour, windowStart, windowEnd, width);
    const x1 = timeToX(data[1]?.hour, windowStart, windowEnd, width);
    return Math.max(8, Math.min(24, (x1 - x0) * 0.7));
  }, [data, width, windowStart, windowEnd]);

  const maxCount = useMemo(() => {
    return Math.max(1, ...data.map(d => d.count));
  }, [data]);

  // Find peak hour
  const peakIdx = useMemo(() => {
    let max = 0, idx = -1;
    data.forEach((d, i) => {
      if (d.count > max) { max = d.count; idx = i; }
    });
    return idx;
  }, [data]);

  if (data.length === 0) return null;

  return (
    <svg width={width} height={height + 16} className="overflow-visible">
      {data.map((d, i) => {
        const x = timeToX(d.hour, windowStart, windowEnd, width);
        const barHeight = Math.max(2, (d.count / maxCount) * height);
        const isPeak = i === peakIdx;

        return (
          <g key={i} transform={`translate(${x}, 0)`}>
            <rect
              x={-barWidth / 2}
              y={height - barHeight + 10}
              width={barWidth}
              height={barHeight}
              rx="2"
              fill={isPeak ? '#DC2626' : '#D1D5DB'}
              className="transition-all duration-200"
            />
            {/* Peak label */}
            {isPeak && d.count > 0 && (
              <text
                x="0"
                y={height - barHeight + 4}
                textAnchor="middle"
                fill="#DC2626"
                fontSize="9"
                fontWeight="600"
                fontFamily="var(--font-sans)"
              >
                peak {new Date(d.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
