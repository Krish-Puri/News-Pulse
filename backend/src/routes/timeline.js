const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /timeline
 * Returns clusters shaped for visual timeline rendering.
 */
router.get('/', async (req, res) => {
  try {
    const windowParam = (req.query.window || '24h').toLowerCase();
    let hours = 24;
    if (windowParam === '12h') hours = 12;
    else if (windowParam === '48h') hours = 48;

    // 1. Fetch metadata
    const metaQuery = `
      SELECT 
        COUNT(*)::int AS "totalArticles",
        COUNT(DISTINCT source)::int AS "sourceCount",
        MIN(published_at) AS "windowStart",
        MAX(published_at) AS "windowEnd",
        MAX(fetched_at) AS "lastUpdated"
      FROM articles
      WHERE published_at >= NOW() - ($1 || ' hours')::INTERVAL;
    `;
    const metaRes = await db.query(metaQuery, [hours]);
    const meta = metaRes.rows[0] || {};

    // 2. Fetch source breakdown counts
    const sourceCountsQuery = `
      SELECT source, COUNT(*)::int AS count
      FROM articles
      WHERE published_at >= NOW() - ($1 || ' hours')::INTERVAL
      GROUP BY source;
    `;
    const sourceRes = await db.query(sourceCountsQuery, [hours]);
    const sourceCounts = {};
    const sourcesList = [];
    sourceRes.rows.forEach(r => {
      sourceCounts[r.source] = r.count;
      sourcesList.push(r.source);
    });

    meta.sources = sourcesList;

    // Count total clusters
    const clusterCountQuery = `SELECT COUNT(*)::int AS count FROM clusters;`;
    const clusterCountRes = await db.query(clusterCountQuery);
    meta.totalClusters = clusterCountRes.rows[0]?.count || 0;

    // 3. Fetch timeline clusters
    const clustersQuery = `
      SELECT 
        c.id,
        c.label,
        c.start_time AS "startTime",
        c.end_time AS "endTime",
        c.article_count AS "articleCount",
        ARRAY_AGG(DISTINCT a.source) AS "sources"
      FROM clusters c
      JOIN articles a ON a.cluster_id = c.id
      WHERE c.start_time >= NOW() - ($1 || ' hours')::INTERVAL
      GROUP BY c.id
      ORDER BY c.start_time DESC;
    `;
    const clustersRes = await db.query(clustersQuery, [hours]);
    const clusters = clustersRes.rows;

    // 4. Fetch lightweight article items (id, publishedAt, source) per cluster
    if (clusters.length > 0) {
      const clusterIds = clusters.map(c => c.id);
      const articlesQuery = `
        SELECT 
          id,
          cluster_id AS "clusterId",
          published_at AS "publishedAt",
          source
        FROM articles
        WHERE cluster_id = ANY($1)
        ORDER BY published_at ASC;
      `;
      const articlesRes = await db.query(articlesQuery, [clusterIds]);
      
      const articlesByCluster = {};
      articlesRes.rows.forEach(a => {
        if (!articlesByCluster[a.clusterId]) {
          articlesByCluster[a.clusterId] = [];
        }
        articlesByCluster[a.clusterId].push({
          id: a.id,
          publishedAt: a.publishedAt,
          source: a.source
        });
      });

      clusters.forEach(c => {
        c.articles = articlesByCluster[c.id] || [];
      });
    }

    return res.status(200).json({
      meta,
      sourceCounts,
      clusters
    });
  } catch (error) {
    console.error('Error in GET /timeline:', error);
    return res.status(500).json({ error: 'Failed to fetch timeline data' });
  }
});

module.exports = router;
