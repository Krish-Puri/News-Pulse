'use client';

import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { SOURCE_COLOR_MAP } from '../lib/constants';
import { formatDuration } from '../lib/timelineMath';

export default function ClusterDetailDrawer({
  cluster,
  onClose
}) {
  // ESC key listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!cluster) return null;

  const startTime = new Date(cluster.startTime);
  const endTime = new Date(cluster.endTime);
  const durationMs = endTime.getTime() - startTime.getTime();
  const activeDurationText = formatDuration(durationMs);
  const articleCount = cluster.articleCount || cluster.articles?.length || 0;
  const sourceCount = cluster.sourceCount || cluster.sources?.length || 0;
  const fmt = (d) => isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const timeRangeText = `${fmt(startTime)} → ${fmt(endTime)}`;

  // Build activity mini-timeline data
  const articles = cluster.articles || [];
  const buildActivityTicks = () => {
    if (articles.length === 0 || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return [];
    const range = endTime.getTime() - startTime.getTime();
    if (range <= 0) return articles.map(() => ({ x: 50, source: 'BBC' }));
    return articles.map(a => {
      const t = new Date(a.publishedAt).getTime();
      const pct = Math.max(0, Math.min(100, ((t - startTime.getTime()) / range) * 100));
      return { x: pct, source: a.source };
    });
  };
  const activityTicks = buildActivityTicks();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
        aria-label="Close drawer"
      />

      {/* Desktop: Slide-in drawer from right */}
      <div className="hidden md:flex relative w-full max-w-md bg-bg-primary border-l border-border-primary h-full shadow-2xl flex-col z-10 animate-slide-left">
        <DrawerContent
          cluster={cluster}
          onClose={onClose}
          articleCount={articleCount}
          sourceCount={sourceCount}
          activeDurationText={activeDurationText}
          timeRangeText={timeRangeText}
          activityTicks={activityTicks}
          articles={articles}
        />
      </div>

      {/* Mobile: Bottom sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-10 bg-bg-primary border-t border-border-primary rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 rounded-full bg-border-primary" />
        </div>
        <DrawerContent
          cluster={cluster}
          onClose={onClose}
          articleCount={articleCount}
          sourceCount={sourceCount}
          activeDurationText={activeDurationText}
          timeRangeText={timeRangeText}
          activityTicks={activityTicks}
          articles={articles}
          isMobile
        />
      </div>
    </div>
  );
}

function DrawerContent({
  cluster,
  onClose,
  articleCount,
  sourceCount,
  activeDurationText,
  timeRangeText,
  activityTicks,
  articles,
  isMobile = false
}) {
  return (
    <>
      {/* Header */}
      <div className="p-5 pb-4 flex items-start justify-between gap-4 border-b border-border-secondary">
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Topic Cluster
          </span>
          <h2 className="text-lg font-bold text-text-primary leading-snug mt-1">
            {cluster.label}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-0 border-b border-border-secondary">
        <div className="p-4 flex flex-col items-center text-center border-r border-border-secondary">
          <span className="text-2xl font-bold text-text-primary">{articleCount}</span>
          <span className="text-[11px] text-text-muted mt-0.5">Articles</span>
        </div>
        <div className="p-4 flex flex-col items-center text-center border-r border-border-secondary">
          <span className="text-2xl font-bold text-text-primary">{sourceCount}</span>
          <span className="text-[11px] text-text-muted mt-0.5">Sources</span>
        </div>
        <div className="p-4 flex flex-col items-center text-center">
          <span className="text-2xl font-bold text-text-primary">{activeDurationText}</span>
          <span className="text-[11px] text-text-muted mt-0.5">Active for</span>
        </div>
      </div>

      {/* Activity Mini-Timeline */}
      <div className="px-5 py-3 border-b border-border-secondary">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Activity</span>
          <span className="text-[11px] text-text-muted">{timeRangeText}</span>
        </div>
        <div className="relative h-6 bg-bg-tertiary rounded overflow-hidden">
          {activityTicks.map((tick, i) => (
            <div
              key={i}
              className="absolute top-1 bottom-1 w-0.5 rounded-full"
              style={{
                left: `${tick.x}%`,
                backgroundColor: SOURCE_COLOR_MAP[tick.source] || '#9CA3AF'
              }}
            />
          ))}
        </div>

        {/* Source Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {(cluster.sources || []).map(src => (
            <span
              key={src}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-bg-secondary border border-border-primary text-text-secondary"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_COLOR_MAP[src] || '#9CA3AF' }} />
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* Article List */}
      <div className={`flex-1 overflow-y-auto px-5 py-4 ${isMobile ? 'pb-20' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Articles
          </h3>
          <span className="text-[11px] text-text-muted">Oldest first</span>
        </div>

        <div className="space-y-0">
          {articles.length > 0 ? (
            articles.map((article, i) => {
              const pubDate = new Date(article.publishedAt);
              const timeFormatted = isNaN(pubDate.getTime())
                ? 'Recent'
                : pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const color = SOURCE_COLOR_MAP[article.source] || '#9CA3AF';

              return (
                <div
                  key={article.id || i}
                  className="py-3 border-b border-border-secondary last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    {/* Left: Time + Source */}
                    <div className="shrink-0 w-14 text-right">
                      <span className="text-xs font-semibold text-text-primary block">{timeFormatted}</span>
                      <span className="text-[10px] text-text-muted block">{article.source}</span>
                    </div>

                    {/* Source dot */}
                    <div className="shrink-0 mt-1.5">
                      <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-text-primary leading-snug">
                        {article.title}
                      </h4>

                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-red font-medium mt-1 transition-colors"
                        >
                          Read article <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-text-muted py-8 text-center">
              No article details available for this topic.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
