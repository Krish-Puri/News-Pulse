'use client';

import { Check } from 'lucide-react';
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
      {/* Source Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider shrink-0">
          Sources
        </span>

        {SOURCES.map(source => {
          const isActive = activeSources.has(source.id);
          const count = sourceCounts[source.id] || 0;

          return (
            <button
              key={source.id}
              onClick={() => onToggleSource(source.id)}
              aria-pressed={isActive}
              aria-label={`Filter by ${source.name}: ${count} articles`}
              className={`inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 select-none whitespace-nowrap ${
                isActive
                  ? 'bg-bg-primary text-text-primary border-border-active shadow-sm'
                  : 'bg-bg-secondary text-text-muted border-border-secondary hover:border-border-primary'
              }`}
            >
              {/* Source color dot */}
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-30'}`}
                style={{ backgroundColor: source.color }}
              />
              <span>{source.label}</span>
              <span className={`font-semibold ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                {count}
              </span>
              {/* Checkmark for active */}
              {isActive && (
                <Check className="w-3.5 h-3.5 text-text-secondary" strokeWidth={2.5} />
              )}
            </button>
          );
        })}

        {isFiltered && (
          <button
            onClick={onResetSources}
            className="text-xs text-text-muted hover:text-text-primary font-medium ml-1 whitespace-nowrap transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Right: Sort + Time Window — placeholder for future controls */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        {isFiltered && (
          <span className="text-xs text-text-muted">
            Showing <span className="font-semibold text-text-primary">{totalVisibleArticles}</span> of {totalArticles} articles
          </span>
        )}
      </div>
    </div>
  );
}
