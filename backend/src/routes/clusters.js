const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /clusters
 * Returns summary list of all topic clusters.
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.label,
        c.start_time AS "startTime",
        c.end_time AS "endTime",
        c.article_count AS "articleCount",
        COUNT(DISTINCT a.source)::int AS "sourceCount",
        ARRAY_AGG(DISTINCT a.source) AS "sources"
      FROM clusters c
      LEFT JOIN articles a ON a.cluster_id = c.id
      GROUP BY c.id
      ORDER BY c.start_time DESC;
    `;
    const result = await db.query(query);
    return res.status(200).json({ clusters: result.rows });
  } catch (error) {
    console.error('Error in GET /clusters:', error);
    return res.status(500).json({ error: 'Failed to fetch clusters' });
  }
});

/**
 * GET /clusters/:id
 * Returns cluster detail including full article list.
 */
router.get('/:id', async (req, res) => {
  const clusterId = parseInt(req.params.id, 10);
  if (isNaN(clusterId)) {
    return res.status(400).json({ error: 'Invalid cluster ID' });
  }

  try {
    const clusterQuery = `
      SELECT 
        c.id,
        c.label,
        c.start_time AS "startTime",
        c.end_time AS "endTime",
        c.article_count AS "articleCount",
        COUNT(DISTINCT a.source)::int AS "sourceCount",
        ARRAY_AGG(DISTINCT a.source) AS "sources"
      FROM clusters c
      LEFT JOIN articles a ON a.cluster_id = c.id
      WHERE c.id = $1
      GROUP BY c.id;
    `;
    const clusterRes = await db.query(clusterQuery, [clusterId]);

    if (clusterRes.rows.length === 0) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    const cluster = clusterRes.rows[0];

    const articlesQuery = `
      SELECT 
        id,
        title,
        source,
        published_at AS "publishedAt",
        url,
        description
      FROM articles
      WHERE cluster_id = $1
      ORDER BY published_at ASC;
    `;
    const articlesRes = await db.query(articlesQuery, [clusterId]);

    cluster.articles = articlesRes.rows;

    return res.status(200).json({ cluster });
  } catch (error) {
    console.error(`Error in GET /clusters/${clusterId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch cluster detail' });
  }
});

module.exports = router;
