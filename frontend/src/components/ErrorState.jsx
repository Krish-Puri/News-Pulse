'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onRetry, onUseMock }) {
  return (
    <div className="w-full bg-bg-primary border border-red-200 rounded-xl p-10 text-center my-6 max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-7 h-7 text-accent-red" />
      </div>

      <h3 className="text-lg font-bold text-text-primary mb-2">
        We can&apos;t reach the News Pulse service
      </h3>

      <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed mb-6">
        The timeline couldn&apos;t be loaded from the backend API. Nothing has been lost — stored articles remain safe. You can retry or switch to stored demonstration data.
      </p>

      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-accent-red font-mono mb-6 truncate max-w-md mx-auto">
          {error.message || String(error)}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent-red text-text-inverse font-semibold text-sm hover:bg-red-700 active:scale-[0.97] transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>

        {onUseMock && (
          <button
            onClick={onUseMock}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-bg-secondary border border-border-primary text-text-secondary font-semibold text-sm hover:text-text-primary hover:bg-bg-tertiary transition-all"
          >
            Use demonstration data
          </button>
        )}
      </div>
    </div>
  );
}
