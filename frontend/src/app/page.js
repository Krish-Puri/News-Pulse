'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AppHeader from '../components/AppHeader';
import SourceFilterBar from '../components/SourceFilterBar';
import Timeline from '../components/Timeline';
import ClusterDetailDrawer from '../components/ClusterDetailDrawer';
import IngestionStepper from '../components/IngestionStepper';
import SuccessBanner from '../components/SuccessBanner';
import SkeletonTimeline from '../components/SkeletonTimeline';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import MobileTimeline from '../components/MobileTimeline';
import { SOURCES } from '../lib/constants';
import { fetchTimeline, fetchClusterDetail, triggerIngestion, fetchIngestionStatus } from '../lib/api';

export default function HomePage() {
  const queryClient = useQueryClient();

  // Client UI State
  const [activeSources, setActiveSources] = useState(() => new Set(SOURCES.map(s => s.id)));
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [lastStats, setLastStats] = useState(null);
  const [refreshError, setRefreshError] = useState(null);
  const [timeWindow, setTimeWindow] = useState('24h');
  const [sortBy, setSortBy] = useState('longest');

  // 1. Timeline Data Query
  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    error: timelineQueryError,
    refetch: refetchTimeline
  } = useQuery({
    queryKey: ['timeline', timeWindow],
    queryFn: () => fetchTimeline(timeWindow)
  });

  // 2. Cluster Detail Query (Lazy fetch when drawer opens)
  const {
    data: clusterDetailData
  } = useQuery({
    queryKey: ['cluster', selectedClusterId],
    queryFn: () => fetchClusterDetail(selectedClusterId),
    enabled: !!selectedClusterId
  });

  // 3. Ingestion Status Polling Query
  const {
    data: jobStatusData
  } = useQuery({
    queryKey: ['ingestionStatus', activeJobId],
    queryFn: () => fetchIngestionStatus(activeJobId),
    enabled: !!activeJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds while pending or running
    }
  });

  // Handle ingestion completion — useEffect, NOT useMemo
  useEffect(() => {
    if (!jobStatusData) return;

    if (jobStatusData.status === 'completed') {
      // Clear drawer selection (cluster IDs are ephemeral after re-clustering)
      setSelectedClusterId(null);
      setLastStats({
        articlesNew: jobStatusData.articlesNew,
        clustersCreated: jobStatusData.clustersCreated
      });
      // Invalidate timeline to pull fresh snapshot
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      setActiveJobId(null);
    } else if (jobStatusData.status === 'failed') {
      setRefreshError(jobStatusData.error || 'Ingestion job failed.');
      setActiveJobId(null);
    }
  }, [jobStatusData?.status, jobStatusData?.articlesNew, jobStatusData?.clustersCreated, jobStatusData?.error, queryClient]);

  // Toggle single source pill
  const handleToggleSource = useCallback((sourceId) => {
    setActiveSources(prev => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        if (next.size > 1) next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  }, []);

  // Reset all sources active
  const handleResetSources = useCallback(() => {
    setActiveSources(new Set(SOURCES.map(s => s.id)));
  }, []);

  // Trigger ingestion workflow
  const handleRefreshClick = useCallback(async () => {
    try {
      setLastStats(null);
      setRefreshError(null);
      const res = await triggerIngestion();
      if (res.jobId) {
        setActiveJobId(res.jobId);
      }
    } catch (err) {
      console.error('Failed to trigger refresh:', err);
      setRefreshError(err.message || 'Unable to connect to News Pulse API. Please verify the backend service is running.');
    }
  }, []);

  // Dynamic calculations
  const clusters = timelineData?.clusters || [];
  const meta = timelineData?.meta || {};
  const sourceCounts = timelineData?.sourceCounts || {};

  // Sort clusters
  const sortedClusters = useMemo(() => {
    const sorted = [...clusters];
    if (sortBy === 'longest') {
      sorted.sort((a, b) => {
        const durationA = new Date(a.endTime).getTime() - new Date(a.startTime).getTime();
        const durationB = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
        return durationB - durationA;
      });
    } else {
      sorted.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }
    return sorted;
  }, [clusters, sortBy]);

  // Calculate total visible articles across active sources
  const totalVisibleArticles = useMemo(() => {
    return clusters.reduce((acc, c) => {
      const visible = (c.articles || []).filter(a => activeSources.has(a.source));
      return acc + visible.length;
    }, 0);
  }, [clusters, activeSources]);

  const isIngesting = !!activeJobId && (jobStatusData?.status === 'pending' || jobStatusData?.status === 'running');

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans">
      {/* App Header */}
      <AppHeader
        meta={meta}
        onRefresh={handleRefreshClick}
        isIngesting={isIngesting}
        lastUpdatedText={meta.lastUpdated ? new Date(meta.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-5 md:px-6 flex flex-col gap-3">
        {/* Refresh Error Banner */}
        {refreshError && (
          <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 my-1 flex items-center justify-between text-sm text-red-800 animate-slide-down">
            <span className="flex items-center gap-2">
              <span className="font-bold">⚠ Connection Error:</span> {refreshError}
            </span>
            <button
              onClick={() => setRefreshError(null)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Ingestion Stepper */}
        {isIngesting && (
          <IngestionStepper jobStatus={jobStatusData} />
        )}

        {/* Post-Refresh Success Banner */}
        {lastStats && (
          <SuccessBanner
            stats={lastStats}
            onDismiss={() => setLastStats(null)}
          />
        )}

        {/* Loading Skeleton */}
        {isTimelineLoading ? (
          <SkeletonTimeline />
        ) : isTimelineError ? (
          /* Error State */
          <ErrorState
            error={timelineQueryError}
            onRetry={() => refetchTimeline()}
          />
        ) : clusters.length === 0 ? (
          /* Empty State */
          <EmptyState onRefresh={handleRefreshClick} />
        ) : (
          /* Main Timeline View */
          <>
            {/* Source Filter Bar */}
            <SourceFilterBar
              activeSources={activeSources}
              onToggleSource={handleToggleSource}
              onResetSources={handleResetSources}
              sourceCounts={sourceCounts}
              totalVisibleArticles={totalVisibleArticles}
              totalArticles={meta.totalArticles || 0}
            />

            {/* Desktop: Custom SVG Timeline */}
            <div className="hidden md:block">
              <Timeline
                clusters={sortedClusters}
                activeSources={activeSources}
                windowStart={meta.windowStart}
                windowEnd={meta.windowEnd}
                selectedClusterId={selectedClusterId}
                onSelectCluster={(id) => setSelectedClusterId(id)}
                timeWindow={timeWindow}
                onChangeTimeWindow={setTimeWindow}
                sortBy={sortBy}
                onChangeSortBy={setSortBy}
              />
            </div>

            {/* Mobile: Topic Cards */}
            <div className="md:hidden">
              <MobileTimeline
                clusters={sortedClusters}
                activeSources={activeSources}
                windowStart={meta.windowStart}
                windowEnd={meta.windowEnd}
                selectedClusterId={selectedClusterId}
                onSelectCluster={(id) => setSelectedClusterId(id)}
                sortBy={sortBy}
              />
            </div>
          </>
        )}
      </main>

      {/* Cluster Detail Drawer / Bottom Sheet */}
      {selectedClusterId && (
        <ClusterDetailDrawer
          cluster={clusterDetailData?.cluster || clusters.find(c => c.id === selectedClusterId)}
          onClose={() => setSelectedClusterId(null)}
        />
      )}

      {/* Mobile Sticky Refresh Footer */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-primary border-t border-border-primary p-3 safe-area-bottom">
        <button
          onClick={handleRefreshClick}
          disabled={isIngesting}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            isIngesting
              ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
              : 'bg-text-primary text-text-inverse active:scale-[0.98] shadow-sm'
          }`}
        >
          {isIngesting ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
              </svg>
              Ingesting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Refresh data
            </>
          )}
        </button>
      </div>
    </div>
  );
}
