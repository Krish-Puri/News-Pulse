'use client';

import { RotateCw, Zap } from 'lucide-react';

export default function AppHeader({
  meta,
  onRefresh,
  isIngesting = false,
  lastUpdatedText = 'Just now'
}) {
  const totalArticles = meta?.totalArticles || 56;
  const totalClusters = meta?.totalClusters || 10;

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3 md:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white uppercase">NEWS PULSE</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-400">Topic-clustered news timeline</p>
          </div>
        </div>

        {/* Center Stats Pill */}
        <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-300">
          <span className="font-semibold text-white">{totalArticles}</span> articles
          <span className="text-gray-600">•</span>
          <span className="font-semibold text-white">{totalClusters}</span> topics
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">Updated {lastUpdatedText}</span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isIngesting}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isIngesting
                ? 'bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed'
                : 'bg-white text-gray-950 hover:bg-gray-200 active:scale-95 shadow-md hover:shadow-lg'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isIngesting ? 'animate-spin text-red-400' : ''}`} />
            {isIngesting ? 'Ingesting...' : 'Refresh data'}
          </button>
        </div>
      </div>
    </header>
  );
}
