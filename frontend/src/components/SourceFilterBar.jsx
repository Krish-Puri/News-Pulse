'use client';

import { SOURCES } from '../lib/constants';

export default function SourceFilterBar({
  activeSources,
  onToggleSource,
  onResetSources,
  sourceCounts = {},
  totalVisibleArticles = 0,
  totalArticles = 0
}) {
  const isFiltered = activeSources.size < SOURCES.length;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-gray-800">
      {/* Source Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
          Sources:
        </span>
        {SOURCES.map(source => {
          const isActive = activeSources.has(source.id);
          const count = sourceCounts[source.id] || 0;

          return (
            <button
              key={source.id}
              onClick={() => onToggleSource(source.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 select-none ${
                isActive
                  ? 'bg-gray-800 text-white border-gray-700 shadow-sm hover:border-gray-600'
                  : 'bg-gray-950 text-gray-500 border-gray-850 hover:text-gray-400'
              }`}
            >
              {/* Colored Dot */}
              <span
                className={`w-2 h-2 rounded-full transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-30'
                }`}
                style={{ backgroundColor: source.color }}
              />
              <span>{source.name}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-gray-700 text-gray-200' : 'bg-gray-900 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}

        {isFiltered && (
          <button
            onClick={onResetSources}
            className="text-xs text-red-400 hover:text-red-300 font-medium ml-2 underline underline-offset-2 transition-colors"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Filter Stats Counter */}
      <div className="text-xs text-gray-400">
        Showing <span className="font-semibold text-white">{totalVisibleArticles}</span> of {totalArticles} articles
      </div>
    </div>
  );
}
