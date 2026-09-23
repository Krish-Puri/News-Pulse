'use client';

import { CheckCircle2, X } from 'lucide-react';

export default function SuccessBanner({ stats, onDismiss }) {
  if (!stats) return null;

  return (
    <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 my-2 flex items-start justify-between gap-3 text-sm text-emerald-800 animate-slide-down">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-emerald-900 text-sm">
            Timeline updated successfully
          </h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            {stats.articlesNew || 0} new articles ingested · {stats.clustersCreated || 0} topics generated across active feeds.
          </p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        aria-label="Dismiss success message"
        className="p-1 rounded text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
