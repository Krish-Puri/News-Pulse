'use client';

import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export default function IngestionStepper({ jobStatus }) {
  const stepNumber = jobStatus?.stepNumber || 1;
  const progress = jobStatus?.progress || 10;
  const jobId = jobStatus?.jobId;

  const STEPS = [
    { num: 1, label: 'Fetching feeds' },
    { num: 2, label: 'Extracting articles' },
    { num: 3, label: 'Grouping topics' },
    { num: 4, label: 'Updating timeline' }
  ];

  return (
    <div className="w-full bg-bg-secondary border border-border-primary rounded-xl p-4 my-2 animate-slide-down">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-primary">
            Pulling fresh articles from 4 feeds
          </span>
        </div>
        <div className="text-sm font-bold text-accent-red">
          {progress}%
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-text-muted mb-3">
        The timeline stays usable — it will update on its own when the job finishes.
      </p>

      {/* Horizontal Stepper */}
      <div className="flex items-center gap-1 w-full">
        {STEPS.map((s, i) => {
          const isDone = stepNumber > s.num || progress === 100;
          const isCurrent = stepNumber === s.num && progress < 100;

          return (
            <div key={s.num} className="flex items-center flex-1 min-w-0">
              <div className={`flex items-center gap-1.5 text-xs whitespace-nowrap ${
                isDone
                  ? 'text-accent-emerald font-medium'
                  : isCurrent
                  ? 'text-text-primary font-semibold'
                  : 'text-text-muted'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-accent-red animate-spin shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-text-muted shrink-0" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${
                  isDone ? 'bg-accent-emerald' : 'bg-border-primary'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
