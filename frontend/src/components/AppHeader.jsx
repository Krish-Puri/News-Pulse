'use client';

import { RotateCw } from 'lucide-react';

export default function AppHeader({
  meta,
  onRefresh,
  isIngesting = false,
  lastUpdatedText = 'Just now'
}) {
  const totalArticles = meta?.totalArticles || 0;
  const totalClusters = meta?.totalClusters || 0;
  const sources = meta?.sources || [];
  const windowStart = meta?.windowStart;
  const windowEnd = meta?.windowEnd;

  // Format window range for subtitle
  let windowText = '';
  if (windowStart && windowEnd) {
    const start = new Date(windowStart);
    const end = new Date(windowEnd);
    const dayStr = start.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    windowText = `Window: ${dayStr}, ${startTime} – ${endTime}`;
  }

  return (
    <header className="border-b border-border-primary bg-bg-primary sticky top-0 z-30 px-4 py-3 md:px-6">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-red animate-pulse-glow" />
            <h1 className="text-base md:text-lg font-extrabold tracking-tight text-text-primary uppercase">
              NEWS PULSE
            </h1>
          </div>
          <span className="hidden sm:block text-xs text-text-muted">
            Live news intelligence
          </span>
        </div>

        {/* Center: Stats */}
        <div className="hidden md:flex items-center gap-1.5 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">{totalArticles}</span>
          <span>articles</span>
          <span className="text-text-muted mx-0.5">·</span>
          <span className="font-semibold text-text-primary">{totalClusters}</span>
          <span>topics</span>
          <span className="text-text-muted mx-0.5">·</span>
          <span className="font-semibold text-text-primary">{sources.length}</span>
          <span>sources</span>
          {windowText && (
            <>
              <span className="text-text-muted mx-1">|</span>
              <span className="text-xs text-text-muted">{windowText}</span>
            </>
          )}
        </div>

        {/* Right: Last updated + Refresh */}
        <div className="flex items-center gap-3">
          {!isIngesting && (
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[11px] text-text-muted leading-tight">Last updated</span>
              <span className="text-xs font-semibold text-text-secondary leading-tight">{lastUpdatedText}</span>
            </div>
          )}

          {isIngesting && (
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[11px] text-accent-red font-medium leading-tight">Ingestion job</span>
              <span className="text-xs font-mono text-text-secondary leading-tight">running</span>
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={isIngesting}
            aria-label={isIngesting ? 'Ingestion in progress' : 'Refresh data'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isIngesting
                ? 'bg-bg-tertiary text-text-muted border border-border-primary cursor-not-allowed'
                : 'bg-text-primary text-text-inverse hover:bg-gray-800 active:scale-[0.97] shadow-sm'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isIngesting ? 'animate-spin text-accent-red' : ''}`} />
            <span className="hidden sm:inline">{isIngesting ? 'Ingesting...' : 'Refresh data'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
