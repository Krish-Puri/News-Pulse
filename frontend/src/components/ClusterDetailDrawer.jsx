'use client';

import { useEffect } from 'react';
import { X, ExternalLink, Clock, Newspaper, Layers } from 'lucide-react';
import { SOURCE_COLOR_MAP } from '../lib/constants';
import { formatDuration } from '../lib/timelineMath';

export default function ClusterDetailDrawer({
  cluster,
  onClose
}) {
  // ESC key listener to close drawer
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!cluster) return null;

  const durationMs = new Date(cluster.endTime).getTime() - new Date(cluster.startTime).getTime();
  const activeDurationText = formatDuration(durationMs);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container (Slide-in from right on desktop / bottom sheet on mobile) */}
      <div className="relative w-full max-w-lg bg-gray-900 border-l border-gray-800 h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-start justify-between gap-4 bg-gray-950/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                TOPIC CLUSTER
              </span>
              {cluster.isLive && (
                <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.2 rounded uppercase">
                  LIVE
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {cluster.label}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cluster Stats Summary Row */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-800 bg-gray-900/40">
          <div className="p-3 rounded-xl bg-gray-950 border border-gray-850 flex flex-col items-center text-center">
            <Newspaper className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-lg font-bold text-white">{cluster.articleCount || cluster.articles?.length || 0}</span>
            <span className="text-[11px] text-gray-400">Articles</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-950 border border-gray-850 flex flex-col items-center text-center">
            <Layers className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-lg font-bold text-white">{cluster.sourceCount || cluster.sources?.length || 0}</span>
            <span className="text-[11px] text-gray-400">Sources</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-950 border border-gray-850 flex flex-col items-center text-center">
            <Clock className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-lg font-bold text-white">{activeDurationText}</span>
            <span className="text-[11px] text-gray-400">Active Duration</span>
          </div>
        </div>

        {/* Source Badges */}
        <div className="px-5 py-3 border-b border-gray-850 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Outlets:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {cluster.sources?.map(src => (
              <span
                key={src}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-950 border border-gray-800 text-gray-300"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_COLOR_MAP[src] || '#9CA3AF' }} />
                {src}
              </span>
            ))}
          </div>
        </div>

        {/* Chronological Article List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Chronological Coverage ({cluster.articles?.length || 0} Articles)
          </h3>

          {cluster.articles && cluster.articles.length > 0 ? (
            cluster.articles.map((article, i) => {
              const pubDate = new Date(article.publishedAt);
              const timeFormatted = isNaN(pubDate.getTime())
                ? 'Recent'
                : pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const color = SOURCE_COLOR_MAP[article.source] || '#9CA3AF';

              return (
                <div
                  key={article.id || i}
                  className="p-4 rounded-xl bg-gray-950/80 border border-gray-850 hover:border-gray-750 transition-all duration-150 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      {article.source}
                    </span>
                    <span>{timeFormatted}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {article.title}
                  </h4>

                  {article.description && (
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                  )}

                  {article.url && (
                    <div className="pt-1">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Read full article <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 py-8 text-center">
              No article details available for this topic.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
