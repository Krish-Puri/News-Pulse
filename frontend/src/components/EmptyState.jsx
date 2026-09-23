'use client';

import { Layers, RotateCw } from 'lucide-react';

export default function EmptyState({ onRefresh }) {
  return (
    <div className="w-full bg-bg-primary border border-border-primary rounded-xl p-12 text-center my-6 flex flex-col items-center justify-center max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-bg-tertiary border border-border-primary flex items-center justify-center mb-4">
        <Layers className="w-8 h-8 text-text-muted" />
      </div>

      <h3 className="text-xl font-bold text-text-primary mb-2">
        No topics on the timeline yet
      </h3>

      <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed mb-6">
        News Pulse hasn&apos;t pulled any articles so far. Run an ingestion to fetch the latest stories from BBC, NPR, Reuters, and The Guardian, group them into topics, and plot them here.
      </p>

      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-text-primary text-text-inverse font-semibold text-sm hover:bg-gray-800 active:scale-[0.97] transition-all shadow-sm"
      >
        <RotateCw className="w-4 h-4" />
        Refresh data
      </button>

      <p className="text-xs text-text-muted mt-4">
        First run usually takes 20–40 seconds
      </p>
    </div>
  );
}
