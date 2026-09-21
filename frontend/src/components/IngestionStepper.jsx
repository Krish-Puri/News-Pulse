'use client';

import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export default function IngestionStepper({ jobStatus }) {
  const stepNumber = jobStatus?.stepNumber || 1;
  const progress = jobStatus?.progress || 10;
  const currentStepText = jobStatus?.step || 'Fetching feeds';

  const STEPS = [
    { num: 1, label: 'Fetching feeds' },
    { num: 2, label: 'Extracting articles' },
    { num: 3, label: 'Grouping topics' },
    { num: 4, label: 'Updating timeline' }
  ];

  return (
    <div className="w-full bg-gray-900 border border-red-500/30 rounded-xl p-4 my-4 shadow-lg animate-pulse-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
          <span className="text-sm font-bold text-white">
            Ingestion job in progress
          </span>
          <span className="text-xs text-gray-400 font-mono">
            #{jobStatus?.jobId ? jobStatus.jobId.slice(0, 8) : 'running'}
          </span>
        </div>
        <div className="text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
          Estimated progress: {progress}%
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="w-full bg-gray-950 rounded-full h-2 overflow-hidden mb-4 border border-gray-800">
        <div
          className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stepper Stage Labels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STEPS.map(s => {
          const isDone = stepNumber > s.num || progress === 100;
          const isCurrent = stepNumber === s.num && progress < 100;

          return (
            <div
              key={s.num}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                  : isCurrent
                  ? 'bg-red-950/40 border-red-500/50 text-white font-medium'
                  : 'bg-gray-950/40 border-gray-850 text-gray-500'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-gray-600 shrink-0" />
              )}
              <span className="truncate">{s.label}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-400 mt-2 text-center sm:text-left">
        The timeline stays usable — it will update on its own when the ingestion job completes.
      </p>
    </div>
  );
}
