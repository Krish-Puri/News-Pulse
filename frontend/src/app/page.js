'use client';

import { useState, useMemo } from 'react';
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
import { SOURCES } from '../lib/constants';
import { fetchTimeline, fetchClusterDetail, triggerIngestion, fetchIngestionStatus } from '../lib/api';

export default function HomePage() {
  const queryClient = useQueryClient();

  // Client UI States
  const [activeSources, setActiveSources] = useState(() => new Set(SOURCES.map(s => s.id)));
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [lastStats, setLastStats] = useState(null);
  const [useMockMode, setUseMockMode] = useState(false);

  // 1. Timeline Data Query
  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    error: timelineQueryError,
    refetch: refetchTimeline
  } = useQuery({
    queryKey: ['timeline', useMockMode],
    queryFn: () => fetchTimeline('24h')
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

  // Handle ingestion completion
  useMemo(() => {
    if (jobStatusData?.status === 'completed') {
      // Ephemeral Cluster ID Rule: Clear drawer selection after re-clustering
      setSelectedClusterId(null);
      setLastStats({
        articlesNew: jobStatusData.articlesNew,
        clustersCreated: jobStatusData.clustersCreated
      });
      // Invalidate timeline to pull fresh snapshot
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      setActiveJobId(null);
    } else if (jobStatusData?.status === 'failed') {
      setActiveJobId(null);
    }
  }, [jobStatusData, queryClient]);

  // Toggle single source pill
  const handleToggleSource = (sourceId) => {
    setActiveSources(prev => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        // Keep at least one active source or allow deselecting
        if (next.size > 1) next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  };

  // Reset all sources active
  const handleResetSources = () => {
    setActiveSources(new Set(SOURCES.map(s => s.id)));
  };

  // Trigger ingestion workflow
  const handleRefreshClick = async () => {
    try {
      setLastStats(null);
      const res = await triggerIngestion();
      if (res.jobId) {
        setActiveJobId(res.jobId);
      }
    } catch (err) {
      console.error('Failed to trigger refresh:', err);
    }
  };

  // Dynamic calculations
  const clusters = timelineData?.clusters || [];
  const meta = timelineData?.meta || {};
  const sourceCounts = timelineData?.sourceCounts || {};

  // Calculate total visible articles across active sources
  const totalVisibleArticles = useMemo(() => {
    return clusters.reduce((acc, c) => {
      const visible = (c.articles || []).filter(a => activeSources.has(a.source));
      return acc + visible.length;
    }, 0);
  }, [clusters, activeSources]);

  const isIngesting = !!activeJobId && (jobStatusData?.status === 'pending' || jobStatusData?.status === 'running');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* App Header */}
      <AppHeader
        meta={meta}
        onRefresh={handleRefreshClick}
        isIngesting={isIngesting}
        lastUpdatedText={meta.lastUpdated ? new Date(meta.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:px-6 flex flex-col gap-4">
        {/* Ingestion Stepper Progress */}
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
        ) : isTimelineError && !useMockMode ? (
          /* Error State */
          <ErrorState
            error={timelineQueryError}
            onRetry={() => refetchTimeline()}
            onUseMock={() => setUseMockMode(true)}
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
              totalArticles={meta.totalArticles || 56}
            />

            {/* Custom SVG Data-Driven Timeline Canvas */}
            <Timeline
              clusters={clusters}
              activeSources={activeSources}
              windowStart={meta.windowStart || '2026-09-21T05:00:00Z'}
              windowEnd={meta.windowEnd || '2026-09-21T19:00:00Z'}
              selectedClusterId={selectedClusterId}
              onSelectCluster={(id) => setSelectedClusterId(id)}
            />
          </>
        )}
      </main>

      {/* Cluster Detail Slide-in Drawer */}
      {selectedClusterId && (
        <ClusterDetailDrawer
          cluster={clusterDetailData?.cluster || clusters.find(c => c.id === selectedClusterId)}
          onClose={() => setSelectedClusterId(null)}
        />
      )}
    </div>
  );
}
