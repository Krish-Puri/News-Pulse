'use client';

import { Layers, RotateCw } from 'lucide-react';

export default function EmptyState({ onRefresh }) {
  return (
    <div className="w-full bg-gray-950 border border-gray-850 rounded-xl p-12 text-center my-6 flex flex-col items-center justify-center max-w-2xl mx-auto shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4 text-gray-500">
        <Layers className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        No topics on the timeline yet
      </h3>

      <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
        News Pulse hasn&apos;t pulled any articles so far. Run an ingestion to fetch the latest stories from BBC, NPR, Reuters, and The Guardian, group them into topics, and plot them here.
      </p>

      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-gray-950 font-semibold text-sm hover:bg-gray-200 active:scale-95 transition-all shadow-lg"
      >
        <RotateCw className="w-4 h-4" />
        Refresh data
      </button>

      <p className="text-xs text-gray-500 mt-4">
        First run usually takes 20–40 seconds
      </p>
    </div>
  );
}
