'use client';

export default function SkeletonTimeline() {
  return (
    <div className="w-full bg-gray-950 border border-gray-850 rounded-xl overflow-hidden p-4 space-y-4 shadow-xl">
      {/* Skeleton Filters */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-850">
        <div className="w-16 h-4 bg-gray-850 rounded animate-pulse" />
        <div className="w-24 h-7 bg-gray-850 rounded-full animate-shimmer" />
        <div className="w-24 h-7 bg-gray-850 rounded-full animate-shimmer" />
        <div className="w-24 h-7 bg-gray-850 rounded-full animate-shimmer" />
      </div>

      {/* Skeleton Rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-900">
          <div className="w-64 sm:w-80 shrink-0 space-y-2">
            <div className="w-20 h-3 bg-gray-850 rounded animate-pulse" />
            <div className="w-4/5 h-4 bg-gray-800 rounded animate-shimmer" />
          </div>
          <div className="flex-1 h-8 bg-gray-900 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-gray-800/80 rounded-lg animate-shimmer"
              style={{ width: `${30 + (i * 11) % 50}%`, marginLeft: `${(i * 15) % 40}%` }}
            />
          </div>
        </div>
      ))}
      <div className="text-center py-2 text-xs text-gray-500 animate-pulse">
        Loading visual timeline...
      </div>
    </div>
  );
}
