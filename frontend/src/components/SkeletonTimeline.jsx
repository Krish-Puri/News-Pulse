'use client';

export default function SkeletonTimeline() {
  return (
    <div className="w-full bg-bg-primary border border-border-primary rounded-xl overflow-hidden p-4 space-y-4">
      {/* Skeleton Filter row */}
      <div className="flex items-center gap-3 pb-3 border-b border-border-secondary">
        <div className="w-16 h-4 bg-bg-tertiary rounded animate-pulse" />
        <div className="w-24 h-7 bg-bg-tertiary rounded-full animate-shimmer" />
        <div className="w-24 h-7 bg-bg-tertiary rounded-full animate-shimmer" />
        <div className="w-24 h-7 bg-bg-tertiary rounded-full animate-shimmer" />
        <div className="w-24 h-7 bg-bg-tertiary rounded-full animate-shimmer" />
      </div>

      {/* Skeleton Histogram */}
      <div className="flex items-end gap-1.5 h-8 pb-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-bg-tertiary rounded animate-shimmer"
            style={{ height: `${12 + ((i * 7) % 20)}px` }}
          />
        ))}
      </div>

      {/* Skeleton Time Axis */}
      <div className="flex items-center gap-4 pb-2 border-b border-border-secondary">
        <div className="w-24 h-3 bg-bg-tertiary rounded animate-pulse" />
        <div className="flex-1 flex items-center gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-8 h-3 bg-bg-tertiary rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Skeleton Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2.5 border-b border-border-secondary">
          <div className="w-64 sm:w-80 shrink-0 space-y-2">
            <div className="w-4/5 h-4 bg-bg-tertiary rounded animate-shimmer" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-bg-tertiary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-bg-tertiary animate-pulse" />
              <div className="w-16 h-3 bg-bg-tertiary rounded animate-pulse" />
            </div>
          </div>
          <div className="flex-1 h-7 bg-bg-secondary rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-bg-tertiary rounded animate-shimmer"
              style={{ width: `${30 + (i * 11) % 50}%`, marginLeft: `${(i * 15) % 40}%` }}
            />
          </div>
        </div>
      ))}

      <div className="text-center py-2 text-xs text-text-muted animate-pulse">
        Loading visual timeline...
      </div>
    </div>
  );
}
