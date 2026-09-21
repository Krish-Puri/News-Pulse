'use client';

import { CheckCircle2, X } from 'lucide-react';

export default function SuccessBanner({ stats, onDismiss }) {
  if (!stats) return null;

  return (
    <div className="w-full bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 my-4 flex items-start justify-between gap-3 text-sm text-emerald-200 animate-slide-down">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white text-sm">
            Timeline updated successfully
          </h4>
          <p className="text-xs text-emerald-300/90 mt-0.5">
            {stats.articlesNew || 0} new articles ingested · {stats.clustersCreated || 0} topics generated across active feeds.
          </p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="p-1 rounded text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
