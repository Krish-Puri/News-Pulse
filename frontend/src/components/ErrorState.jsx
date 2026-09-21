'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onRetry, onUseMock }) {
  return (
    <div className="w-full bg-gray-950 border border-red-900/40 rounded-xl p-10 text-center my-6 max-w-xl mx-auto shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-500">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        We can&apos;t reach the News Pulse service
      </h3>

      <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
        The timeline couldn&apos;t be loaded from the backend API. Nothing has been lost — stored articles remain safe. You can retry or switch to stored demonstration data.
      </p>

      {error && (
        <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-red-400 font-mono mb-6 truncate max-w-md mx-auto">
          {error.message || String(error)}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-500 active:scale-95 transition-all shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>

        {onUseMock && (
          <button
            onClick={onUseMock}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 border border-gray-750 text-gray-300 font-semibold text-sm hover:text-white hover:bg-gray-800 transition-all"
          >
            Use demonstration data
          </button>
        )}
      </div>
    </div>
  );
}
